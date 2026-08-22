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
import { createSessionClient } from "@/lib/appwrite/server";
import { getLoggedInUser } from "@/lib/appwrite/session";
import {
  deleteFile,
  uploadProductImage,
  validateUpload,
} from "@/lib/appwrite/storage";
import {
  assertRateLimit,
  RATE_LIMIT_MESSAGE,
  RATE_LIMITS,
} from "@/lib/security/rate-limit";
import type { Product, ProductImage, ProductStatus } from "@/lib/types";
import {
  ARCHIVED_PRODUCT_STATUS,
  DRAFT_PRODUCT_STATUS,
  PENDING_REVIEW_PRODUCT_STATUS,
  REJECTED_PRODUCT_STATUS,
} from "@/lib/types/status";
import { asProduct, asProductImage, listProductImages } from "./products";
import { areFreeListingsEnabled } from "./platform-settings";

const DEFAULT_CURRENCY = "LKR";
const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 10000;
const MAX_IMAGES = 8;
const FREE_LISTINGS_DISABLED =
  "Free listings are currently disabled." as const;

export type CreateDraftProductInput = {
  title: string;
  description: string;
  categoryId: string;
  price: unknown;
  stock: unknown;
  available?: unknown;
};

export type UpdateOwnProductInput = CreateDraftProductInput & {
  available?: unknown;
};

export type CreateDraftProductResult =
  | { ok: true; message: string; productId: string }
  | { ok: false; error: string };

export type SubmitListingForReviewResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

export type SellerListingMutationResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

export type ParsedCreateDraftProductInput =
  | {
      ok: true;
      title: string;
      description: string;
      categoryId: string;
      price: number;
      stock: number;
      isFree: boolean;
    }
  | { ok: false; error: string };

function productPermissions(sellerId: string): string[] {
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

function productImagePermissions(sellerId: string): string[] {
  return [
    Permission.read(Role.any()),
    Permission.update(Role.user(sellerId)),
    Permission.delete(Role.user(sellerId)),
    Permission.read(Role.label("admin")),
    Permission.update(Role.label("admin")),
    Permission.delete(Role.label("admin")),
  ];
}

type FieldParseError = { ok: false; error: string };

function parsePrice(raw: unknown): number | FieldParseError {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    if (raw < 0) return { ok: false, error: "Price cannot be negative." };
    return raw;
  }
  if (typeof raw === "string" && raw.trim() !== "") {
    const n = Number(raw.trim());
    if (!Number.isFinite(n)) {
      return { ok: false, error: "Price must be a number." };
    }
    if (n < 0) return { ok: false, error: "Price cannot be negative." };
    return n;
  }
  return { ok: false, error: "Price is required." };
}

export function parseAvailableFlag(raw: unknown): boolean {
  return raw === true || raw === "on" || raw === "true" || raw === "1";
}

function parseStock(raw: unknown): number | FieldParseError {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    if (!Number.isInteger(raw) || raw < 0) {
      return { ok: false, error: "Stock must be a whole number ≥ 0." };
    }
    return raw;
  }
  if (typeof raw === "string" && raw.trim() !== "") {
    const n = Number(raw.trim());
    if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) {
      return { ok: false, error: "Stock must be a whole number ≥ 0." };
    }
    return n;
  }
  return { ok: false, error: "Stock is required." };
}

/** Validate create-listing fields (no I/O). Ignores sellerId/status — set server-side only. */
export function parseCreateDraftProductInput(
  input: CreateDraftProductInput & {
    sellerId?: unknown;
    status?: unknown;
  },
): ParsedCreateDraftProductInput {
  if (input.sellerId !== undefined) {
    return { ok: false, error: "sellerId cannot be set from the form." };
  }
  if (input.status !== undefined) {
    return { ok: false, error: "status cannot be set from the form." };
  }

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

  const price = parsePrice(input.price);
  if (typeof price !== "number") return price;

  const stock = parseStock(input.stock);
  if (typeof stock !== "number") return stock;

  return {
    ok: true,
    title,
    description,
    categoryId,
    price,
    stock,
    isFree: price === 0,
  };
}

async function categoryExists(categoryId: string): Promise<boolean> {
  try {
    const { tables } = await createSessionClient();
    await tables.getRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_CATEGORIES,
      rowId: categoryId,
    });
    return true;
  } catch {
    return false;
  }
}

