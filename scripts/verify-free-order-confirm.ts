/**
 * Runnable checks for free-confirm eligibility (step 1.24).
 * Run: npx tsx scripts/verify-free-order-confirm.ts
 */
import type { Order, OrderItem, Payment } from "../lib/types";
import {
  evaluateFreeConfirm,
  freeConfirmIdempotencyKey,
  isExactZeroAmount,
} from "../lib/services/free-order-rules";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`FAIL: ${message}`);
}

function order(overrides: Partial<Order> = {}): Order {
  return {
    $id: "ord_1",
    buyerId: "buyer_1",
    sellerId: "seller_1",
    status: "pending_payment",
    totalAmount: 0,
    currency: "LKR",
    shippingAddress: "1 Main St",
    paymentMethod: "free",
    ...overrides,
  };
}

function payment(overrides: Partial<Payment> = {}): Payment {
  return {
    $id: "pay_1",
    orderId: "ord_1",
    method: "free",
    status: "pending",
    amount: 0,
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
    title: "Free sticker",
    quantity: 1,
    unitPrice: 0,
    lineTotal: 0,
    ...overrides,
  };
}

function decide(overrides?: {
  buyerId?: string;
  order?: Partial<Order>;
  payment?: Partial<Payment>;
  items?: OrderItem[];
}) {
  return evaluateFreeConfirm({
    buyerId: overrides?.buyerId ?? "buyer_1",
    order: order(overrides?.order),
    payment: payment(overrides?.payment),
    items: overrides?.items ?? [item()],
  });
}

assert(isExactZeroAmount(0), "0 is exact zero");
assert(!isExactZeroAmount(0.01), "0.01 is not zero");
assert(!isExactZeroAmount(-0.01), "negative is not zero");
assert(!isExactZeroAmount(Number.NaN), "NaN is not zero");
assert(
  freeConfirmIdempotencyKey("ord_1") === "free:ord_1",
  "idempotency key prefix",
);

assert(decide().action === "settle", "happy path settles");

assert(
  decide({ buyerId: "other" }).action === "reject",
  "IDOR: other buyer rejected",
);

assert(
  decide({
    payment: { method: "payhere", amount: 0 },
  }).action === "reject",
  "payhere method rejected",
);

assert(
  decide({
    order: { totalAmount: 500 },
    payment: { amount: 0 },
  }).action === "reject",
  "nonzero order total rejected",
);

assert(
  decide({
    order: { totalAmount: 0 },
    payment: { amount: 500 },
  }).action === "reject",
  "nonzero payment amount rejected",
);

assert(
  decide({
    items: [item({ unitPrice: 100, lineTotal: 100 })],
  }).action === "reject",
  "paid line item rejected even if caller claims free",
);

assert(decide({ items: [] }).action === "reject", "empty items rejected");

assert(
  decide({
    payment: { status: "paid" },
    order: { status: "paid" },
  }).action === "noop",
  "already paid is idempotent noop",
);

const repairOrder = decide({
  payment: { status: "paid" },
  order: { status: "pending_payment" },
});
assert(repairOrder.action === "repair", "paid payment starts order repair");
if (repairOrder.action === "repair") {
  assert(
    repairOrder.repairOrder && !repairOrder.repairPayment,
    "paid payment repairs pending order without restocking",
  );
}

const repairPayment = decide({
  payment: { status: "pending" },
  order: { status: "paid" },
});
assert(
  repairPayment.action === "repair",
  "settled order starts payment repair",
);
if (repairPayment.action === "repair") {
  assert(
    repairPayment.repairPayment && !repairPayment.repairOrder,
    "pending payment on settled order repairs payment only",
  );
}

assert(
  decide({ order: { status: "cancelled" } }).action === "reject",
  "cancelled order rejected",
);

assert(
  decide({ payment: { status: "failed" } }).action === "reject",
  "failed payment rejected",
);

assert(
  decide({
    payment: { orderId: "ord_other" },
  }).action === "reject",
  "payment/order mismatch rejected",
);

console.log("free-order confirm eligibility checks passed");
