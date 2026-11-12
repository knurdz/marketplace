import { Query } from "@/lib/db/compat";
import {
  DATABASE_ID,
  TABLE_PRODUCTS,
  hasDatabaseConfig,
} from "@/lib/backend/config";
import { createAdminClient } from "@/lib/backend/server";
import { notifyUserEvent } from "@/lib/email/events";
import { assertAdminUser } from "@/lib/security/admin-auth";
import type { Product } from "@/lib/types";
import type { ProductStatus } from "@/lib/types";
import {
  ACTIVE_PRODUCT_STATUS,
  ARCHIVED_PRODUCT_STATUS,
  PENDING_REVIEW_PRODUCT_STATUS,
  REJECTED_PRODUCT_STATUS,
} from "@/lib/types/status";
import {
  applyRevisionCore,
  discardRevisionCore,
  getRevisionForProduct,
  listModerationQueueItems,
} from "./listing-revisions";
import { writeAuditLog } from "./audit-logs";
import { asProduct, listProductImages } from "./products";

export { listModerationQueueItems };
export type { ModerationQueueItem } from "@/lib/types/listing-revision";

const MAX_REASON_LENGTH = 500;
const DEFAULT_PAGE_SIZE = 24;
const MAX_PAGE_SIZE = 100;

export type ListingModerationResult =
  { ok: true; message: string } | { ok: false; error: string };

function adminSdkAvailable(): boolean {
  return hasDatabaseConfig();
}

async function loadProduct(productId: string): Promise<Product | null> {
  const trimmed = productId?.trim();
  if (!trimmed) return null;

  const { tables } = await createAdminClient();
  try {
    const row = await tables.getRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PRODUCTS,
      rowId: trimmed,
    });
    return asProduct(row as unknown as Record<string, unknown>);
  } catch {
    return null;
  }
}

function parseReason(reason: string): string | ListingModerationResult {
  const trimmed = reason.trim();
  if (!trimmed) {
    return { ok: false, error: "Reason is required." };
  }
  if (trimmed.length > MAX_REASON_LENGTH) {
    return {
      ok: false,
      error: `Reason must be at most ${MAX_REASON_LENGTH} characters.`,
    };
  }
  return trimmed;
}

/**
 * Admin-scoped product list by status (server-only; admin SDK).
 * Paginated via limit + optional cursor ($id of last row).
 */
export async function listProductsByStatus(
  status: ProductStatus,
  opts?: { limit?: number; cursor?: string },
): Promise<Product[]> {
  await assertAdminUser();
  if (!adminSdkAvailable()) return [];

  const limit = Math.min(
    Math.max(opts?.limit ?? DEFAULT_PAGE_SIZE, 1),
    MAX_PAGE_SIZE,
  );
  const cursor = opts?.cursor?.trim() || undefined;

  const queries = [
    Query.equal("status", status),
    Query.orderDesc("$createdAt"),
    Query.limit(limit),
  ];
  if (cursor) {
    queries.push(Query.cursorAfter(cursor));
  }

  try {
    const { tables } = await createAdminClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_PRODUCTS,
      queries,
    });

    const products: Product[] = [];
    for (const row of result.rows) {
      const product = asProduct(row as unknown as Record<string, unknown>);
      if (product) products.push(product);
    }
    return products;
  } catch {
    return [];
  }
}

/** Primary admin moderation queue: pending_review listings. */
export async function listPendingModerationQueue(opts?: {
  limit?: number;
  cursor?: string;
}): Promise<Product[]> {
  const { items } = await listModerationQueueItems(opts);
  return items.map((item) => item.product);
}

/**
 * Approve a pending_review listing → active.
 * Idempotent: already-active is a safe no-op (no audit).
 */
