/**
 * Pure COD confirm eligibility.
 * Amounts come from DB snapshots — never from the client body.
 */

import type { Order, OrderItem, Payment } from "@/lib/types";
import { SETTLED_ORDER_STATUSES } from "@/lib/types/status";

export const COD_CONFIRM_NOT_FOUND = "Order not found.";
export const COD_CONFIRM_NOT_COD =
  "Cash on delivery is only available for paid-total orders.";
export const COD_CONFIRM_NO_ITEMS = "Order has no items.";
export const COD_CONFIRM_CLOSED = "This order can no longer be confirmed.";
export const COD_CONFIRM_WRONG_STATE = "This payment cannot be confirmed.";
export const COD_CONFIRM_STOCK =
  "One or more items are out of stock and cannot be confirmed.";

/** Idempotency key written on first successful COD acceptance. */
export function codConfirmIdempotencyKey(orderId: string): string {
  return `cod:${orderId}`;
}

export function isPositiveAmount(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

export type CodConfirmDecision =
  | { action: "settle" }
  | { action: "noop" }
  | { action: "repair"; repairOrder: boolean; repairPayment: boolean }
  | { action: "reject"; error: string };

/**
 * Decide whether a COD order may be marked paid (accepted).
 * Caller must already have authenticated the buyer; this re-checks IDOR.
 */
export function evaluateCodConfirm(params: {
  buyerId: string;
  order: Order;
  payment: Payment;
  items: OrderItem[];
}): CodConfirmDecision {
  const { buyerId, order, payment, items } = params;

  if (!buyerId || order.buyerId !== buyerId) {
    return { action: "reject", error: COD_CONFIRM_NOT_FOUND };
  }

  if (payment.orderId !== order.$id) {
    return { action: "reject", error: COD_CONFIRM_NOT_FOUND };
  }

  if (order.paymentMethod !== "cod" || payment.method !== "cod") {
    return { action: "reject", error: COD_CONFIRM_WRONG_STATE };
  }

  if (items.length === 0) {
    return { action: "reject", error: COD_CONFIRM_NO_ITEMS };
  }

  for (const item of items) {
    if (item.orderId !== order.$id) {
      return { action: "reject", error: COD_CONFIRM_NOT_FOUND };
    }
    if (!isPositiveAmount(item.unitPrice) || !isPositiveAmount(item.lineTotal)) {
      return { action: "reject", error: COD_CONFIRM_NOT_COD };
    }
  }

  if (
    !isPositiveAmount(order.totalAmount) ||
    !isPositiveAmount(payment.amount)
  ) {
    return { action: "reject", error: COD_CONFIRM_NOT_COD };
  }

  const paymentPaid = payment.status === "paid";
  const orderSettled = (SETTLED_ORDER_STATUSES as readonly string[]).includes(
    order.status,
  );

  if (paymentPaid && orderSettled) {
    return { action: "noop" };
  }

  if (paymentPaid && !orderSettled) {
    if (order.status === "cancelled" || order.status === "refunded") {
      return { action: "noop" };
    }
    if (
      order.status === "pending_payment" ||
      order.status === "payment_review"
    ) {
      return { action: "repair", repairOrder: true, repairPayment: false };
    }
    return { action: "noop" };
  }

  if (order.status === "cancelled" || order.status === "refunded") {
    return { action: "reject", error: COD_CONFIRM_CLOSED };
  }

  if (orderSettled && payment.status === "pending") {
    return { action: "repair", repairOrder: false, repairPayment: true };
  }

  if (payment.status !== "pending") {
    return { action: "reject", error: COD_CONFIRM_WRONG_STATE };
  }

  if (order.status !== "pending_payment") {
    return { action: "reject", error: COD_CONFIRM_CLOSED };
  }

  return { action: "settle" };
}
