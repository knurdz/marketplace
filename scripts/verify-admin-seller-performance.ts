/**
 * Runnable checks for admin seller-performance aggregation (no Appwrite).
 * Run: npx tsx scripts/verify-admin-seller-performance.ts
 */
import { aggregateSellerPerformanceRows } from "../lib/services/admin-seller-performance";
import type { PurchaseRequest } from "../lib/types";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function seller(
  sellerId: string,
  shopName = `${sellerId} shop`,
  slug = sellerId,
  profileId = `profile_${sellerId}`,
) {
  return { profileId, sellerId, shopName, slug };
}

function request(
  $id: string,
  sellerId: string,
  status: PurchaseRequest["status"],
): PurchaseRequest {
  return {
    $id,
    productId: "prod_1",
    buyerId: "buyer_1",
    sellerId,
    quantity: 1,
    unitPrice: 100,
    currency: "LKR",
    status,
    title: "Demo",
  };
}

const empty = aggregateSellerPerformanceRows([], []);
assert(empty.length === 0, "no sellers => empty rows");

const zeros = aggregateSellerPerformanceRows([seller("s1")], []);
assert(zeros.length === 1, "seller with no requests still listed");
assert(zeros[0]?.orderCount === 0, "empty => 0 sold");
assert(zeros[0]?.pendingCount === 0, "empty => 0 open");
assert(zeros[0]?.cancelledCount === 0, "empty => 0 cancelled");
assert(zeros[0]?.sellerId === "s1", "sellerId preserved");
assert(zeros[0]?.shopName === "s1 shop", "shopName preserved");
assert(zeros[0]?.slug === "s1", "slug preserved");

const mixed = aggregateSellerPerformanceRows(
  [seller("s1")],
  [
    request("r_sold", "s1", "sold"),
    request("r_sold2", "s1", "sold"),
    request("r_open", "s1", "requested"),
    request("r_cancelled", "s1", "cancelled"),
    request("r_cancelled2", "s1", "cancelled"),
  ],
);
assert(mixed[0]?.orderCount === 2, "sold counted");
assert(mixed[0]?.pendingCount === 1, "open counted");
assert(mixed[0]?.cancelledCount === 2, "cancelled counted");

const isolated = aggregateSellerPerformanceRows(
  [seller("sA", "Shop A", "a"), seller("sB", "Shop B", "b")],
  [
    request("ra", "sA", "sold"),
    request("rb", "sB", "requested"),
    request("rc", "sB", "cancelled"),
  ],
);
assert(isolated[0]?.sellerId === "sA", "seller A first");
assert(isolated[0]?.orderCount === 1, "seller A sold isolated");
assert(isolated[0]?.pendingCount === 0, "seller A open isolated");
assert(isolated[0]?.cancelledCount === 0, "seller A cancelled isolated");
assert(isolated[1]?.sellerId === "sB", "seller B second");
assert(isolated[1]?.orderCount === 0, "seller B sold isolated");
assert(isolated[1]?.pendingCount === 1, "seller B open isolated");
assert(isolated[1]?.cancelledCount === 1, "seller B cancelled isolated");

const stray = aggregateSellerPerformanceRows(
  [seller("sA")],
  [request("rb", "sB", "sold")],
);
assert(stray[0]?.orderCount === 0, "other seller requests excluded");

console.log("verify-admin-seller-performance: OK");