function validateImageFiles(files: File[]): { ok: true; files: File[] } | { ok: false; error: string } {
  if (files.length > MAX_IMAGES) {
    return {
      ok: false,
      error: `At most ${MAX_IMAGES} images allowed.`,
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
  return { ok: true, files };
}

async function cleanupUploadedFiles(fileIds: string[]): Promise<void> {
  for (const fileId of fileIds) {
    try {
      await deleteFile(BUCKET_PRODUCT_IMAGES, fileId);
    } catch {
      // Best-effort cleanup.
    }
  }
}

type SellerAuth =
  | { ok: true; userId: string }
  | { ok: false; error: string };

async function requireSellerUser(): Promise<SellerAuth> {
  if (!hasAppwritePublicConfig()) {
    return { ok: false, error: "Marketplace is not configured." };
  }

  const user = await getLoggedInUser();
  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }
  if (!userHasLabel(user, ROLE_LABELS.seller)) {
    return { ok: false, error: "Seller access is required." };
  }

  return { ok: true, userId: user.$id };
}

function parseProductId(productId: string): string | null {
  const trimmed = productId?.trim();
  return trimmed ? trimmed : null;
}

/** Trim listing id from form/route input; empty → null. */
export function parseSellerListingId(productId: string): string | null {
  return parseProductId(productId);
}

/** Load a product only when owned by the signed-in seller. */
export async function getOwnProduct(productId: string): Promise<Product | null> {
  const id = parseProductId(productId);
  if (!id) return null;

  const auth = await requireSellerUser();
  if (!auth.ok) return null;

  try {
    const { tables } = await createSessionClient();
    const row = await tables.getRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PRODUCTS,
      rowId: id,
    });
    const product = asProduct(row as unknown as Record<string, unknown>);
    if (!product || product.sellerId !== auth.userId) return null;
    return product;
  } catch {
    return null;
  }
}

async function loadOwnedProductForMutation(
  productId: string,
): Promise<
  | { ok: true; userId: string; product: Product }
  | { ok: false; error: string }
> {
  const auth = await requireSellerUser();
  if (!auth.ok) return auth;

  const id = parseProductId(productId);
  if (!id) {
    return { ok: false, error: "Listing not found." };
  }

  try {
    const { tables } = await createSessionClient();
    const row = await tables.getRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PRODUCTS,
      rowId: id,
    });
    const product = asProduct(row as unknown as Record<string, unknown>);
    if (!product || product.sellerId !== auth.userId) {
      return { ok: false, error: "Listing not found." };
    }
    return { ok: true, userId: auth.userId, product };
  } catch (error) {
    if (error instanceof AppwriteException && error.code === 404) {
      return { ok: false, error: "Listing not found." };
    }
    return { ok: false, error: "Could not load listing." };
  }
}

function archivedMutationError(): SellerListingMutationResult {
  return {
    ok: false,
    error: "Archived listings cannot be changed.",
  };
}

/**
 * Update listing fields for the signed-in seller. Does not change status or sellerId.
 */
export async function updateOwnProductCore(
  productId: string,
  input: UpdateOwnProductInput,
): Promise<SellerListingMutationResult> {
  const auth = await requireSellerUser();
  if (!auth.ok) return auth;

  const rate = assertRateLimit({
    bucket: "listings.update",
    key: `user:${auth.userId}`,
    ...RATE_LIMITS.listings,
  });
  if (!rate.ok) {
    return { ok: false, error: RATE_LIMIT_MESSAGE };
  }

  const loaded = await loadOwnedProductForMutation(productId);
  if (!loaded.ok) return loaded;

  if (loaded.product.status === ARCHIVED_PRODUCT_STATUS) {
    return archivedMutationError();
  }

  const parsed = parseCreateDraftProductInput(input);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }

  if (parsed.isFree && !(await areFreeListingsEnabled())) {
    return { ok: false, error: FREE_LISTINGS_DISABLED };
  }

  if (!(await categoryExists(parsed.categoryId))) {
    return { ok: false, error: "Selected category was not found." };
  }

  try {
    const { tables } = await createSessionClient();
    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PRODUCTS,
      rowId: loaded.product.$id,
      data: {
        categoryId: parsed.categoryId,
        title: parsed.title,
        description: parsed.description,
        price: parsed.price,
        isFree: parsed.isFree,
        stock: parsed.stock,
        available: parseAvailableFlag(input.available),
      },
    });

    return { ok: true, message: "Listing updated." };
  } catch (error) {
    if (error instanceof AppwriteException && error.code === 401) {
      return { ok: false, error: "You must be signed in." };
    }
    return { ok: false, error: "Could not update listing. Please try again." };
  }
}

