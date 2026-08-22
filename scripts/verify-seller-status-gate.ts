/**
 * Runnable checks for seller portal gate redirect helper.
 * Run: npx tsx scripts/verify-seller-status-gate.ts
 */
import {
  blockedSellerPortalDestination,
  parseSellerApplicationInput,
} from "../lib/services/seller-application";
import { homePathForUser, postLoginPath } from "../lib/appwrite/roles";
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
    bankTransferNotes: null,
    rejectionReason: status === "rejected" ? "Incomplete details" : null,
    returnPolicy: null,
    shippingPolicy: null,
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
// Shop/settings pages must not redirect labeled sellers to /seller/pending
// (pending page bounces them back to /seller — redirect loop).
assert(
  blockedSellerPortalDestination(true, profile("pending")) !== "/seller/pending",
  "labeled seller shop/settings must not redirect to pending",
);
assert(
  blockedSellerPortalDestination(false, profile("pending")) ===
    "/seller/pending",
  "pending without label → status page",
);
assert(
  blockedSellerPortalDestination(false, profile("rejected")) ===
    "/seller/pending",
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

assert(
  homePathForUser({ labels: ["admin"] }) === "/admin",
  "admin home",
);
assert(
  homePathForUser({ labels: ["seller"] }) === "/seller",
  "seller home",
);
assert(
  homePathForUser({ labels: ["buyer"] }) === "/market",
  "buyer home",
);
assert(
  homePathForUser({ labels: [] }) === "/market",
  "unlabeled account without seller profile → market (default buyer)",
);
assert(
  homePathForUser({ labels: ["user"] }) === "/market",
  "legacy user label is treated as buyer home",
);
assert(
  homePathForUser({ labels: [] }, "pending") === "/seller/pending",
  "pending applicant home",
);
assert(
  postLoginPath({ labels: ["seller"] }, "/market") === "/seller",
  "seller cannot next into market",
);
assert(
  postLoginPath({ labels: ["admin"] }, "/products/x") === "/admin",
  "admin cannot next into market product",
);
assert(
  postLoginPath({ labels: [] }, "/seller/pending", "pending") ===
    "/seller/pending",
  "pending may open holding page",
);
assert(
  postLoginPath({ labels: ["buyer"] }, "/cart") === "/cart",
  "buyer may next into cart",
);
assert(
  postLoginPath({ labels: ["user"] }, "/cart") === "/cart",
  "legacy user label may next into cart",
);
assert(
  postLoginPath({ labels: [] }, "/market") === "/market",
  "unlabeled may open market",
);

const ok = parseSellerApplicationInput({ shopName: "Campus Crafts" });
assert(ok.ok, "apply input still parses");

console.log("seller-status-gate checks passed");