export async function approveListingCore(
  adminUserId: string,
  productId: string,
): Promise<ListingModerationResult> {
  await assertAdminUser(adminUserId);
  const product = await loadProduct(productId);
  if (!product) {
    return { ok: false, error: "Listing not found." };
  }

  const pendingEdit =
    product.status === ACTIVE_PRODUCT_STATUS
      ? await getRevisionForProduct(product.$id)
      : null;

  if (product.status === ACTIVE_PRODUCT_STATUS) {
    if (!pendingEdit) {
      return { ok: true, message: `"${product.title}" is already active.` };
    }
    const liveImages = await listProductImages(product.$id);
    const applied = await applyRevisionCore(adminUserId, product, liveImages);
    if (!applied.ok) return applied;

    await notifyUserEvent(product.sellerId, {
      type: "listing.edit.approved",
      title: "Listing edits approved",
      body: `Your changes to "${product.title}" are now live on the storefront.`,
      link: `/seller/listings?edit=${encodeURIComponent(product.$id)}`,
    });

    return applied;
  }

  if (product.status !== PENDING_REVIEW_PRODUCT_STATUS) {
    return {
      ok: false,
      error: `Listing is ${product.status}. Only pending_review listings can be approved.`,
    };
  }

  const { tables } = await createAdminClient();
  try {
    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PRODUCTS,
      rowId: product.$id,
      data: { status: ACTIVE_PRODUCT_STATUS },
    });
  } catch {
    return { ok: false, error: "Failed to approve listing." };
  }

  try {
    await writeAuditLog({
      actorId: adminUserId,
      event: "listing.approved",
      resourceType: "product",
      resourceId: product.$id,
      meta: {
        title: product.title,
        sellerId: product.sellerId,
        priorStatus: product.status,
      },
    });
  } catch {
    return {
      ok: false,
      error:
        "Listing approved but audit log failed. Please notify an operator.",
    };
  }

  await notifyUserEvent(product.sellerId, {
    type: "listing.approved",
    title: "Listing approved",
    body: `"${product.title}" was approved and is now live on the storefront.`,
    link: `/seller/listings/${product.$id}`,
  });

  return { ok: true, message: `"${product.title}" approved and is now live.` };
}

/**
 * Reject a pending_review listing → rejected.
 * Reason stored in audit_logs.meta only (no products.rejectionReason column).
 * Idempotent: already-rejected is a safe no-op (no audit).
 */
export async function rejectListingCore(
  adminUserId: string,
  productId: string,
  reason: string,
): Promise<ListingModerationResult> {
  await assertAdminUser(adminUserId);
  const parsedReason = parseReason(reason);
  if (typeof parsedReason !== "string") return parsedReason;

  const product = await loadProduct(productId);
  if (!product) {
    return { ok: false, error: "Listing not found." };
  }

  if (product.status === ACTIVE_PRODUCT_STATUS) {
    const revision = await getRevisionForProduct(product.$id);
    if (!revision) {
      return {
        ok: false,
        error: "This listing has no pending edit to reject.",
      };
    }

    const liveImages = await listProductImages(product.$id);
    await discardRevisionCore(product.$id, liveImages);

    try {
      await writeAuditLog({
        actorId: adminUserId,
        event: "listing.edit_rejected",
        resourceType: "product",
        resourceId: product.$id,
        meta: {
          title: product.title,
          sellerId: product.sellerId,
          reason: parsedReason,
        },
      });
    } catch {
      return {
        ok: false,
        error:
          "Edit rejected but audit log failed. Please notify an operator.",
      };
    }

    await notifyUserEvent(product.sellerId, {
      type: "listing.edit.rejected",
      title: "Listing edits rejected",
      body: `Your proposed changes to "${product.title}" were not approved. The live listing is unchanged.`,
      link: `/seller/listings?edit=${encodeURIComponent(product.$id)}`,
      detailLines: [`Reason: ${parsedReason}`],
    });

    return {
      ok: true,
      message: `Pending edits to "${product.title}" were discarded.`,
    };
  }

  if (product.status === REJECTED_PRODUCT_STATUS) {
    return { ok: true, message: `"${product.title}" is already rejected.` };
  }

  if (product.status !== PENDING_REVIEW_PRODUCT_STATUS) {
    return {
      ok: false,
      error: `Listing is ${product.status}. Only pending_review listings can be rejected.`,
    };
  }

  const { tables } = await createAdminClient();
  try {
    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PRODUCTS,
      rowId: product.$id,
      data: { status: REJECTED_PRODUCT_STATUS, featured: false },
    });
  } catch {
    return { ok: false, error: "Failed to reject listing." };
  }

  try {
    await writeAuditLog({
      actorId: adminUserId,
      event: "listing.rejected",
      resourceType: "product",
      resourceId: product.$id,
      meta: {
        title: product.title,
        sellerId: product.sellerId,
        priorStatus: product.status,
        reason: parsedReason,
      },
    });
  } catch {
    return {
      ok: false,
      error:
        "Listing rejected but audit log failed. Please notify an operator.",
    };
  }

  await notifyUserEvent(product.sellerId, {
    type: "listing.rejected",
    title: "Listing rejected",
    body: `"${product.title}" was not approved.`,
    link: `/seller/listings/${product.$id}`,
    detailLines: [`Reason: ${parsedReason}`],
  });

  return { ok: true, message: `"${product.title}" rejected.` };
}