/**
 * Archive an owned listing (any non-archived status → archived).
 * Idempotent when already archived.
 */
export async function archiveOwnProductCore(
  productId: string,
): Promise<SellerListingMutationResult> {
  const auth = await requireSellerUser();
  if (!auth.ok) return auth;

  const rate = assertRateLimit({
    bucket: "listings.archive",
    key: `user:${auth.userId}`,
    ...RATE_LIMITS.listings,
  });
  if (!rate.ok) {
    return { ok: false, error: RATE_LIMIT_MESSAGE };
  }

  const loaded = await loadOwnedProductForMutation(productId);
  if (!loaded.ok) return loaded;

  if (loaded.product.status === ARCHIVED_PRODUCT_STATUS) {
    return { ok: true, message: "Listing is already archived." };
  }

  try {
    const { tables } = await createSessionClient();
    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PRODUCTS,
      rowId: loaded.product.$id,
      data: { status: ARCHIVED_PRODUCT_STATUS },
    });

    return { ok: true, message: "Listing archived." };
  } catch (error) {
    if (error instanceof AppwriteException && error.code === 401) {
      return { ok: false, error: "You must be signed in." };
    }
    return { ok: false, error: "Could not archive listing. Please try again." };
  }
}

/**
 * Add images to an owned listing (up to 8 total).
 */
export async function addOwnProductImagesCore(
  productId: string,
  imageFiles: File[],
): Promise<SellerListingMutationResult> {
  const auth = await requireSellerUser();
  if (!auth.ok) return auth;

  const rate = assertRateLimit({
    bucket: "listings.images",
    key: `user:${auth.userId}`,
    ...RATE_LIMITS.listings,
  });
  if (!rate.ok) {
    return { ok: false, error: RATE_LIMIT_MESSAGE };
  }

  const loaded = await loadOwnedProductForMutation(productId);
  if (!loaded.ok) return loaded;

  if (loaded.product.status === ARCHIVED_PRODUCT_STATUS) {
    return archivedMutationError();
  }

  const nonEmptyImages = imageFiles.filter((f) => f.size > 0);
  if (nonEmptyImages.length === 0) {
    return { ok: false, error: "Select at least one image to upload." };
  }

  const existing = await listProductImages(loaded.product.$id);
  if (existing.length + nonEmptyImages.length > MAX_IMAGES) {
    return {
      ok: false,
      error: `At most ${MAX_IMAGES} images allowed (${existing.length} already uploaded).`,
    };
  }

  const imageCheck = validateImageFiles(nonEmptyImages);
  if (!imageCheck.ok) {
    return { ok: false, error: imageCheck.error };
  }

  const uploadedFileIds: string[] = [];
  const imagePerms = productImagePermissions(auth.userId);
  const nextSortOrder =
    existing.reduce((max, image) => Math.max(max, image.sortOrder), -1) + 1;

  try {
    const { tables } = await createSessionClient();
    for (let i = 0; i < imageCheck.files.length; i++) {
      const file = imageCheck.files[i]!;
      const { fileId } = await uploadProductImage(file);
      uploadedFileIds.push(fileId);

      await tables.createRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_PRODUCT_IMAGES,
        rowId: ID.unique(),
        data: {
          productId: loaded.product.$id,
          fileId,
          sortOrder: nextSortOrder + i,
          alt: loaded.product.title.slice(0, 200),
        },
        permissions: imagePerms,
      });
    }

    return { ok: true, message: "Images added." };
  } catch (error) {
    await cleanupUploadedFiles(uploadedFileIds);

    if (error instanceof Error && !(error instanceof AppwriteException)) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "Could not upload images. Please try again." };
  }
}

async function loadOwnedProductImage(
  productId: string,
  imageRowId: string,
): Promise<
  | { ok: true; userId: string; product: Product; image: ProductImage }
  | { ok: false; error: string }
