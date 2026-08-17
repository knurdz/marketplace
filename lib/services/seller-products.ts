import { AppwriteException, ID, Permission, Query, Role } from "node-appwrite";
import {
  BUCKET_PRODUCT_IMAGES,
  DATABASE_ID,
  IMAGE_EXTENSIONS,
  IMAGE_MIME_TYPES,
  PRODUCT_IMAGE_MAX_BYTES,
  TABLE_CATEGORIES,
  TABLE_PRODUCT_IMAGES,
  TABLE_PRODUCTS,
  hasAppwritePublicConfig,
} from "@/lib/appwrite/config";
import { ROLE_LABELS, userHasLabel } from "@/lib/appwrite/roles";
import { createPublicClient, createSessionClient } from "@/lib/appwrite/server";
import { getLoggedInUser } from "@/lib/appwrite/session";
import {
  deleteFile,
  uploadProductImage,
  validateUpload,
} from "@/lib/appwrite/storage";
import {
  assertRateLimit,
  getClientIp,
  RATE_LIMIT_MESSAGE,
  RATE_LIMITS,
} from "@/lib/security/rate-limit";
import type { Product, ProductImage, ProductStatus } from "@/lib/types";
import { asProduct, asProductImage, listProductImages } from "./products";

const DRAFT_STATUS = "draft" as const;
const ARCHIVED_STATUS = "archived" as const;
const EDITABLE_STATUSES: readonly ProductStatus[] = [
  "draft",
  "pending_review",
  "active",
  "rejected",
];
const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 10000;
const MIN_IMAGES = 1;
const MAX_IMAGES = 8;
const DEFAULT_CURRENCY = "LKR";
const MAX_LIST_LIMIT = 100;

export type CreateDraftProductInput = {
  title: string;
  description: string;
  categoryId: string;
  price: number;
  stock: number;
  imageFiles: File[];
};

export type UpdateOwnProductInput = {
  productId: string;
  title: string;
  description: string;
  categoryId: string;
  price: number;
  stock: number;
  removeImageIds: string[];
  newImageFiles: File[];
};

export type SellerProductMutationResult =
  | { ok: true; message: string; productId: string }
  | { ok: false; error: string };

type ParsedProductFields =
  | {
      ok: true;
      title: string;
      description: string;
      categoryId: string;
      price: number;
      stock: number;
    }
  | { ok: false; error: string };

type ParsedCreateDraftProduct =
  | ParsedProductFields & {
      ok: true;
      imageFiles: File[];
    }
  | { ok: false; error: string };

type ParsedUpdateOwnProduct =
  | ParsedProductFields & {
      ok: true;
      removeImageIds: string[];
      newImageFiles: File[];
    }
  | { ok: false; error: string };

function productRowPermissions(sellerId: string): string[] {
  return [
    Permission.read(Role.any()),
    Permission.read(Role.user(sellerId)),
    Permission.update(Role.user(sellerId)),
    Permission.delete(Role.user(sellerId)),
    Permission.read(Role.label("admin")),
    Permission.update(Role.label("admin")),
    Permission.delete(Role.label("admin")),
  ];
}

async function assertSellerProductCreateRateLimit(userId: string): Promise<void> {
  const ip = await getClientIp();
  const result = assertRateLimit({
    bucket: "seller.product.create",
    key: `${userId}:${ip}`,
    ...RATE_LIMITS.sellerProductCreate,
  });
  if (!result.ok) {
    throw new Error(RATE_LIMIT_MESSAGE);
  }
}

async function assertSellerProductUpdateRateLimit(userId: string): Promise<void> {
  const ip = await getClientIp();
  const result = assertRateLimit({
    bucket: "seller.product.update",
    key: `${userId}:${ip}`,
    ...RATE_LIMITS.sellerProductUpdate,
  });
  if (!result.ok) {
    throw new Error(RATE_LIMIT_MESSAGE);
  }
}

async function requireSellerUser(): Promise<
  { ok: true; userId: string } | { ok: false; error: string }
> {
  const user = await getLoggedInUser();
  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }
  if (!userHasLabel(user, ROLE_LABELS.seller)) {
    return { ok: false, error: "Only approved sellers can manage listings." };
  }
  return { ok: true, userId: user.$id };
}

