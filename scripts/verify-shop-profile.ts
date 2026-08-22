/**
 * Runnable checks for shop profile validation + approved-only public gate.
 * Run: npx tsx scripts/verify-shop-profile.ts
 */
import {
  parseSellerApplicationInput,
  parseShopPolicyInput,
} from "../lib/services/seller-application";
import {
  isApprovedPublicSellerStatus,
  toPublicSellerInfo,
} from "../lib/services/sellers";

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

const publicSeller = toPublicSellerInfo({
  status: "approved",
  userId: "seller_1",
  shopName: "Demo Shop",
  slug: "demo-shop",
  bio: "Hello",
  bannerFileId: null,
  returnPolicy: "Returns ok",
  shippingPolicy: "Ships fast",
  bankAccountName: "Secret Name",
  bankAccountNumber: "1234567890",
  bankName: "Secret Bank",
  bankTransferNotes: "secret notes",
  rejectionReason: "should not leak",
});
assert(publicSeller !== null, "approved seller projects");
if (publicSeller) {
  assert(
    !("bankAccountNumber" in publicSeller),
    "public seller omits bankAccountNumber",
  );
  assert(!("bankName" in publicSeller), "public seller omits bankName");
  assert(
    !("bankAccountName" in publicSeller),
    "public seller omits bankAccountName",
  );
  assert(
    !("bankTransferNotes" in publicSeller),
    "public seller omits bankTransferNotes",
  );
  assert(
    !("rejectionReason" in publicSeller),
    "public seller omits rejectionReason",
  );
}

const policies = parseShopPolicyInput({
  returnPolicy: "  7-day returns  ",
  shippingPolicy: "",
});
assert(policies.ok, "valid policy input should parse");
if (policies.ok) {
  assert(policies.returnPolicy === "7-day returns", "return policy trimmed");
  assert(policies.shippingPolicy === null, "empty shipping → null");
}

assert(
  !parseShopPolicyInput({ returnPolicy: "x".repeat(2001) }).ok,
  "long return policy rejected",
);
assert(
  !parseShopPolicyInput({ shippingPolicy: "x".repeat(2001) }).ok,
  "long shipping policy rejected",
);

console.log("shop-profile validation checks passed");