> {
  const loaded = await loadOwnedProductForMutation(productId);
  if (!loaded.ok) return loaded;

  const imageId = parseProductId(imageRowId);
  if (!imageId) {
    return { ok: false, error: "Image not found." };
  }

  try {
    const { tables } = await createSessionClient();
    const row = await tables.getRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PRODUCT_IMAGES,
      rowId: imageId,
    });
    const image = asProductImage(row as unknown as Record<string, unknown>);
    if (!image || image.productId !== loaded.product.$id) {
      return { ok: false, error: "Image not found." };
    }

    return {
      ok: true,
      userId: loaded.userId,
      product: loaded.product,
      image,
    };
  } catch (error) {
    if (error instanceof AppwriteException && error.code === 404) {
      return { ok: false, error: "Image not found." };
    }
    return { ok: false, error: "Could not load image." };
  }
}

/**
 * Delete one image from an owned listing (row + storage file).
 */
export async function deleteOwnProductImageCore(
  productId: string,
  imageRowId: string,
): Promise<SellerListingMutationResult> {
  const auth = await requireSellerUser();
  if (!auth.ok) return auth;

  const rate = assertRateLimit({
    bucket: "listings.images",
    key: `user:${auth.userId}`,
    ...RATE_LIMITS.listings,
  });
  if (!rate.ok) {
    return { ok: false, error: RATE_LIMIT_MESSAGE };
  }

  const loaded = await loadOwnedProductImage(productId, imageRowId);
  if (!loaded.ok) return loaded;

  if (loaded.product.status === ARCHIVED_PRODUCT_STATUS) {
    return archivedMutationError();
  }

  try {
    const { tables } = await createSessionClient();
    await tables.deleteRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PRODUCT_IMAGES,
      rowId: loaded.image.$id,
    });
  } catch (error) {
    if (error instanceof AppwriteException && error.code === 404) {
      return { ok: false, error: "Image not found." };
    }
    return { ok: false, error: "Could not delete image." };
  }

  try {
    await deleteFile(BUCKET_PRODUCT_IMAGES, loaded.image.fileId);
  } catch {
    // Row deleted; storage cleanup is best-effort.
  }

  return { ok: true, message: "Image removed." };
}

/**
 * Create a draft product for the signed-in seller. sellerId and status are forced server-side.
 */
export async function createDraftProductCore(
  input: CreateDraftProductInput,
  imageFiles: File[] = [],
): Promise<CreateDraftProductResult> {
  if (!hasAppwritePublicConfig()) {
    return { ok: false, error: "Marketplace is not configured." };
  }

  const user = await getLoggedInUser();
  if (!user) {
    return { ok: false, error: "You must be signed in to create a listing." };
  }
  if (!userHasLabel(user, ROLE_LABELS.seller)) {
    return { ok: false, error: "Seller access is required to create listings." };
  }

  const rate = assertRateLimit({
    bucket: "listings.create",
    key: `user:${user.$id}`,
    ...RATE_LIMITS.listings,
  });
  if (!rate.ok) {
    return { ok: false, error: RATE_LIMIT_MESSAGE };
  }

  const parsed = parseCreateDraftProductInput(input);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }

  if (parsed.isFree && !(await areFreeListingsEnabled())) {
    return { ok: false, error: FREE_LISTINGS_DISABLED };
  }

  const nonEmptyImages = imageFiles.filter((f) => f.size > 0);
  const imageCheck = validateImageFiles(nonEmptyImages);
  if (!imageCheck.ok) {
    return { ok: false, error: imageCheck.error };
  }

  if (!(await categoryExists(parsed.categoryId))) {
    return { ok: false, error: "Selected category was not found." };
  }

  const sellerId = user.$id;
  const permissions = productPermissions(sellerId);
  const uploadedFileIds: string[] = [];

  try {
    const { tables } = await createSessionClient();
    const row = await tables.createRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PRODUCTS,
      rowId: ID.unique(),
      data: {
        sellerId,
        categoryId: parsed.categoryId,
        title: parsed.title,
        description: parsed.description,
        price: parsed.price,
        isFree: parsed.isFree,
        status: DRAFT_PRODUCT_STATUS,
        stock: parsed.stock,
        available:
          input.available === undefined
            ? true
            : parseAvailableFlag(input.available),
        currency: DEFAULT_CURRENCY,
      },
      permissions,
    });

    const product = asProduct(row as unknown as Record<string, unknown>);
    if (
      !product ||
      product.sellerId !== sellerId ||
      product.status !== DRAFT_PRODUCT_STATUS
    ) {
      return {
        ok: false,
        error: "Listing was created but could not be verified.",
      };
    }

    const imagePerms = productImagePermissions(sellerId);
    for (let i = 0; i < imageCheck.files.length; i++) {
      const file = imageCheck.files[i]!;
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
          alt: parsed.title.slice(0, 200),
        },
        permissions: imagePerms,
      });
    }

    return {
      ok: true,
      message: "Draft listing saved.",
      productId: product.$id,
    };
  } catch (error) {
    await cleanupUploadedFiles(uploadedFileIds);

    if (error instanceof AppwriteException) {
      if (error.code === 401) {
        return { ok: false, error: "You must be signed in to create a listing." };
      }
    }
    if (error instanceof Error && !(error instanceof AppwriteException)) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "Could not save listing. Please try again." };
  }
}

