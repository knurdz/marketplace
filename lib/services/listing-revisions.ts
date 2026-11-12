import { and, desc, eq, inArray, or, sql, type SQL } from "drizzle-orm";
import {
  BUCKET_PRODUCT_IMAGES,
  DATABASE_ID,
  TABLE_PRODUCT_IMAGES,
  TABLE_PRODUCT_REVISIONS,
  TABLE_PRODUCTS,
  hasDatabaseConfig,
} from "@/lib/backend/config";
import { createAdminClient, createSessionClient } from "@/lib/backend/server";
import { deleteFileAsAdmin } from "@/lib/backend/storage";
import { notifyAdminsEvent } from "@/lib/email/events";
import { getDb } from "@/lib/db/client";
import { productRevisions, products } from "@/lib/db/schema";
import { ID, Query } from "@/lib/db/compat";
import { assertAdminUser } from "@/lib/security/admin-auth";
import type { Product, ProductImage } from "@/lib/types";
import type {
  ModerationQueueItem,
  ModerationQueueKind,
  ProductRevision,
  ProductRevisionPatch,
  RevisionImagePatch,
} from "@/lib/types/listing-revision";
import {
  ACTIVE_PRODUCT_STATUS,
  PENDING_REVIEW_PRODUCT_STATUS,
} from "@/lib/types/status";
import { asProduct } from "./products";
import { writeAuditLog } from "./audit-logs";

const DEFAULT_PAGE_SIZE = 24;
const MAX_PAGE_SIZE = 100;

export type ListingRevisionMutationResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

function parsePatchJson(raw: unknown): ProductRevisionPatch | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    return parsed as ProductRevisionPatch;
  } catch {
    return null;
  }
}

export function asProductRevision(
  row: Record<string, unknown>,
): ProductRevision | null {
  const $id = typeof row.$id === "string" ? row.$id : typeof row.id === "string" ? row.id : null;
  const productId =
    typeof row.productId === "string"
      ? row.productId
      : typeof row.product_id === "string"
        ? row.product_id
        : null;
  if (!$id || !productId) return null;

  const patch =
    typeof row.patch === "string"
      ? parsePatchJson(row.patch)
      : row.patch && typeof row.patch === "object"
        ? (row.patch as ProductRevisionPatch)
        : null;
  if (!patch) return null;

  return {
    $id,
    productId,
    patch,
    $createdAt:
      typeof row.$createdAt === "string"
        ? row.$createdAt
        : row.createdAt instanceof Date
          ? row.createdAt.toISOString()
          : undefined,
    $updatedAt:
      typeof row.$updatedAt === "string"
        ? row.$updatedAt
        : row.updatedAt instanceof Date
          ? row.updatedAt.toISOString()
          : undefined,
  };
}

export function liveImagesToRevisionPatch(
  images: ProductImage[],
): RevisionImagePatch[] {
  return [...images]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((img) => ({
      fileId: img.fileId,
      sortOrder: img.sortOrder,
      alt: img.alt,
    }));
}

function imagesSignature(images: RevisionImagePatch[]): string {
  const normalized = [...images]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((i) => ({
      fileId: i.fileId,
      sortOrder: i.sortOrder,
      alt: i.alt ?? "",
    }));
  return JSON.stringify(normalized);
}

export function proposedImagesFromProduct(
  liveImages: ProductImage[],
  patch: ProductRevisionPatch,
): RevisionImagePatch[] {
  if (patch.images) {
    return [...patch.images].sort((a, b) => a.sortOrder - b.sortOrder);
  }
  return liveImagesToRevisionPatch(liveImages);
}

export function overlayProductWithPatch(
  product: Product,
  patch: ProductRevisionPatch,
): Product {
  const price = patch.price ?? product.price;
  const isFree =
    patch.isFree !== undefined
      ? patch.isFree
      : patch.price !== undefined
        ? patch.price === 0
        : product.isFree;

  return {
    ...product,
    categoryId: patch.categoryId ?? product.categoryId,
    title: patch.title ?? product.title,
    description: patch.description ?? product.description,
    price,
    isFree,
    stock: patch.stock ?? product.stock,
    available: patch.available ?? product.available,
  };
}