function isEditableStatus(status: ProductStatus): boolean {
  return EDITABLE_STATUSES.includes(status);
}

async function categoryExists(categoryId: string): Promise<boolean> {
  const trimmed = categoryId.trim();
  if (!trimmed) return false;

  try {
    const { tables } = await createPublicClient();
    await tables.getRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_CATEGORIES,
      rowId: trimmed,
    });
    return true;
  } catch {
    return false;
  }
}

function validateNewImageFiles(
  files: File[],
): { ok: false; error: string } | File[] {
  if (files.length > MAX_IMAGES) {
    return {
      ok: false,
      error: `You can upload up to ${MAX_IMAGES} images per listing.`,
    };
  }

  for (const file of files) {
    const validated = validateUpload({
      file,
      maxBytes: PRODUCT_IMAGE_MAX_BYTES,
      allowedMime: IMAGE_MIME_TYPES,
      allowedExt: IMAGE_EXTENSIONS,
    });
    if (!validated.ok) {
      return { ok: false, error: validated.error };
    }
  }

  return files;
}

function parseProductFields(input: {
  title: string;
  description: string;
  categoryId: string;
  price: number;
  stock: number;
}): ParsedProductFields {
  const title = input.title.trim();
  if (!title) {
    return { ok: false, error: "Title is required." };
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return {
      ok: false,
      error: `Title must be at most ${MAX_TITLE_LENGTH} characters.`,
    };
  }

  const description = input.description.trim();
  if (!description) {
    return { ok: false, error: "Description is required." };
  }
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return {
      ok: false,
      error: `Description must be at most ${MAX_DESCRIPTION_LENGTH} characters.`,
    };
  }

  const categoryId = input.categoryId.trim();
  if (!categoryId) {
    return { ok: false, error: "Category is required." };
  }

  const price = input.price;
  if (!Number.isFinite(price) || price < 0) {
    return { ok: false, error: "Price must be zero or greater." };
  }

  const stock = input.stock;
  if (!Number.isInteger(stock) || stock < 0) {
    return { ok: false, error: "Stock must be a whole number zero or greater." };
  }

  return {
    ok: true,
    title,
    description,
    categoryId,
    price,
    stock,
  };
}

function validateImageFiles(files: File[]): ParsedCreateDraftProduct | File[] {
  if (files.length < MIN_IMAGES) {
    return { ok: false, error: "Add at least one product image." };
  }
  if (files.length > MAX_IMAGES) {
    return {
      ok: false,
      error: `You can upload up to ${MAX_IMAGES} images per listing.`,
    };
  }

  for (const file of files) {
    const validated = validateUpload({
      file,
      maxBytes: PRODUCT_IMAGE_MAX_BYTES,
      allowedMime: IMAGE_MIME_TYPES,
      allowedExt: IMAGE_EXTENSIONS,
    });
    if (!validated.ok) {
      return { ok: false, error: validated.error };
    }
  }

  return files;
}

/** Parse and validate create-draft fields (no I/O). */
export function parseCreateDraftProductInput(
  input: CreateDraftProductInput,
): ParsedCreateDraftProduct {
  const fields = parseProductFields(input);
  if (!fields.ok) {
    return { ok: false, error: fields.error };
  }

  const imageResult = validateImageFiles(input.imageFiles);
  if (!Array.isArray(imageResult)) {
    return imageResult;
  }

  return {
    ok: true,
    title: fields.title,
    description: fields.description,
    categoryId: fields.categoryId,
    price: fields.price,
    stock: fields.stock,
    imageFiles: imageResult,
  };
}

