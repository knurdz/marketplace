/**
 * Runnable checks for shop profile validation + approved-only public gate.
 * Run: npx tsx scripts/verify-shop-profile.ts
 */
import { parseSellerApplicationInput } from "../lib/services/seller-application";
import { isApprovedPublicSellerStatus } from "../lib/services/sellers";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const ok = parseSellerApplicationInput({
  shopName: "Campus Crafts",
  bio: "Handmade stickers",
});
assert(ok.ok, "valid shop profile input should parse");
if (ok.ok) {
  assert(ok.shopName === "Campus Crafts", "shopName preserved");
  assert(ok.bio === "Handmade stickers", "bio preserved");
}

assert(
  !parseSellerApplicationInput({ shopName: "   " }).ok,
  "empty shop name rejected",
);
assert(
  !parseSellerApplicationInput({ shopName: "x".repeat(129) }).ok,
  "long shop name rejected",
);
assert(
  !parseSellerApplicationInput({
    shopName: "Shop",
    bio: "x".repeat(2001),
  }).ok,
  "long bio rejected",
);

assert(isApprovedPublicSellerStatus("approved"), "approved is public");
assert(!isApprovedPublicSellerStatus("pending"), "pending is not public");
assert(!isApprovedPublicSellerStatus("rejected"), "rejected is not public");
assert(!isApprovedPublicSellerStatus("invalid"), "invalid status not public");

console.log("shop-profile validation checks passed");