export function revisionImagesToDisplay(
  liveImages: ProductImage[],
  patch: ProductRevisionPatch,
): ProductImage[] {
  const proposed = proposedImagesFromProduct(liveImages, patch);
  const liveByFileId = new Map(liveImages.map((img) => [img.fileId, img]));

  return proposed.map((p, index) => {
    const live = liveByFileId.get(p.fileId);
    return {
      $id: live?.$id ?? `pending:${p.fileId}`,
      productId: live?.productId ?? liveImages[0]?.productId ?? "",
      fileId: p.fileId,
      sortOrder: p.sortOrder ?? index,
      alt: p.alt ?? live?.alt ?? null,
    };
  });
}

export function pruneRevisionPatch(
  product: Product,
  liveImages: ProductImage[],
  patch: ProductRevisionPatch,
): ProductRevisionPatch {
  const next: ProductRevisionPatch = { ...patch };

  if (next.categoryId !== undefined && next.categoryId === product.categoryId) {
    delete next.categoryId;
  }
  if (next.title !== undefined && next.title === product.title) {
    delete next.title;
  }
  if (next.description !== undefined && next.description === product.description) {
    delete next.description;
  }
  if (next.price !== undefined && next.price === product.price) {
    delete next.price;
  }
  if (next.isFree !== undefined && next.isFree === product.isFree) {
    delete next.isFree;
  }
  if (next.stock !== undefined && next.stock === product.stock) {
    delete next.stock;
  }
  if (next.available !== undefined && next.available === product.available) {
    delete next.available;
  }

  if (next.images) {
    const liveSig = imagesSignature(liveImagesToRevisionPatch(liveImages));
    const patchSig = imagesSignature(next.images);
    if (liveSig === patchSig) {
      delete next.images;
    }
  }

  return next;
}

export function isRevisionPatchEmpty(patch: ProductRevisionPatch): boolean {
  return Object.keys(patch).length === 0;
}

type ParsedListingFields = {
  categoryId: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  isFree: boolean;
};

export function mergeFieldPatch(
  existing: ProductRevisionPatch,
  parsed: ParsedListingFields,
  available: boolean,
): ProductRevisionPatch {
  return {
    ...existing,
    categoryId: parsed.categoryId,
    title: parsed.title,
    description: parsed.description,
    price: parsed.price,
    isFree: parsed.isFree,
    stock: parsed.stock,
    available,
  };
}

export type AdminChangeContext = {
  categoryNameById: Map<string, string>;
  liveImages: ProductImage[];
};

function formatMoney(price: number, currency: string, isFree: boolean): string {
  if (isFree || price === 0) return "Free";
  return `${currency} ${price.toLocaleString()}`;
}