/** Parse and validate update fields + image delta (no I/O). */
export function parseUpdateOwnProductInput(
  input: UpdateOwnProductInput,
  existingImageCount: number,
): ParsedUpdateOwnProduct {
  const productId = input.productId?.trim();
  if (!productId) {
    return { ok: false, error: "Listing id is required." };
  }

  const fields = parseProductFields(input);
  if (!fields.ok) {
    return { ok: false, error: fields.error };
  }

  const removeImageIds = input.removeImageIds
    .map((id) => id.trim())
    .filter((id) => id.length > 0);
  const uniqueRemove = [...new Set(removeImageIds)];

  if (uniqueRemove.length > existingImageCount) {
    return { ok: false, error: "Invalid image selection." };
  }

  const newImageResult = validateNewImageFiles(input.newImageFiles);
  if (!Array.isArray(newImageResult)) {
    return { ok: false, error: newImageResult.error };
  }

  const finalCount =
    existingImageCount - uniqueRemove.length + newImageResult.length;
  if (finalCount < MIN_IMAGES) {
    return { ok: false, error: "Keep at least one product image." };
  }
  if (finalCount > MAX_IMAGES) {
    return {
      ok: false,
      error: `You can have up to ${MAX_IMAGES} images per listing.`,
    };
  }

  return {
    ok: true,
    title: fields.title,
    description: fields.description,
    categoryId: fields.categoryId,
    price: fields.price,
    stock: fields.stock,
    removeImageIds: uniqueRemove,
    newImageFiles: newImageResult,
  };
}

/** Load one product owned by the signed-in seller. */
export async function getOwnSellerProduct(productId: string): Promise<Product | null> {
  if (!hasAppwritePublicConfig()) return null;

  const auth = await requireSellerUser();
  if (!auth.ok) return null;

  const trimmed = productId?.trim();
  if (!trimmed) return null;

  try {
    const { tables } = await createSessionClient();
    const row = await tables.getRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PRODUCTS,
      rowId: trimmed,
    });
    const product = asProduct(row as unknown as Record<string, unknown>);
    if (!product || product.sellerId !== auth.userId) return null;
    return product;
  } catch {
    return null;
  }
}

async function listOwnProductImageRows(productId: string): Promise<ProductImage[]> {
  const images = await listProductImages(productId);
  return images.filter((img) => img.productId === productId);
}

async function deleteOwnProductImageRow(
  tables: Awaited<ReturnType<typeof createSessionClient>>["tables"],
  imageRow: ProductImage,
): Promise<void> {
  await tables.deleteRow({
    databaseId: DATABASE_ID,
    tableId: TABLE_PRODUCT_IMAGES,
    rowId: imageRow.$id,
  });
  try {
    await deleteFile(BUCKET_PRODUCT_IMAGES, imageRow.fileId);
  } catch {
    // Best-effort storage cleanup.
  }
}

/** List products owned by the signed-in seller (includes drafts and seed SKUs). */
export async function listOwnSellerProducts(): Promise<Product[]> {
  if (!hasAppwritePublicConfig()) return [];

  const user = await getLoggedInUser();
  if (!user || !userHasLabel(user, ROLE_LABELS.seller)) return [];

  try {
    const { tables } = await createSessionClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_PRODUCTS,
      queries: [
        Query.equal("sellerId", user.$id),
        Query.orderDesc("$createdAt"),
        Query.limit(MAX_LIST_LIMIT),
      ],
    });

    const products: Product[] = [];
    for (const row of result.rows) {
      const product = asProduct(row as unknown as Record<string, unknown>);
      if (product && product.sellerId === user.$id) {
        products.push(product);
      }
    }
    return products;
  } catch {
    return [];
  }
}

/**
 * Create a draft product with images for the signed-in seller only.
 * sellerId and status are never taken from the client.
 */
