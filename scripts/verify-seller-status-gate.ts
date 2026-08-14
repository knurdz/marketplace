/**
 * Runnable checks for seller portal gate redirect helper.
 * Run: npx tsx scripts/verify-seller-status-gate.ts
 */
import {
  blockedSellerPortalDestination,
  parseSellerApplicationInput,
} from "../lib/services/seller-application";
import type { SellerProfile } from "../lib/types";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function profile(status: SellerProfile["status"]): SellerProfile {
  return {
    $id: "p1",
    userId: "u1",
    shopName: "Test Shop",
    slug: "test-shop",
    bio: null,
    bannerFileId: null,
    status,
    bankAccountName: null,
    bankAccountNumber: null,
    bankName: null,
    rejectionReason: status === "rejected" ? "Incomplete details" : null,
  };
}

assert(
  blockedSellerPortalDestination(true, null) === null,
  "seller label allows portal",
);
assert(
  blockedSellerPortalDestination(true, profile("pending")) === null,
  "seller label allows even with pending row",
);
assert(
  blockedSellerPortalDestination(false, profile("pending")) ===
    "/become-seller",
  "pending without label → status page",
);
assert(
  blockedSellerPortalDestination(false, profile("rejected")) ===
    "/become-seller",
  "rejected without label → status page",
);
assert(
  blockedSellerPortalDestination(false, null) === "/",
  "no profile → home",
);
assert(
  blockedSellerPortalDestination(false, profile("approved")) === "/",
  "approved without label → home (label is authoritative gate)",
);

const ok = parseSellerApplicationInput({ shopName: "Campus Crafts" });
assert(ok.ok, "apply input still parses");

console.log("seller-status-gate checks passed");