/** Human-readable before → after lines for admin moderation UI. */
export function buildAdminChangeLines(
  product: Product,
  patch: ProductRevisionPatch,
  ctx: AdminChangeContext,
): string[] {
  const lines: string[] = [];
  const proposed = overlayProductWithPatch(product, patch);

  if (patch.categoryId && patch.categoryId !== product.categoryId) {
    const from =
      ctx.categoryNameById.get(product.categoryId) ?? product.categoryId;
    const to =
      ctx.categoryNameById.get(patch.categoryId) ?? patch.categoryId;
    lines.push(`Category: ${from} → ${to}`);
  }
  if (patch.title && patch.title !== product.title) {
    lines.push(`Title: “${product.title}” → “${patch.title}”`);
  }
  if (patch.description && patch.description !== product.description) {
    lines.push("Description updated");
  }
  if (
    (patch.price !== undefined && patch.price !== product.price) ||
    (patch.isFree !== undefined && patch.isFree !== product.isFree)
  ) {
    const from = formatMoney(product.price, product.currency, product.isFree);
    const to = formatMoney(proposed.price, product.currency, proposed.isFree);
    lines.push(`Price: ${from} → ${to}`);
  }
  if (patch.stock !== undefined && patch.stock !== product.stock) {
    lines.push(
      `Stock: ${product.stock} → ${patch.stock} (live stock is ${product.stock} until approved)`,
    );
  }
  if (patch.available !== undefined && patch.available !== product.available) {
    lines.push(
      `Availability: ${product.available ? "Available" : "Unavailable"} → ${patch.available ? "Available" : "Unavailable"}`,
    );
  }

  if (patch.images) {
    const liveIds = new Set(ctx.liveImages.map((i) => i.fileId));
    const proposedIds = new Set(patch.images.map((i) => i.fileId));
    const added = patch.images.filter((i) => !liveIds.has(i.fileId));
    const removed = ctx.liveImages.filter((i) => !proposedIds.has(i.fileId));
    if (added.length > 0) {
      lines.push(`Photos: +${added.length} new image(s)`);
    }
    if (removed.length > 0) {
      lines.push(`Photos: −${removed.length} image(s) removed`);
    }
    if (added.length === 0 && removed.length === 0) {
      lines.push("Photos: order or alt text changed");
    }
  }

  return lines;
}

async function loadRevisionRow(
  productId: string,
  client: "admin" | "session",
): Promise<ProductRevision | null> {
  const { tables } =
    client === "admin" ? await createAdminClient() : await createSessionClient();
  try {
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_PRODUCT_REVISIONS,
      queries: [
        Query.equal("productId", productId),
        Query.limit(1),
      ],
    });
    const row = result.rows[0];
    if (!row) return null;
    return asProductRevision(row as Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function getRevisionForProduct(
  productId: string,
): Promise<ProductRevision | null> {
  if (!hasDatabaseConfig()) return null;
  return loadRevisionRow(productId, "session");
}

export async function getRevisionsForProductIds(
  productIds: string[],
): Promise<Map<string, ProductRevision>> {
  const map = new Map<string, ProductRevision>();
  if (!hasDatabaseConfig() || productIds.length === 0) return map;

  try {
    const { tables } = await createAdminClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_PRODUCT_REVISIONS,
      queries: [
        Query.equal("productId", productIds),
        Query.limit(Math.min(productIds.length, MAX_PAGE_SIZE)),
      ],
    });
    for (const row of result.rows) {
      const rev = asProductRevision(row as Record<string, unknown>);
      if (rev) map.set(rev.productId, rev);
    }
  } catch {
    // ignore
  }
  return map;
}

export async function productHasPendingRevision(
  productId: string,
): Promise<boolean> {
  const rev = await getRevisionForProduct(productId);
  return rev !== null;
}

async function upsertRevisionPatch(
  productId: string,
  patch: ProductRevisionPatch,
  notifyAdmin: boolean,
  productTitle: string,
  sellerId: string,
): Promise<void> {
  const serialized = JSON.stringify(patch);
  const existing = await loadRevisionRow(productId, "session");
  const { tables } = await createSessionClient();

  if (existing) {
    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PRODUCT_REVISIONS,
      rowId: existing.$id,
      data: { patch: serialized },
    });
  } else {
    await tables.createRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PRODUCT_REVISIONS,
      rowId: ID.unique(),
      data: {
        productId,
        patch: serialized,
      },
    });
  }

  if (notifyAdmin) {
    await notifyAdminsEvent({
      type: "listing.edit.submitted.admin",
      title: "Listing edit awaiting review",
      body: `A seller submitted edits to "${productTitle}". The live listing is unchanged until you approve.`,
      link: "/admin/listings",
      detailLines: [`Product: ${productId}`, `Seller: ${sellerId}`],
    });
  }
}

