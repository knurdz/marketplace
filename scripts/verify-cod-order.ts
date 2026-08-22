/**
 * Runnable checks for COD confirm eligibility (buyer accepts, payment stays pending).
 * Run: npx tsx scripts/verify-cod-order.ts
 */
import type { Order, OrderItem, Payment } from "../lib/types";
import {
  evaluateCodConfirm,
  codConfirmIdempotencyKey,
} from "../lib/services/cod-order-rules";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`FAIL: ${message}`);
}

function order(overrides: Partial<Order> = {}): Order {
  return {
    $id: "ord_1",
    buyerId: "buyer_1",
    sellerId: "seller_1",
    status: "pending_payment",
    totalAmount: 750,
    currency: "LKR",
    shippingAddress: "1 Main St",
    paymentMethod: "cod",
    couponCode: null,
    discountAmount: 0,
    ...overrides,
  };
}

function payment(overrides: Partial<Payment> = {}): Payment {
  return {
    $id: "pay_1",
    orderId: "ord_1",
    method: "cod",
    status: "pending",
    amount: 750,
    currency: "LKR",
    payherePaymentId: null,
    idempotencyKey: null,
    ...overrides,
  };
}

function item(overrides: Partial<OrderItem> = {}): OrderItem {
  return {
    $id: "item_1",
    orderId: "ord_1",
    productId: "prod_1",
    title: "Pack",
    quantity: 1,
    unitPrice: 750,
    lineTotal: 750,
    ...overrides,
  };
}

assert(codConfirmIdempotencyKey("ord_1") === "cod:ord_1", "idempotency key");

assert(
  evaluateCodConfirm({
    buyerId: "buyer_1",
    order: order(),
    payment: payment(),
    items: [item()],
  }).action === "accept",
  "happy path accepts",
);

assert(
  evaluateCodConfirm({
    buyerId: "buyer_1",
    order: order({ status: "processing" }),
    payment: payment(),
    items: [item()],
  }).action === "noop",
  "already processing is noop",
);

assert(
  evaluateCodConfirm({
    buyerId: "other",
    order: order(),
    payment: payment(),
    items: [item()],
  }).action === "reject",
  "IDOR rejected",
);

assert(
  evaluateCodConfirm({
    buyerId: "buyer_1",
    order: order({ paymentMethod: "payhere" }),
    payment: payment({ method: "payhere" }),
    items: [item()],
  }).action === "reject",
  "wrong method rejected",
);

assert(
  evaluateCodConfirm({
    buyerId: "buyer_1",
    order: order({ totalAmount: 0 }),
    payment: payment({ amount: 0 }),
    items: [item({ unitPrice: 0, lineTotal: 0 })],
  }).action === "reject",
  "zero total rejected",
);

console.log("verify-cod-order: OK");
