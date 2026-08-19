/**
 * Canonical marketplace status / method values.
 * Must match docs/agent/SCHEMA.md and scripts/setup-mvp-schema.mjs — do not invent parallel strings.
 */

export const PRODUCT_STATUSES = [
  "draft",
  "pending_review",
  "active",
  "rejected",
  "archived",
] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const ORDER_STATUSES = [
  "pending_payment",
  "payment_review",
  "paid",
  "processing",
  "shipped",
  "ready_pickup",
  "completed",
  "cancelled",
  "refunded",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_METHODS = ["payhere", "bank_transfer", "free"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_STATUSES = [
  "pending",
  "awaiting_verification",
  "paid",
  "failed",
  "refunded",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const SELLER_STATUSES = ["pending", "rejected", "approved"] as const;
export type SellerStatus = (typeof SELLER_STATUSES)[number];

export const BANK_SLIP_STATUSES = ["pending", "approved", "rejected"] as const;
export type BankSlipStatus = (typeof BANK_SLIP_STATUSES)[number];

export const REPORT_STATUSES = [
  "open",
  "reviewing",
  "resolved",
  "dismissed",
] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

/** Storefront / public listing status. */
export const ACTIVE_PRODUCT_STATUS: ProductStatus = "active";

/**
 * Buyer cancel allowed only in early statuses (Member 2 step 2.11).
 * Not a full FSM — later members enforce transitions in services.
 */
export const ORDER_CANCELABLE_STATUSES = [
  "pending_payment",
  "payment_review",
] as const satisfies readonly OrderStatus[];
export type OrderCancelableStatus = (typeof ORDER_CANCELABLE_STATUSES)[number];

function isOneOf<T extends string>(
  value: unknown,
  allowed: readonly T[],
): value is T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}

export function isProductStatus(value: unknown): value is ProductStatus {
  return isOneOf(value, PRODUCT_STATUSES);
}

export function isOrderStatus(value: unknown): value is OrderStatus {
  return isOneOf(value, ORDER_STATUSES);
}

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return isOneOf(value, PAYMENT_METHODS);
}

export function isPaymentStatus(value: unknown): value is PaymentStatus {
  return isOneOf(value, PAYMENT_STATUSES);
}

export function isSellerStatus(value: unknown): value is SellerStatus {
  return isOneOf(value, SELLER_STATUSES);
}

export function isBankSlipStatus(value: unknown): value is BankSlipStatus {
  return isOneOf(value, BANK_SLIP_STATUSES);
}

export function isReportStatus(value: unknown): value is ReportStatus {
  return isOneOf(value, REPORT_STATUSES);
}

export function isOrderCancelable(status: OrderStatus): boolean {
  return (ORDER_CANCELABLE_STATUSES as readonly OrderStatus[]).includes(status);
}

/**
 * Admin cancel (6.13): unpaid early orders only. Same order statuses as buyer
 * cancel; payment must not already be paid or refunded.
 */
export const ADMIN_ORDER_CANCELABLE_STATUSES = [
  "pending_payment",
  "payment_review",
] as const satisfies readonly OrderStatus[];
export type AdminOrderCancelableStatus =
  (typeof ADMIN_ORDER_CANCELABLE_STATUSES)[number];

/**
 * Admin refund (6.13): paid through completed. Payment must be `paid`.
 * Chargeback notify (`status_code -3`) converges on the same `refunded` rows.
 */
export const ADMIN_ORDER_REFUNDABLE_STATUSES = [
  "paid",
  "processing",
  "shipped",
  "ready_pickup",
  "completed",
] as const satisfies readonly OrderStatus[];
export type AdminOrderRefundableStatus =
  (typeof ADMIN_ORDER_REFUNDABLE_STATUSES)[number];

export function canAdminCancelOrder(
  orderStatus: OrderStatus,
  paymentStatus: PaymentStatus,
): boolean {
  if (
    !(ADMIN_ORDER_CANCELABLE_STATUSES as readonly OrderStatus[]).includes(
      orderStatus,
    )
  ) {
    return false;
  }
  return paymentStatus !== "paid" && paymentStatus !== "refunded";
}

export function canAdminRefundOrder(
  orderStatus: OrderStatus,
  paymentStatus: PaymentStatus,
): boolean {
  if (
    !(ADMIN_ORDER_REFUNDABLE_STATUSES as readonly OrderStatus[]).includes(
      orderStatus,
    )
  ) {
    return false;
  }
  return paymentStatus === "paid";
}

/** Seller fulfillment hops (Member 3 step 3.11). */
export const SELLER_FULFILLMENT_TRANSITIONS: Partial<
  Record<OrderStatus, readonly OrderStatus[]>
> = {
  paid: ["processing"],
  processing: ["shipped", "ready_pickup"],
  shipped: ["completed"],
  ready_pickup: ["completed"],
};

/** Same status is idempotent success; invalid hops return false. */
export function canSellerFulfillmentTransition(
  from: OrderStatus,
  to: OrderStatus,
): boolean {
  if (from === to) return true;
  const allowed = SELLER_FULFILLMENT_TRANSITIONS[from];
  return allowed?.includes(to) ?? false;
}

/** Allowed next statuses for seller UI (excludes idempotent same-status). */
export function sellerFulfillmentNextStatuses(from: OrderStatus): OrderStatus[] {
  const allowed = SELLER_FULFILLMENT_TRANSITIONS[from];
  return allowed ? [...allowed] : [];
}

/** Fulfillment track excluding terminal cancel/refund branches. */
export const ORDER_HAPPY_PATH_STATUSES = [
  "pending_payment",
  "payment_review",
  "paid",
  "processing",
  "shipped",
  "ready_pickup",
  "completed",
] as const satisfies readonly OrderStatus[];

export type OrderTimelineStepState = "done" | "current" | "upcoming";

export type OrderTimelineStep = {
  status: OrderStatus;
  state: OrderTimelineStepState;
};

export type OrderTimelineView = {
  steps: OrderTimelineStep[];
  terminalOutcome: "cancelled" | "refunded" | null;
};

const HAPPY_PATH = ORDER_HAPPY_PATH_STATUSES as readonly OrderStatus[];

/** Derive buyer-facing timeline steps from the current order status. */
export function deriveOrderTimeline(currentStatus: OrderStatus): OrderTimelineView {
  if (currentStatus === "cancelled" || currentStatus === "refunded") {
    return {
      steps: HAPPY_PATH.map((status) => ({ status, state: "upcoming" })),
      terminalOutcome: currentStatus,
    };
  }

  const currentIndex = HAPPY_PATH.indexOf(currentStatus);
  const idx = currentIndex >= 0 ? currentIndex : 0;

  return {
    steps: HAPPY_PATH.map((status, index) => ({
      status,
      state:
        index < idx ? "done" : index === idx ? "current" : "upcoming",
    })),
    terminalOutcome: null,
  };
}