export async function createDraftProductCore(
  input: CreateDraftProductInput,
): Promise<SellerProductMutationResult> {
  if (!hasAppwritePublicConfig()) {
    return { ok: false, error: "Marketplace is not configured." };
  }

  const user = await getLoggedInUser();
  if (!user) {
    return { ok: false, error: "You must be signed in to create a listing." };
  }
  if (!userHasLabel(user, ROLE_LABELS.seller)) {
    return { ok: false, error: "Only approved sellers can create listings." };
  }

  const parsed = parseCreateDraftProductInput(input);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }

  if (!(await categoryExists(parsed.categoryId))) {
    return { ok: false, error: "Choose a valid category." };
  }

  try {
    await assertSellerProductCreateRateLimit(user.$id);
  } catch (error) {
    if (error instanceof Error && error.message === RATE_LIMIT_MESSAGE) {
      return { ok: false, error: RATE_LIMIT_MESSAGE };
    }
    return { ok: false, error: "Could not create listing. Please try again." };
  }

  const sellerId = user.$id;
  const isFree = parsed.price === 0;
  const permissions = productRowPermissions(sellerId);
  const uploadedFileIds: string[] = [];

  let productId: string | null = null;

  try {
    const { tables } = await createSessionClient();
    const productRow = await tables.createRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PRODUCTS,
      rowId: ID.unique(),
      data: {
        sellerId,
        categoryId: parsed.categoryId,
        title: parsed.title,
        description: parsed.description,
        price: parsed.price,
        isFree,
        status: DRAFT_STATUS,
        stock: parsed.stock,
        available: true,
        currency: DEFAULT_CURRENCY,
      },
      permissions,
    });

    const product = asProduct(
      productRow as unknown as Record<string, unknown>,
    );
    if (!product || product.sellerId !== sellerId) {
      return {
        ok: false,
        error: "Listing was created but could not be verified.",
      };
    }
    productId = product.$id;

    for (let i = 0; i < parsed.imageFiles.length; i += 1) {
      const file = parsed.imageFiles[i];
      const { fileId } = await uploadProductImage(file);
      uploadedFileIds.push(fileId);

      await tables.createRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_PRODUCT_IMAGES,
        rowId: ID.unique(),
        data: {
          productId: product.$id,
          fileId,
          sortOrder: i,
          alt: null,
        },
        permissions,
      });
    }

    return {
      ok: true,
      message: "Draft listing saved. Publishing comes in a later step.",
      productId: product.$id,
    };
  } catch (error) {
    for (const fileId of uploadedFileIds) {
      try {
        await deleteFile(BUCKET_PRODUCT_IMAGES, fileId);
      } catch {
        // Best-effort orphan cleanup.
      }
    }

    if (error instanceof Error && error.message === RATE_LIMIT_MESSAGE) {
      return { ok: false, error: RATE_LIMIT_MESSAGE };
    }
    if (error instanceof AppwriteException) {
      if (error.code === 401) {
        return { ok: false, error: "Not allowed to create this listing." };
      }
      if (error.code === 409) {
        return {
          ok: false,
          error: "Could not create listing due to a conflict. Try again.",
        };
      }
    }
    if (productId) {
      return {
        ok: false,
        error:
          "Draft listing was saved but some images failed. Open listings and try again later.",
      };
    }
    if (error instanceof Error && !(error instanceof AppwriteException)) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "Could not create listing. Please try again." };
  }
}

/**
 * Update own non-archived product fields and optional image gallery changes.
 * Never changes status, sellerId (from client), currency, or available.
 */