export async function saveActiveListingRevision(
  product: Product,
  liveImages: ProductImage[],
  nextPatch: ProductRevisionPatch,
): Promise<{ hadChanges: boolean; message: string }> {
  const pruned = pruneRevisionPatch(product, liveImages, nextPatch);

  if (isRevisionPatchEmpty(pruned)) {
    const existing = await loadRevisionRow(product.$id, "session");
    if (existing) {
      await discardRevisionCore(product.$id, liveImages);
    }
    return {
      hadChanges: false,
      message: "No changes to submit for review.",
    };
  }

  const isNew = !(await loadRevisionRow(product.$id, "session"));
  await upsertRevisionPatch(
    product.$id,
    pruned,
    isNew,
    product.title,
    product.sellerId,
  );

  return {
    hadChanges: true,
    message:
      "Changes sent for admin review. Shoppers still see the current listing until approved.",
  };
}

/**
 * Merge parsed form fields into an active listing revision (does not touch live row).
 */
export async function stageActiveListingFieldUpdate(
  product: Product,
  liveImages: ProductImage[],
  parsed: ParsedListingFields,
  available: boolean,
): Promise<ListingRevisionMutationResult> {
  const existing = (await loadRevisionRow(product.$id, "session"))?.patch ?? {};

  const merged = mergeFieldPatch(existing, parsed, available);
  const pruned = pruneRevisionPatch(product, liveImages, merged);

  if (isRevisionPatchEmpty(pruned)) {
    const hadRevision = await loadRevisionRow(product.$id, "session");
    if (hadRevision) {
      await discardRevisionCore(product.$id, liveImages);
    }
    return { ok: true, message: "No changes to submit for review." };
  }

  const isNew = !(await loadRevisionRow(product.$id, "session"));
  await upsertRevisionPatch(
    product.$id,
    pruned,
    isNew,
    product.title,
    product.sellerId,
  );

  return {
    ok: true,
    message:
      "Changes sent for admin review. Shoppers still see the current listing until approved.",
  };
}

export async function stageActiveListingImagesPatch(
  product: Product,
  liveImages: ProductImage[],
  imagesPatch: RevisionImagePatch[],
): Promise<ListingRevisionMutationResult> {
  const existing = (await loadRevisionRow(product.$id, "session"))?.patch ?? {};
  const merged: ProductRevisionPatch = {
    ...existing,
    images: imagesPatch,
  };
  const pruned = pruneRevisionPatch(product, liveImages, merged);

  if (isRevisionPatchEmpty(pruned)) {
    await discardRevisionCore(product.$id, liveImages);
    return { ok: true, message: "No image changes pending review." };
  }

  const isNew = !(await loadRevisionRow(product.$id, "session"));
  await upsertRevisionPatch(
    product.$id,
    pruned,
    isNew,
    product.title,
    product.sellerId,
  );

  return {
    ok: true,
    message:
      "Changes sent for admin review. Shoppers still see the current listing until approved.",
  };
}

async function deleteRevisionRow(productId: string): Promise<void> {
  const existing = await loadRevisionRow(productId, "admin");
  if (!existing) return;
  const { tables } = await createAdminClient();
  await tables.deleteRow({
    databaseId: DATABASE_ID,
    tableId: TABLE_PRODUCT_REVISIONS,
    rowId: existing.$id,
  });
}

export async function discardRevisionCore(
  productId: string,
  liveImages: ProductImage[],
): Promise<void> {
  if (!hasDatabaseConfig()) return;

  const revision = await loadRevisionRow(productId, "admin");
  if (!revision) return;

  const liveFileIds = new Set(liveImages.map((i) => i.fileId));
  const proposedIds =
    revision.patch.images?.map((i) => i.fileId) ??
    liveImages.map((i) => i.fileId);

  for (const fileId of proposedIds) {
    if (!liveFileIds.has(fileId)) {
      try {
        await deleteFileAsAdmin(BUCKET_PRODUCT_IMAGES, fileId);
      } catch {
        // best-effort
      }
    }
  }

  await deleteRevisionRow(productId);
}

