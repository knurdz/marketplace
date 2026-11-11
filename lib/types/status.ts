/**
 * Canonical marketplace status values.
 * Must match docs/agent/SCHEMA.md — do not invent parallel strings.
 */

export const PRODUCT_STATUSES = [
  "draft",
  "pending_review",
  "active",
  "rejected",
  "archived",
] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const PURCHASE_REQUEST_STATUSES = [
  "requested",
  "sold",
  "cancelled",
] as const;
export type PurchaseRequestStatus = (typeof PURCHASE_REQUEST_STATUSES)[number];

export const SELLER_STATUSES = ["pending", "rejected", "approved"] as const;
export type SellerStatus = (typeof SELLER_STATUSES)[number];

export const REPORT_STATUSES = [
  "open",
  "reviewing",
  "resolved",
  "dismissed",
] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const REVIEW_STATUSES = ["pending", "approved", "rejected"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

/** Storefront / public listing status. */
export const ACTIVE_PRODUCT_STATUS: ProductStatus = "active";

/** Seller listing workflow statuses. */
export const DRAFT_PRODUCT_STATUS: ProductStatus = "draft";
export const PENDING_REVIEW_PRODUCT_STATUS: ProductStatus = "pending_review";
export const REJECTED_PRODUCT_STATUS: ProductStatus = "rejected";
export const ARCHIVED_PRODUCT_STATUS: ProductStatus = "archived";

/** Open buy requests waiting on seller action. */
export const OPEN_PURCHASE_REQUEST_STATUS: PurchaseRequestStatus = "requested";

function isOneOf<T extends string>(
  value: unknown,
  allowed: readonly T[],
): value is T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}

export function isProductStatus(value: unknown): value is ProductStatus {
  return isOneOf(value, PRODUCT_STATUSES);
}

export function isPurchaseRequestStatus(
  value: unknown,
): value is PurchaseRequestStatus {
  return isOneOf(value, PURCHASE_REQUEST_STATUSES);
}

export function isSellerStatus(value: unknown): value is SellerStatus {
  return isOneOf(value, SELLER_STATUSES);
}

export function isReportStatus(value: unknown): value is ReportStatus {
  return isOneOf(value, REPORT_STATUSES);
}

export function isReviewStatus(value: unknown): value is ReviewStatus {
  return isOneOf(value, REVIEW_STATUSES);
}

/** Seller may mark sold or cancelled only from requested. */
export function canSellerResolvePurchaseRequest(
  status: PurchaseRequestStatus,
): boolean {
  return status === "requested";
}
