/**
 * Runnable checks for seller fulfillment FSM (no Appwrite).
 * Run: npx tsx scripts/verify-seller-fulfillment.ts
 */
import {
  canSellerFulfillmentTransition,
  sellerFulfillmentNextStatuses,
} from "../lib/types/status";
import type { OrderStatus } from "../lib/types";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const allowed: Array<[OrderStatus, OrderStatus]> = [
  ["paid", "processing"],
  ["processing", "shipped"],
  ["processing", "ready_pickup"],
  ["shipped", "completed"],
  ["ready_pickup", "completed"],
];

for (const [from, to] of allowed) {
  assert(
    canSellerFulfillmentTransition(from, to),
    `${from} -> ${to} allowed`,
  );
}

assert(
  canSellerFulfillmentTransition("processing", "processing"),
  "same status idempotent",
);
assert(
  canSellerFulfillmentTransition("paid", "paid"),
  "same status idempotent paid",
);

const rejected: Array<[OrderStatus, OrderStatus]> = [
  ["paid", "shipped"],
  ["paid", "completed"],
  ["processing", "completed"],
  ["shipped", "ready_pickup"],
  ["ready_pickup", "shipped"],
  ["pending_payment", "processing"],
  ["payment_review", "processing"],
  ["cancelled", "processing"],
  ["refunded", "completed"],
  ["completed", "processing"],
];

for (const [from, to] of rejected) {
  assert(
    !canSellerFulfillmentTransition(from, to),
    `${from} -> ${to} rejected`,
  );
}

assert(
  sellerFulfillmentNextStatuses("paid").join() === "processing",
  "next from paid",
);
assert(
  sellerFulfillmentNextStatuses("processing").join() === "shipped,ready_pickup",
  "next from processing",
);
assert(
  sellerFulfillmentNextStatuses("completed").length === 0,
  "completed has no next",
);

console.log("verify-seller-fulfillment: OK");