/**
 * Remove (soft takedown) an active listing → archived.
 * Does not delete the product row or product_images.
 * Idempotent: already-archived is a safe no-op (no audit).
 * Non-active, non-archived → clear error (likely caller bug).
 */
export async function removeListingCore(
  adminUserId: string,
  productId: string,
  reason: string,
): Promise<ListingModerationResult> {
  await assertAdminUser(adminUserId);
  const parsedReason = parseReason(reason);
  if (typeof parsedReason !== "string") return parsedReason;

  const product = await loadProduct(productId);
  if (!product) {
    return { ok: false, error: "Listing not found." };
  }

  if (product.status === ARCHIVED_PRODUCT_STATUS) {
    return { ok: true, message: `"${product.title}" is already removed.` };
  }

  if (product.status !== ACTIVE_PRODUCT_STATUS) {
    return {
      ok: false,
      error: `Listing is ${product.status}. Only active listings can be removed.`,
    };
  }

  const liveImages = await listProductImages(product.$id);
  await discardRevisionCore(product.$id, liveImages);

  const { tables } = await createAdminClient();
  try {
    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PRODUCTS,
      rowId: product.$id,
      data: { status: ARCHIVED_PRODUCT_STATUS, featured: false },
    });
  } catch {
    return { ok: false, error: "Failed to remove listing." };
  }

  try {
    await writeAuditLog({
      actorId: adminUserId,
      event: "listing.removed",
      resourceType: "product",
      resourceId: product.$id,
      meta: {
        title: product.title,
        sellerId: product.sellerId,
        priorStatus: product.status,
        reason: parsedReason,
      },
    });
  } catch {
    return {
      ok: false,
      error: "Listing removed but audit log failed. Please notify an operator.",
    };
  }

  await notifyUserEvent(product.sellerId, {
    type: "listing.removed",
    title: "Listing removed",
    body: `"${product.title}" was removed from the storefront by an admin.`,
    link: `/seller/listings/${product.$id}`,
    detailLines: [`Reason: ${parsedReason}`],
  });

  return {
    ok: true,
    message: `"${product.title}" removed from the storefront.`,
  };
}

/** Toggle featured flag on an active listing (admin only). */
export async function setFeaturedListingCore(
  adminUserId: string,
  productId: string,
  featured: boolean,
): Promise<ListingModerationResult> {
  await assertAdminUser(adminUserId);
  const product = await loadProduct(productId);
  if (!product) {
    return { ok: false, error: "Listing not found." };
  }

  if (product.status !== ACTIVE_PRODUCT_STATUS) {
    return {
      ok: false,
      error: "Only active listings can be featured.",
    };
  }

  if (product.featured === featured) {
    return {
      ok: true,
      message: featured
        ? `"${product.title}" is already featured.`
        : `"${product.title}" is not featured.`,
    };
  }

  const { tables } = await createAdminClient();
  try {
    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PRODUCTS,
      rowId: product.$id,
      data: { featured },
    });
  } catch {
    return { ok: false, error: "Failed to update featured status." };
  }

  try {
    await writeAuditLog({
      actorId: adminUserId,
      event: featured ? "listing.featured" : "listing.unfeatured",
      resourceType: "product",
      resourceId: product.$id,
      meta: {
        title: product.title,
        sellerId: product.sellerId,
        featured: featured ? "true" : "false",
      },
    });
  } catch {
    return {
      ok: false,
      error:
        "Featured status updated but audit log failed. Please notify an operator.",
    };
  }

  return {
    ok: true,
    message: featured
      ? `"${product.title}" is now featured.`
      : `"${product.title}" removed from featured.`,
  };
}
