/**
 * Runnable checks for seller portal gate redirect helper.
 * Run: npx tsx scripts/verify-seller-status-gate.ts
 */
import {
  blockedSellerPortalDestination,
  parseSellerApplicationInput,
} from "../lib/services/seller-application";
import { homePathForUser, postLoginPath } from "../lib/backend/roles";
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
    rejectionReason: status === "rejected" ? "Incomplete details" : null,
    returnPolicy: null,
    shippingPolicy: null,
  };
}

assert(
  blockedSellerPortalDestination(true, null) === null,
  "seller label without profile row allows portal",
);
assert(
  blockedSellerPortalDestination(true, profile("pending")) ===
    "/seller/pending",
  "pending profile → status page even with seller label",
);
assert(
  blockedSellerPortalDestination(true, profile("rejected")) ===
    "/seller/pending",
  "rejected profile → status page even with seller label",
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
  blockedSellerPortalDestination(true, profile("approved")) === null,
  "approved label + profile allows portal",
);

assert(
  homePathForUser({ labels: ["admin"] }) === "/admin",
  "admin home",
);
assert(
  homePathForUser({ labels: ["seller"] }) === "/seller",
  "approved seller home",
);
assert(
  homePathForUser({ labels: ["seller"] }, "rejected") === "/seller/pending",
  "stale seller label + rejected profile → pending",
);
assert(
  homePathForUser({ labels: ["buyer"] }) === "/",
  "buyer home",
);
assert(
  homePathForUser({ labels: [] }) === "/",
  "unlabeled account without seller profile → market (default buyer)",
);
assert(
  homePathForUser({ labels: ["user"] }) === "/",
  "legacy user label is treated as buyer home",
);
assert(
  homePathForUser({ labels: [] }, "pending") === "/seller/pending",
  "pending applicant home",
);
assert(
  homePathForUser({ labels: [] }, "rejected") === "/seller/pending",
  "rejected applicant home",
);
assert(
  postLoginPath({ labels: ["seller"] }, "/") === "/",
  "seller may next into market catalog",
);
assert(
  postLoginPath({ labels: ["seller"] }, "/", "rejected") === "/seller/pending",
  "stale label does not next into market when profile rejected",
);
assert(
  postLoginPath({ labels: ["admin"] }, "/products/x") === "/products/x",
  "admin may next into market product",
);
assert(
  postLoginPath({ labels: ["admin"] }, "/requests") === "/admin",
  "admin cannot next into buyer requests",
);
assert(
  postLoginPath({ labels: ["seller"] }, "/wishlist") === "/seller",
  "seller cannot next into buyer wishlist",
);
assert(
  postLoginPath({ labels: [] }, "/", "pending") === "/seller/pending",
  "pending cannot next into market",
);
assert(
  postLoginPath({ labels: [] }, "/seller/pending", "pending") ===
    "/seller/pending",
  "pending may open holding page",
);
assert(
  postLoginPath({ labels: ["buyer"] }, "/requests") === "/requests",
  "buyer may next into requests",
);
assert(
  postLoginPath({ labels: ["user"] }, "/requests") === "/requests",
  "legacy user label may next into requests",
);
assert(
  postLoginPath({ labels: [] }, "/") === "/",
  "unlabeled may open market",
);

const ok = parseSellerApplicationInput({ shopName: "Campus Crafts" });
assert(ok.ok, "apply input still parses");

console.log("seller-status-gate checks passed");