export async function updateOwnProductCore(
  input: UpdateOwnProductInput,
): Promise<SellerProductMutationResult> {
  if (!hasAppwritePublicConfig()) {
    return { ok: false, error: "Marketplace is not configured." };
  }

  const auth = await requireSellerUser();
  if (!auth.ok) return { ok: false, error: auth.error };

  const product = await getOwnSellerProduct(input.productId);
  if (!product) {
    return { ok: false, error: "Listing not found." };
  }
  if (product.status === ARCHIVED_STATUS) {
    return { ok: false, error: "Archived listings cannot be edited." };
  }
  if (!isEditableStatus(product.status)) {
    return {
      ok: false,
      error: `Listing status ${product.status} cannot be edited.`,
    };
  }

  const existingImages = await listOwnProductImageRows(product.$id);
  const parsed = parseUpdateOwnProductInput(input, existingImages.length);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const removeSet = new Set(parsed.removeImageIds);
  const imagesToRemove = existingImages.filter((img) => removeSet.has(img.$id));
  if (imagesToRemove.length !== removeSet.size) {
    return { ok: false, error: "Invalid image selection." };
  }

  if (!(await categoryExists(parsed.categoryId))) {
    return { ok: false, error: "Choose a valid category." };
  }

  try {
    await assertSellerProductUpdateRateLimit(auth.userId);
  } catch (error) {
    if (error instanceof Error && error.message === RATE_LIMIT_MESSAGE) {
      return { ok: false, error: RATE_LIMIT_MESSAGE };
    }
    return { ok: false, error: "Could not update listing. Please try again." };
  }

  const sellerId = auth.userId;
  const permissions = productRowPermissions(sellerId);
  const uploadedFileIds: string[] = [];

  try {
    const { tables } = await createSessionClient();
    const isFree = parsed.price === 0;

    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PRODUCTS,
      rowId: product.$id,
      data: {
        sellerId,
        categoryId: parsed.categoryId,
        title: parsed.title,
        description: parsed.description,
        price: parsed.price,
        isFree,
        stock: parsed.stock,
      },
    });

    for (const imageRow of imagesToRemove) {
      await deleteOwnProductImageRow(tables, imageRow);
    }

    const remaining = existingImages
      .filter((img) => !removeSet.has(img.$id))
      .sort((a, b) => a.sortOrder - b.sortOrder);

    for (let i = 0; i < remaining.length; i += 1) {
      if (remaining[i].sortOrder !== i) {
        await tables.updateRow({
          databaseId: DATABASE_ID,
          tableId: TABLE_PRODUCT_IMAGES,
          rowId: remaining[i].$id,
          data: {
            productId: product.$id,
            fileId: remaining[i].fileId,
            sortOrder: i,
            alt: remaining[i].alt,
          },
        });
      }
    }

    let nextSortOrder = remaining.length;
    for (const file of parsed.newImageFiles) {
      const { fileId } = await uploadProductImage(file);
      uploadedFileIds.push(fileId);
      await tables.createRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_PRODUCT_IMAGES,
        rowId: ID.unique(),
        data: {
          productId: product.$id,
          fileId,
          sortOrder: nextSortOrder,
          alt: null,
        },
        permissions,
      });
      nextSortOrder += 1;
    }

    return {
      ok: true,
      message: "Listing updated.",
      productId: product.$id,
    };
  } catch (error) {
    for (const fileId of uploadedFileIds) {
      try {
        await deleteFile(BUCKET_PRODUCT_IMAGES, fileId);
      } catch {
        // Best-effort orphan cleanup.
      }
    }

    if (error instanceof Error && error.message === RATE_LIMIT_MESSAGE) {
      return { ok: false, error: RATE_LIMIT_MESSAGE };
    }
    if (error instanceof AppwriteException) {
      if (error.code === 401 || error.code === 404) {
        return { ok: false, error: "Not allowed to update this listing." };
      }
    }
    if (error instanceof Error && !(error instanceof AppwriteException)) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "Could not update listing. Please try again." };
  }
}

/** Archive own listing (soft takedown). Idempotent if already archived. */
export async function archiveOwnProductCore(
  productId: string,
): Promise<SellerProductMutationResult> {
  if (!hasAppwritePublicConfig()) {
    return { ok: false, error: "Marketplace is not configured." };
  }

  const auth = await requireSellerUser();
  if (!auth.ok) return { ok: false, error: auth.error };

  const trimmed = productId?.trim();
  if (!trimmed) {
    return { ok: false, error: "Listing id is required." };
  }

  const product = await getOwnSellerProduct(trimmed);
  if (!product) {
    return { ok: false, error: "Listing not found." };
  }

  if (product.status === ARCHIVED_STATUS) {
    return {
      ok: true,
      message: "Listing is already archived.",
      productId: product.$id,
    };
  }

  try {
    await assertSellerProductUpdateRateLimit(auth.userId);
  } catch (error) {
    if (error instanceof Error && error.message === RATE_LIMIT_MESSAGE) {
      return { ok: false, error: RATE_LIMIT_MESSAGE };
    }
    return { ok: false, error: "Could not archive listing. Please try again." };
  }

  try {
    const { tables } = await createSessionClient();
    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PRODUCTS,
      rowId: product.$id,
      data: {
        sellerId: auth.userId,
        status: ARCHIVED_STATUS,
      },
    });

    return {
      ok: true,
      message: "Listing archived and removed from the storefront.",
      productId: product.$id,
    };
  } catch (error) {
    if (error instanceof AppwriteException) {
      if (error.code === 401 || error.code === 404) {
        return { ok: false, error: "Not allowed to archive this listing." };
      }
    }
    return { ok: false, error: "Could not archive listing. Please try again." };
  }
}
