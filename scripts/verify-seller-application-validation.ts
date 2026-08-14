/**
 * Runnable validation checks for seller application input parsing.
 * Run: npx tsx scripts/verify-seller-application-validation.ts
 */
import {
  normalizeShopSlug,
  parseSellerApplicationInput,
} from "../lib/services/seller-application";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const ok = parseSellerApplicationInput({
  shopName: "Campus Crafts",
  bio: "Handmade stickers",
});
assert(ok.ok, "valid input should parse");
if (ok.ok) {
  assert(ok.shopName === "Campus Crafts", "shopName preserved");
  assert(ok.slug === "campus-crafts", "slug derived from shop name");
  assert(ok.bio === "Handmade stickers", "bio preserved");
}

const customSlug = parseSellerApplicationInput({
  shopName: "My Shop",
  slug: "custom_slug",
});
assert(customSlug.ok, "custom slug should parse");
if (customSlug.ok) {
  assert(customSlug.slug === "custom-slug", "slug normalized");
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
  !parseSellerApplicationInput({ shopName: "!!!" }).ok,
  "slug-less punctuation rejected",
);

assert(normalizeShopSlug("Hello World") === "hello-world", "slug helper");

console.log("seller-application validation checks passed");