/** List products owned by the signed-in seller (any status). */
export async function listOwnProducts(opts?: {
  limit?: number;
}): Promise<Product[]> {
  if (!hasAppwritePublicConfig()) return [];

  const user = await getLoggedInUser();
  if (!user || !userHasLabel(user, ROLE_LABELS.seller)) return [];

  const limit = Math.min(Math.max(opts?.limit ?? 50, 1), 100);

  try {
    const { tables } = await createSessionClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_PRODUCTS,
      queries: [
        Query.equal("sellerId", user.$id),
        Query.orderDesc("$createdAt"),
        Query.limit(limit),
      ],
    });

    const out: Product[] = [];
    for (const row of result.rows) {
      const product = asProduct(row as unknown as Record<string, unknown>);
      if (product && product.sellerId === user.$id) {
        out.push(product);
      }
    }
    return out;
  } catch {
    return [];
  }
}

/** Image counts for seller-owned products (caller must pass rows from listOwnProducts). */
export async function countProductImagesForOwnProducts(
  products: Product[],
): Promise<Map<string, number>> {
  const user = await getLoggedInUser();
  const counts = new Map<string, number>();
  if (!user || !userHasLabel(user, ROLE_LABELS.seller)) {
    return counts;
  }

  const owned = products.filter((p) => p.sellerId === user.$id);
  await Promise.all(
    owned.map(async (product) => {
      const images = await listProductImages(product.$id);
      counts.set(product.$id, images.length);
    }),
  );

  return counts;
}

/** Whether a seller may submit this listing for admin review. */
export function canSubmitListingForReview(status: ProductStatus): boolean {
  return status === DRAFT_PRODUCT_STATUS || status === REJECTED_PRODUCT_STATUS;
}

async function loadOwnProduct(
  productId: string,
  sellerId: string,
): Promise<Product | null> {
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
    if (!product || product.sellerId !== sellerId) return null;
    return product;
  } catch {
    return null;
  }
}

/**
 * Submit an own draft or rejected listing for admin moderation.
 * Sellers never write active — only pending_review.
 */
export async function submitListingForReviewCore(
  productId: string,
): Promise<SubmitListingForReviewResult> {
  if (!hasAppwritePublicConfig()) {
    return { ok: false, error: "Marketplace is not configured." };
  }

  const user = await getLoggedInUser();
  if (!user) {
    return { ok: false, error: "You must be signed in to submit a listing." };
  }
  if (!userHasLabel(user, ROLE_LABELS.seller)) {
    return { ok: false, error: "Seller access is required to submit listings." };
  }

  const rate = assertRateLimit({
    bucket: "listings.publish",
    key: `user:${user.$id}`,
    ...RATE_LIMITS.listings,
  });
  if (!rate.ok) {
    return { ok: false, error: RATE_LIMIT_MESSAGE };
  }

  const product = await loadOwnProduct(productId, user.$id);
  if (!product) {
    return { ok: false, error: "Listing not found." };
  }

  if (product.status === PENDING_REVIEW_PRODUCT_STATUS) {
    return {
      ok: true,
      message: `"${product.title}" is already awaiting review.`,
    };
  }

  if (!canSubmitListingForReview(product.status)) {
    return {
      ok: false,
      error: `Listing is ${product.status}. Only drafts and rejected listings can be submitted.`,
    };
  }

  try {
    const { tables } = await createSessionClient();
    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PRODUCTS,
      rowId: product.$id,
      data: { status: PENDING_REVIEW_PRODUCT_STATUS },
    });
  } catch {
    return { ok: false, error: "Could not submit listing. Please try again." };
  }

  return {
    ok: true,
    message: `"${product.title}" submitted for review. An admin will approve it before it goes live.`,
  };
}
