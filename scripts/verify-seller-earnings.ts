/**
 * Runnable checks for seller paid-payment aggregation (no Appwrite).
 * Run: npx tsx scripts/verify-seller-earnings.ts
 */
import { aggregatePaidEarnings } from "../lib/services/seller-earnings";
import type { Payment } from "../lib/types";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function payment(
  status: Payment["status"],
  amount: number,
  currency = "LKR",
): Payment {
  return {
    $id: `pay_${status}_${amount}`,
    orderId: `ord_${status}_${amount}`,
    method: "payhere",
    status,
    amount,
    currency,
    payherePaymentId: null,
    idempotencyKey: null,
  };
}

const mixed = aggregatePaidEarnings([
  payment("paid", 100),
  payment("paid", 50),
  payment("pending", 999),
  payment("awaiting_verification", 888),
  payment("failed", 777),
  payment("refunded", 666),
]);
assert(mixed.total === 150, "only paid summed");
assert(mixed.currency === "LKR", "currency from payments");

const empty = aggregatePaidEarnings([]);
assert(empty.total === 0, "empty => 0 total");
assert(empty.currency === "LKR", "empty => default currency");

const onlyUnpaid = aggregatePaidEarnings([
  payment("pending", 100),
  payment("refunded", 50),
]);
assert(onlyUnpaid.total === 0, "unpaid/refunded excluded");

const freePaid = aggregatePaidEarnings([payment("paid", 0)]);
assert(freePaid.total === 0, "paid zero amount included");

console.log("verify-seller-earnings: OK");
