/**
 * Runnable checks for admin cancel/refund transition helpers (no Appwrite).
 * Run: npx tsx scripts/verify-admin-order-overrides.ts
 */
import {
  canAdminCancelOrder,
  canAdminRefundOrder,
  type OrderStatus,
  type PaymentStatus,
} from "../lib/types";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function cancel(order: OrderStatus, payment: PaymentStatus): boolean {
  return canAdminCancelOrder(order, payment);
}

function refund(order: OrderStatus, payment: PaymentStatus): boolean {
  return canAdminRefundOrder(order, payment);
}

assert(cancel("pending_payment", "pending"), "unpaid pending_payment can cancel");
assert(cancel("payment_review", "awaiting_verification"), "bank review can cancel");
assert(cancel("pending_payment", "failed"), "failed unpaid can still cancel");
assert(!cancel("pending_payment", "paid"), "paid payment cannot cancel");
assert(!cancel("pending_payment", "refunded"), "refunded payment cannot cancel");
assert(!cancel("paid", "pending"), "paid order cannot cancel");
assert(!cancel("processing", "paid"), "processing cannot cancel");
assert(!cancel("completed", "paid"), "completed cannot cancel");
assert(!cancel("cancelled", "failed"), "already cancelled is not a new cancel hop");
assert(!cancel("refunded", "refunded"), "refunded cannot cancel");

assert(refund("paid", "paid"), "paid+paid can refund");
assert(refund("processing", "paid"), "processing+paid can refund");
assert(refund("shipped", "paid"), "shipped+paid can refund");
assert(refund("ready_pickup", "paid"), "ready_pickup+paid can refund");
assert(refund("completed", "paid"), "completed+paid can refund");
assert(!refund("paid", "pending"), "unpaid cannot refund");
assert(!refund("paid", "awaiting_verification"), "awaiting slip cannot refund");
assert(!refund("paid", "failed"), "failed cannot refund");
assert(!refund("paid", "refunded"), "already-refunded payment is not a new hop");
assert(!refund("pending_payment", "paid"), "early order cannot refund");
assert(!refund("payment_review", "paid"), "payment_review cannot refund");
assert(!refund("cancelled", "paid"), "cancelled cannot refund");
assert(
  !refund("refunded", "refunded"),
  "already refunded is not a new refund hop",
);
assert(!refund("refunded", "paid"), "order already refunded is not refundable");

console.log("verify-admin-order-overrides: OK");
