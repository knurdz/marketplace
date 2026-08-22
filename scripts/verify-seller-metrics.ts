/**
 * Runnable checks for seller revenue aggregation (no Appwrite).
 * Run: npx tsx scripts/verify-seller-metrics.ts
 */
import { aggregatePaidEarnings } from "../lib/services/seller-earnings";
import { aggregateSellerRevenue } from "../lib/services/seller-metrics";
import type { Order, Payment } from "../lib/types";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function order(
  status: Order["status"],
  totalAmount: number,
  currency = "LKR",
): Order {
  return {
    $id: `ord_${status}_${totalAmount}`,
    buyerId: "buyer_1",
    sellerId: "seller_1",
    status,
    totalAmount,
    currency,
    shippingAddress: "addr",
    paymentMethod: "payhere",
    couponCode: null,
    discountAmount: 0,
  };
}

const mixed = aggregateSellerRevenue([
  order("paid", 100),
  order("processing", 50),
  order("shipped", 25),
  order("completed", 200),
  order("pending_payment", 999),
  order("payment_review", 888),
  order("cancelled", 777),
  order("refunded", 666),
]);
assert(mixed.revenue === 375, "paid-or-later summed");
assert(mixed.currency === "LKR", "currency from orders");

const empty = aggregateSellerRevenue([]);
assert(empty.revenue === 0, "empty => 0 revenue");
assert(empty.currency === "LKR", "empty => default currency");

const onlyUnpaid = aggregateSellerRevenue([
  order("pending_payment", 100),
  order("cancelled", 50),
]);
assert(onlyUnpaid.revenue === 0, "unpaid/cancelled excluded");

function payment(
  status: Payment["status"],
  amount: number,
): Payment {
  return {
    $id: `pay_${status}_${amount}`,
    orderId: `ord_${status}_${amount}`,
    method: "payhere",
    status,
    amount,
    currency: "LKR",
    payherePaymentId: null,
    idempotencyKey: null,
  };
}

const dashboardRevenue = aggregatePaidEarnings([
  payment("paid", 100),
  payment("refunded", 50),
  payment("pending", 25),
]);
assert(
  dashboardRevenue.total === 100,
  "dashboard revenue matches paid payments only",
);

console.log("verify-seller-metrics: OK");
