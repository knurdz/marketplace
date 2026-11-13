/**
 * Seller slug claim rules (rejected profiles do not hold public slugs).
 * Run: npx tsx scripts/verify-seller-slug-claims.ts
 */
import {
  SELLER_SLUG_HOLDING_STATUSES,
  rejectedSellerPlaceholderSlug,
  sellerProfileStatusClaimsSlug,
} from "../lib/services/seller-slug";
import type { SellerStatus } from "../lib/types";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const allStatuses: SellerStatus[] = [
  "pending",
  "rejected",
  "approved",
  "banned",
];

for (const status of allStatuses) {
  const expected = (SELLER_SLUG_HOLDING_STATUSES as readonly string[]).includes(
    status,
  );
  assert(
    sellerProfileStatusClaimsSlug(status) === expected,
    `claim rule for ${status}`,
  );
}

assert(
  !sellerProfileStatusClaimsSlug("rejected"),
  "rejected must not hold slug",
);
assert(sellerProfileStatusClaimsSlug("pending"), "pending holds slug");
assert(sellerProfileStatusClaimsSlug("approved"), "approved holds slug");
assert(sellerProfileStatusClaimsSlug("banned"), "banned holds slug");

const profileId = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
const placeholder = rejectedSellerPlaceholderSlug(profileId);
assert(
  placeholder === `rejected-${profileId}`,
  "rejected placeholder slug format",
);
assert(placeholder.length <= 128, "placeholder within column limit");

console.log("seller-slug-claims checks passed");