export async function applyRevisionCore(
  adminUserId: string,
  product: Product,
  liveImages: ProductImage[],
): Promise<ListingRevisionMutationResult> {
  await assertAdminUser(adminUserId);

  const revision = await loadRevisionRow(product.$id, "admin");
  if (!revision) {
    return { ok: false, error: "No pending edit for this listing." };
  }

  if (product.status !== ACTIVE_PRODUCT_STATUS) {
    return {
      ok: false,
      error: "Edits can only be applied to active listings.",
    };
  }

  const proposed = overlayProductWithPatch(product, revision.patch);
  const imagePatches = proposedImagesFromProduct(liveImages, revision.patch);
  const proposedFileIds = new Set(imagePatches.map((i) => i.fileId));

  const { tables } = await createAdminClient();
  let transactionId: string | null = null;

  try {
    const tx = await tables.createTransaction({ ttl: 120 });
    transactionId = tx.$id;

    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PRODUCTS,
      rowId: product.$id,
      data: {
        categoryId: proposed.categoryId,
        title: proposed.title,
        description: proposed.description,
        price: proposed.price,
        isFree: proposed.isFree,
        stock: proposed.stock,
        available: proposed.available,
      },
      transactionId,
    });

    for (const img of liveImages) {
      await tables.deleteRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_PRODUCT_IMAGES,
        rowId: img.$id,
        transactionId,
      });
    }

    for (let i = 0; i < imagePatches.length; i++) {
      const img = imagePatches[i]!;
      await tables.createRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_PRODUCT_IMAGES,
        rowId: ID.unique(),
        data: {
          productId: product.$id,
          fileId: img.fileId,
          sortOrder: img.sortOrder ?? i,
          alt: img.alt ?? proposed.title.slice(0, 200),
        },
        transactionId,
      });
    }

    const revisionRow = await loadRevisionRow(product.$id, "admin");
    if (revisionRow) {
      await tables.deleteRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_PRODUCT_REVISIONS,
        rowId: revisionRow.$id,
        transactionId,
      });
    }

    await tables.updateTransaction({ transactionId, commit: true });
    transactionId = null;
  } catch {
    if (transactionId) {
      await tables.deleteTransaction({ transactionId });
    }
    return { ok: false, error: "Failed to apply listing edit." };
  }

  for (const img of liveImages) {
    if (!proposedFileIds.has(img.fileId)) {
      try {
        await deleteFileAsAdmin(BUCKET_PRODUCT_IMAGES, img.fileId);
      } catch {
        // best-effort
      }
    }
  }

  try {
    await writeAuditLog({
      actorId: adminUserId,
      event: "listing.edit_approved",
      resourceType: "product",
      resourceId: product.$id,
      meta: {
        title: proposed.title,
        sellerId: product.sellerId,
        changeLines: JSON.stringify(
          buildAdminChangeLines(product, revision.patch, {
            categoryNameById: new Map(),
            liveImages,
          }),
        ),
      },
    });
  } catch {
    return {
      ok: false,
      error:
        "Edit applied but audit log failed. Please notify an operator.",
    };
  }

  return {
    ok: true,
    message: `Edits to "${proposed.title}" are now live.`,
  };
}

function parseModerationCursor(
  cursor: string | undefined,
): { submittedAt: Date; productId: string } | null {
  if (!cursor?.trim()) return null;
  const [iso, productId] = cursor.split("|");
  if (!iso || !productId) return null;
  const submittedAt = new Date(iso);
  if (Number.isNaN(submittedAt.getTime())) return null;
  return { submittedAt, productId };
}

function moderationCursorFromItem(item: ModerationQueueItem): string {
  return `${item.submittedAt.toISOString()}|${item.product.$id}`;
}

