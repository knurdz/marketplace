/**
 * Pure bank-slip approve/reject eligibility (Phase 6.14).
 * Callers must already have authenticated an admin; this only decides mutations.
 */

import type { BankSlip, Order, OrderStatus, Payment } from "@/lib/types";
import {
  BANK_SLIP_QUEUE_PAYMENT_STATUSES,
  EARLY_PAYMENT_ORDER_STATUSES,
  SETTLED_ORDER_STATUSES,
} from "@/lib/types/status";

export const BANK_SLIP_ALREADY_APPROVED = "This bank slip was already approved.";
export const BANK_SLIP_ALREADY_REJECTED = "This bank slip was already rejected.";
export const BANK_SLIP_ALREADY_REVIEWED = "This bank slip was already reviewed.";
export const BANK_SLIP_PAYMENT_ALREADY_PAID = "Payment was already marked paid.";
export const BANK_SLIP_NOT_BANK_TRANSFER = "Payment is not a bank transfer.";
export const BANK_SLIP_ORDER_CANCELLED = "This order was already cancelled.";
export const BANK_SLIP_ORDER_REFUNDED = "This order was already refunded.";
export const BANK_SLIP_PAYMENT_CLOSED =
  "This payment can no longer be approved.";
export const BANK_SLIP_REJECT_PAID = "This payment was already marked paid.";
export const BANK_SLIP_REJECT_REFUNDED =
  "This payment was already refunded.";

const APPROVABLE_ORDER_STATUSES = new Set<OrderStatus>(
  EARLY_PAYMENT_ORDER_STATUSES,
);

const SETTLED_ORDER_STATUSES_SET = new Set<OrderStatus>(SETTLED_ORDER_STATUSES);

/** Idempotency key written on first successful bank-slip approval. */
export function bankConfirmIdempotencyKey(orderId: string): string {
  return `bank:${orderId}`;
}

export type BankSlipApproveDecision =
  | { action: "settle" }
  | { action: "noop"; message: string }
  | { action: "refuse"; error: string };

export type BankSlipRejectDecision =
  | { action: "reopen" }
  | { action: "settle_slip_only" }
  | { action: "noop"; message: string }
  | { action: "refuse"; error: string };

export type BankSlipRejectAndCancelDecision =
  | { action: "cancel" }
  | { action: "noop"; message: string }
  | { action: "refuse"; error: string };

function alreadyReviewedMessage(slip: BankSlip): string {
  if (slip.status === "approved") return BANK_SLIP_ALREADY_APPROVED;
  if (slip.status === "rejected") return BANK_SLIP_ALREADY_REJECTED;
  return BANK_SLIP_ALREADY_REVIEWED;
}

function rowsPointAtSamePayment(params: {
  slip: BankSlip;
  payment: Payment;
  order: Order;
}): boolean {
  return (
    params.slip.paymentId === params.payment.$id &&
    params.slip.orderId === params.order.$id &&
    params.payment.orderId === params.order.$id
  );
}

function isBankTransfer(order: Order, payment: Payment): boolean {
  return (
    order.paymentMethod === "bank_transfer" && payment.method === "bank_transfer"
  );
}

/**
 * Decide whether a pending bank slip may mark payment/order paid.
 * Already-paid (including a sibling slip) is a success no-op — never a second stock drop.
 */
export function evaluateBankSlipApprove(params: {
  slip: BankSlip;
  payment: Payment;
  order: Order;
}): BankSlipApproveDecision {
  const { slip, payment, order } = params;

  if (!rowsPointAtSamePayment(params)) {
    return { action: "refuse", error: BANK_SLIP_PAYMENT_CLOSED };
  }

  if (!isBankTransfer(order, payment)) {
    return { action: "refuse", error: BANK_SLIP_NOT_BANK_TRANSFER };
  }

  if (slip.status !== "pending") {
    return { action: "noop", message: alreadyReviewedMessage(slip) };
  }

  if (payment.status === "paid") {
    return { action: "noop", message: BANK_SLIP_PAYMENT_ALREADY_PAID };
  }

  if (order.status === "cancelled") {
    return { action: "refuse", error: BANK_SLIP_ORDER_CANCELLED };
  }

  if (order.status === "refunded" || payment.status === "refunded") {
    return { action: "refuse", error: BANK_SLIP_ORDER_REFUNDED };
  }

  if (
    payment.status !== "pending" &&
    payment.status !== "awaiting_verification"
  ) {
    return { action: "refuse", error: BANK_SLIP_PAYMENT_CLOSED };
  }

  if (!APPROVABLE_ORDER_STATUSES.has(order.status)) {
    return { action: "refuse", error: BANK_SLIP_PAYMENT_CLOSED };
  }

  return { action: "settle" };
}

