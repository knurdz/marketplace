/**
 * Runnable checks for Member 3 step 3.7 inventory rules.
 * Run: npx tsx scripts/verify-seller-inventory.ts
 */
import {
  clampedStockDecrement,
  isProductPurchasable,
} from "../lib/services/products";
import { parseAvailableFlag } from "../lib/services/seller-listings";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`FAIL: ${message}`);
}

const active = {
  status: "active" as const,
  available: true,
  stock: 10,
};

assert(isProductPurchasable(active), "active + available + stock can buy");
assert(
  !isProductPurchasable({ ...active, available: false }),
  "availability off hides buy even if stock > 0",
);
assert(
  !isProductPurchasable({ ...active, stock: 0 }),
  "zero stock cannot buy",
);
assert(
  !isProductPurchasable({ ...active, status: "draft", stock: 10 }),
  "draft cannot buy",
);

assert(clampedStockDecrement(5, 3) === 3, "full decrement when stock covers qty");
assert(clampedStockDecrement(2, 5) === 2, "clamp to remaining stock");
assert(clampedStockDecrement(0, 4) === 0, "empty stock decrements 0");
assert(clampedStockDecrement(-3, 2) === 0, "negative stock treated as 0");
assert(clampedStockDecrement(4, -1) === 0, "negative qty treated as 0");

function stockAfterConfirm(stock: number, quantity: number): number {
  return Math.max(0, Math.floor(stock) - clampedStockDecrement(stock, quantity));
}

assert(stockAfterConfirm(1, 1) === 0, "exact confirm lands at 0");
assert(stockAfterConfirm(1, 9) === 0, "oversell confirm cannot go negative");
assert(stockAfterConfirm(8, 3) === 5, "partial confirm subtracts qty");

assert(parseAvailableFlag("on") === true, "checkbox on");
assert(parseAvailableFlag("true") === true, "true string");
assert(parseAvailableFlag(true) === true, "boolean true");
assert(parseAvailableFlag(null) === false, "missing checkbox is off");
assert(parseAvailableFlag("off") === false, "off is false");

console.log("seller-inventory checks passed");
