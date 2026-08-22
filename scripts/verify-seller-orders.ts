/**
 * Runnable checks for seller order IDOR predicate (no Appwrite).
 * Run: npx tsx scripts/verify-seller-orders.ts
 */
import { ownedBySeller } from "../lib/services/seller-orders";
import type { Order } from "../lib/types";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function order(sellerId: string): Order {
  return {
    $id: "ord_1",
    buyerId: "buyer_1",
    sellerId,
    status: "paid",
    totalAmount: 100,
    currency: "LKR",
    shippingAddress: "addr",
    paymentMethod: "payhere",
    couponCode: null,
    discountAmount: 0,
  };
}

assert(ownedBySeller(order("seller_1"), "seller_1"), "own seller matches");
assert(!ownedBySeller(order("seller_1"), "seller_2"), "other seller rejected");
assert(!ownedBySeller(order("seller_1"), ""), "empty seller rejected");

console.log("verify-seller-orders: OK");
