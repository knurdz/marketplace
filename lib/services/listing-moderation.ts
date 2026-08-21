import { ID, Query } from "node-appwrite";
import {
  DATABASE_ID,
  TABLE_AUDIT_LOGS,
  TABLE_PRODUCTS,
  hasAppwritePublicConfig,
} from "@/lib/appwrite/config";
import { createAdminClient } from "@/lib/appwrite/server";
import type { Product } from "@/lib/types";
import type { ProductStatus } from "@/lib/types";
import {
  ACTIVE_PRODUCT_STATUS,
  ARCHIVED_PRODUCT_STATUS,
  PENDING_REVIEW_PRODUCT_STATUS,
  REJECTED_PRODUCT_STATUS,
} from "@/lib/types/status";
import { asProduct } from "./products";

const MAX_REASON_LENGTH = 500;
const DEFAULT_PAGE_SIZE = 24;
const MAX_PAGE_SIZE = 100;

export type ListingModerationResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

async function writeAuditLog(params: {
  actorId: string;
  event: string;
  resourceType: string;
  resourceId: string;
  meta: Record<string, string>;
}): Promise<void> {
  const { tables } = await createAdminClient();
  await tables.createRow({
    databaseId: DATABASE_ID,
    tableId: TABLE_AUDIT_LOGS,
    rowId: ID.unique(),
    data: {
      actorId: params.actorId,
      event: params.event.slice(0, 128),
      resourceType: params.resourceType.slice(0, 64),
      resourceId: params.resourceId,
      meta: JSON.stringify(params.meta).slice(0, 4000),
    },
    permissions: [],
  });
}

function adminSdkAvailable(): boolean {
  return hasAppwritePublicConfig() && Boolean(process.env.APPWRITE_API_KEY?.trim());
}

async function loadProduct(
  productId: string,
): Promise<Product | null> {
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
  return listProductsByStatus(PENDING_REVIEW_PRODUCT_STATUS, opts);
}

/**
 * Approve a pending_review listing → active.
 * Idempotent: already-active is a safe no-op (no audit).
 */
export async function approveListingCore(
  adminUserId: string,
  productId: string,
): Promise<ListingModerationResult> {
  const product = await loadProduct(productId);
  if (!product) {
    return { ok: false, error: "Listing not found." };
  }

  if (product.status === ACTIVE_PRODUCT_STATUS) {
    return { ok: true, message: `"${product.title}" is already active.` };
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
  const parsedReason = parseReason(reason);
  if (typeof parsedReason !== "string") return parsedReason;

  const product = await loadProduct(productId);
  if (!product) {
    return { ok: false, error: "Listing not found." };
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
      data: { status: REJECTED_PRODUCT_STATUS },
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

  const { tables } = await createAdminClient();
  try {
    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PRODUCTS,
      rowId: product.$id,
      data: { status: ARCHIVED_PRODUCT_STATUS },
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
      error:
        "Listing removed but audit log failed. Please notify an operator.",
    };
  }

  return { ok: true, message: `"${product.title}" removed from the storefront.` };
}