function rowToProduct(row: typeof products.$inferSelect): Product | null {
  return asProduct({
    $id: row.id,
    sellerId: row.sellerId,
    categoryId: row.categoryId,
    title: row.title,
    description: row.description,
    price: Number(row.price),
    isFree: row.isFree,
    status: row.status,
    stock: row.stock,
    available: row.available,
    currency: row.currency,
    featured: row.featured,
  });
}

/** Pending new listings plus active listings with a staged edit. */
export async function listModerationQueueItems(opts?: {
  limit?: number;
  cursor?: string;
}): Promise<{ items: ModerationQueueItem[]; nextCursor: string | null }> {
  await assertAdminUser();
  if (!hasDatabaseConfig()) {
    return { items: [], nextCursor: null };
  }

  const limit = Math.min(
    Math.max(opts?.limit ?? DEFAULT_PAGE_SIZE, 1),
    MAX_PAGE_SIZE,
  );
  const cursor = parseModerationCursor(opts?.cursor);

  const db = getDb();
  const submittedAtSql = sql<Date>`COALESCE(${productRevisions.updatedAt}, ${products.updatedAt})`;

  const filters: SQL[] = [
    or(
      eq(products.status, PENDING_REVIEW_PRODUCT_STATUS),
      and(
        eq(products.status, ACTIVE_PRODUCT_STATUS),
        sql`${productRevisions.id} IS NOT NULL`,
      ),
    )!,
  ];

  if (cursor) {
    filters.push(
      or(
        sql`${submittedAtSql} < ${cursor.submittedAt}`,
        and(
          sql`${submittedAtSql} = ${cursor.submittedAt}`,
          sql`${products.id} < ${cursor.productId}`,
        ),
      )!,
    );
  }

  const rows = await db
    .select({
      product: products,
      revisionPatch: productRevisions.patch,
      revisionId: productRevisions.id,
      revisionUpdatedAt: productRevisions.updatedAt,
      revisionCreatedAt: productRevisions.createdAt,
    })
    .from(products)
    .leftJoin(
      productRevisions,
      eq(productRevisions.productId, products.id),
    )
    .where(and(...filters))
    .orderBy(desc(submittedAtSql), desc(products.id))
    .limit(limit + 1);

  const slice = rows.slice(0, limit);
  const items: ModerationQueueItem[] = [];

  for (const row of slice) {
    const product = rowToProduct(row.product);
    if (!product) continue;

    const kind: ModerationQueueKind =
      product.status === PENDING_REVIEW_PRODUCT_STATUS ? "new" : "edit";

    let revision: ProductRevision | null = null;
    if (row.revisionId && row.revisionPatch) {
      const patch = parsePatchJson(row.revisionPatch);
      if (patch) {
        revision = {
          $id: row.revisionId,
          productId: product.$id,
          patch,
          $updatedAt: row.revisionUpdatedAt?.toISOString(),
          $createdAt: row.revisionCreatedAt?.toISOString(),
        };
      }
    }

    const submittedAt =
      row.revisionUpdatedAt ??
      row.product.updatedAt ??
      row.product.createdAt ??
      new Date();

    items.push({
      product,
      kind,
      revision,
      submittedAt,
      changeLines: [],
    });
  }

  const nextCursor =
    rows.length > limit && items.length > 0
      ? moderationCursorFromItem(items[items.length - 1]!)
      : null;

  return { items, nextCursor };
}

export async function listProductIdsWithRevisions(
  productIds: string[],
): Promise<Set<string>> {
  if (!hasDatabaseConfig() || productIds.length === 0) {
    return new Set();
  }
  try {
    const db = getDb();
    const rows = await db
      .select({ productId: productRevisions.productId })
      .from(productRevisions)
      .where(inArray(productRevisions.productId, productIds));
    return new Set(rows.map((r) => r.productId));
  } catch {
    return new Set();
  }
}