/**
 * Decide whether a pending bank slip may be rejected.
 * Reopens the payment so the buyer can upload a new slip.
 * Never writes payment `failed` over `paid` / `refunded`.
 * After cancel (payment already `failed`), close the slip only.
 */
export function evaluateBankSlipReject(params: {
  slip: BankSlip;
  payment: Payment;
  order: Order;
}): BankSlipRejectDecision {
  const { slip, payment, order } = params;

  if (!rowsPointAtSamePayment(params)) {
    return { action: "refuse", error: BANK_SLIP_PAYMENT_CLOSED };
  }

  if (!isBankTransfer(order, payment)) {
    return { action: "refuse", error: BANK_SLIP_NOT_BANK_TRANSFER };
  }

  if (slip.status !== "pending") {
    return { action: "noop", message: alreadyReviewedMessage(slip) };
  }

  if (payment.status === "paid") {
    return { action: "refuse", error: BANK_SLIP_REJECT_PAID };
  }

  if (payment.status === "refunded" || order.status === "refunded") {
    return { action: "refuse", error: BANK_SLIP_REJECT_REFUNDED };
  }

  if (payment.status === "failed" || order.status === "cancelled") {
    return { action: "settle_slip_only" };
  }

  if (
    (payment.status === "pending" ||
      payment.status === "awaiting_verification") &&
    APPROVABLE_ORDER_STATUSES.has(order.status)
  ) {
    return { action: "reopen" };
  }

  return { action: "refuse", error: BANK_SLIP_PAYMENT_CLOSED };
}

/**
 * Reject the slip and cancel the order (fraud / no retry). Restores stock.
 */
export function evaluateBankSlipRejectAndCancel(params: {
  slip: BankSlip;
  payment: Payment;
  order: Order;
}): BankSlipRejectAndCancelDecision {
  const { slip, payment, order } = params;

  if (!rowsPointAtSamePayment(params)) {
    return { action: "refuse", error: BANK_SLIP_PAYMENT_CLOSED };
  }

  if (!isBankTransfer(order, payment)) {
    return { action: "refuse", error: BANK_SLIP_NOT_BANK_TRANSFER };
  }

  if (slip.status !== "pending") {
    return { action: "noop", message: alreadyReviewedMessage(slip) };
  }

  if (payment.status === "paid") {
    return { action: "refuse", error: BANK_SLIP_REJECT_PAID };
  }

  if (payment.status === "refunded" || order.status === "refunded") {
    return { action: "refuse", error: BANK_SLIP_REJECT_REFUNDED };
  }

  if (order.status === "cancelled") {
    return { action: "noop", message: BANK_SLIP_ORDER_CANCELLED };
  }

  if (
    (payment.status === "pending" ||
      payment.status === "awaiting_verification" ||
      payment.status === "failed") &&
    APPROVABLE_ORDER_STATUSES.has(order.status)
  ) {
    return { action: "cancel" };
  }

  return { action: "refuse", error: BANK_SLIP_PAYMENT_CLOSED };
}

/**
 * Queue hygiene: leftover pending slips after approve/cancel/refund must not appear.
 */
export function shouldListPendingBankSlip(params: {
  slip: BankSlip;
  payment: Payment | null;
  order: Order | null;
}): boolean {
  if (params.slip.status !== "pending") return false;
  if (!params.payment || !params.order) return false;
  if (!rowsPointAtSamePayment({
    slip: params.slip,
    payment: params.payment,
    order: params.order,
  })) {
    return false;
  }
  if (!(BANK_SLIP_QUEUE_PAYMENT_STATUSES as readonly string[]).includes(params.payment.status)) return false;
  if (
    params.order.status === "cancelled" ||
    params.order.status === "refunded" ||
    SETTLED_ORDER_STATUSES_SET.has(params.order.status)
  ) {
    return false;
  }
  return APPROVABLE_ORDER_STATUSES.has(params.order.status);
}
