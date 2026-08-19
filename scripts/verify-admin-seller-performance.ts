/**
 * Runnable checks for admin seller-performance aggregation (no Appwrite).
 * Run: npx tsx scripts/verify-admin-seller-performance.ts
 */
import { aggregateSellerPerformanceRows } from "../lib/services/admin-seller-performance";
import type { Order, Payment } from "../lib/types";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function seller(
  sellerId: string,
  shopName = `${sellerId} shop`,
  slug = sellerId,
) {
  return { sellerId, shopName, slug };
}

function order(
  $id: string,
  sellerId: string,
  status: Order["status"],
  totalAmount: number,
): Order {
  return {
    $id,
    buyerId: "buyer_1",
    sellerId,
    status,
    totalAmount,
    currency: "LKR",
    shippingAddress: "addr",
    paymentMethod: "payhere",
  };
}

function payment(
  $id: string,
  orderId: string,
  status: Payment["status"],
  amount: number,
): Payment {
  return {
    $id,
    orderId,
    method: "payhere",
    status,
    amount,
    currency: "LKR",
    payherePaymentId: null,
    idempotencyKey: null,
  };
}

const empty = aggregateSellerPerformanceRows([], [], []);
assert(empty.length === 0, "no sellers => empty rows");

const zeros = aggregateSellerPerformanceRows([seller("s1")], [], []);
assert(zeros.length === 1, "seller with no orders still listed");
assert(zeros[0]?.orderCount === 0, "empty orders => 0 orderCount");
assert(zeros[0]?.pendingCount === 0, "empty orders => 0 pendingCount");
assert(zeros[0]?.revenue === 0, "empty payments => 0 revenue");
assert(zeros[0]?.currency === "LKR", "empty payments => default currency");
assert(zeros[0]?.sellerId === "s1", "sellerId preserved");
assert(zeros[0]?.shopName === "s1 shop", "shopName preserved");
assert(zeros[0]?.slug === "s1", "slug preserved");

const mixedOrders = [
  order("o_paid", "s1", "paid", 100),
  order("o_processing", "s1", "processing", 50),
  order("o_shipped", "s1", "shipped", 25),
  order("o_ready", "s1", "ready_pickup", 10),
  order("o_completed", "s1", "completed", 200),
  order("o_pending", "s1", "pending_payment", 999),
  order("o_review", "s1", "payment_review", 888),
  order("o_cancelled", "s1", "cancelled", 777),
  order("o_refunded", "s1", "refunded", 666),
];
const mixedPayments = [
  payment("p_paid", "o_paid", "paid", 100),
  payment("p_processing", "o_processing", "paid", 50),
  payment("p_completed", "o_completed", "paid", 200),
  payment("p_refunded", "o_refunded", "refunded", 666),
  payment("p_pending", "o_pending", "pending", 999),
  payment("p_failed", "o_review", "failed", 888),
];

const mixed = aggregateSellerPerformanceRows(
  [seller("s1")],
  mixedOrders,
  mixedPayments,
);
assert(mixed[0]?.orderCount === 9, "all order statuses counted");
assert(
  mixed[0]?.pendingCount === 4,
  "pending is paid/processing/shipped/ready_pickup only",
);
assert(
  mixed[0]?.revenue === 350,
  "revenue is paid payments only (not order totals, not refunded)",
);

const isolated = aggregateSellerPerformanceRows(
  [seller("sA", "Shop A", "a"), seller("sB", "Shop B", "b")],
  [
    order("oa", "sA", "paid", 100),
    order("ob", "sB", "paid", 200),
  ],
  [
    payment("pa", "oa", "paid", 100),
    payment("pb", "ob", "paid", 200),
    payment("orphan", "unknown", "paid", 500),
  ],
);
assert(isolated[0]?.sellerId === "sA", "seller A first");
assert(isolated[0]?.revenue === 100, "seller A revenue isolated");
assert(isolated[0]?.orderCount === 1, "seller A orders isolated");
assert(isolated[1]?.sellerId === "sB", "seller B second");
assert(isolated[1]?.revenue === 200, "seller B revenue isolated");
assert(isolated[1]?.orderCount === 1, "seller B orders isolated");

const strayOrder = aggregateSellerPerformanceRows(
  [seller("sA")],
  [order("ob", "sB", "paid", 200)],
  [payment("pb", "ob", "paid", 200)],
);
assert(strayOrder[0]?.orderCount === 0, "other seller orders excluded");
assert(strayOrder[0]?.revenue === 0, "other seller payments excluded");

console.log("verify-admin-seller-performance: OK");
