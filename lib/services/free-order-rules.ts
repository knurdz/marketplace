/**
 * Pure free-confirm eligibility (Member 1 step 1.24).
 * Amounts come from DB snapshots — never from the client body.
 * See docs/agent/PAYHERE.md.
 */

import type { Order, OrderItem, Payment } from "@/lib/types";
import { SETTLED_ORDER_STATUSES } from "@/lib/types/status";

export const FREE_CONFIRM_NOT_FOUND = "Order not found.";
export const FREE_CONFIRM_NOT_FREE =
  "Free checkout is only available when the order total is zero.";
export const FREE_CONFIRM_NO_ITEMS = "Order has no items.";
export const FREE_CONFIRM_CLOSED = "This order can no longer be confirmed.";
export const FREE_CONFIRM_WRONG_STATE = "This payment cannot be confirmed.";
export const FREE_CONFIRM_STOCK =
  "One or more items are out of stock and cannot be confirmed.";

/** Idempotency key written on first successful free settlement. */
export function freeConfirmIdempotencyKey(orderId: string): string {
  return `free:${orderId}`;
}

export function isExactZeroAmount(value: number): boolean {
  return Number.isFinite(value) && value === 0;
}

export type FreeConfirmDecision =
  | { action: "settle" }
  | { action: "noop" }
  | { action: "repair"; repairOrder: boolean; repairPayment: boolean }
  | { action: "reject"; error: string };

/**
 * Decide whether a free order may be marked paid.
 * Caller must already have authenticated the buyer; this re-checks IDOR.
 */
export function evaluateFreeConfirm(params: {
  buyerId: string;
  order: Order;
  payment: Payment;
  items: OrderItem[];
}): FreeConfirmDecision {
  const { buyerId, order, payment, items } = params;

  if (!buyerId || order.buyerId !== buyerId) {
    return { action: "reject", error: FREE_CONFIRM_NOT_FOUND };
  }

  if (payment.orderId !== order.$id) {
    return { action: "reject", error: FREE_CONFIRM_NOT_FOUND };
  }

  if (order.paymentMethod !== "free" || payment.method !== "free") {
    return { action: "reject", error: FREE_CONFIRM_WRONG_STATE };
  }

  if (items.length === 0) {
    return { action: "reject", error: FREE_CONFIRM_NO_ITEMS };
  }

  for (const item of items) {
    if (item.orderId !== order.$id) {
      return { action: "reject", error: FREE_CONFIRM_NOT_FOUND };
    }
    if (
      !isExactZeroAmount(item.unitPrice) ||
      !isExactZeroAmount(item.lineTotal)
    ) {
      return { action: "reject", error: FREE_CONFIRM_NOT_FREE };
    }
  }

  if (
    !isExactZeroAmount(order.totalAmount) ||
    !isExactZeroAmount(payment.amount)
  ) {
    return { action: "reject", error: FREE_CONFIRM_NOT_FREE };
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
    return { action: "reject", error: FREE_CONFIRM_CLOSED };
  }

  if (orderSettled && payment.status === "pending") {
    return { action: "repair", repairOrder: false, repairPayment: true };
  }

  if (payment.status !== "pending") {
    return { action: "reject", error: FREE_CONFIRM_WRONG_STATE };
  }

  if (order.status !== "pending_payment") {
    return { action: "reject", error: FREE_CONFIRM_CLOSED };
  }

  return { action: "settle" };
}
