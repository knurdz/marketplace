/**
 * Runnable checks for storefront product search helpers (no DB).
 * Run: npx tsx scripts/verify-product-search.ts
 */
import {
  escapeLikeWildcards,
  normalizeProductSearchQuery,
  tokenizeProductSearchQuery,
} from "../lib/services/products";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function assertEq<T>(actual: T, expected: T, message: string): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${message}: got ${a}, expected ${e}`);
}

// normalize
assertEq(normalizeProductSearchQuery("  ceramic   mug  "), "ceramic mug", "collapse spaces");
assertEq(normalizeProductSearchQuery("   "), null, "whitespace-only → null");
assertEq(normalizeProductSearchQuery(""), null, "empty → null");
assert(
  (normalizeProductSearchQuery("x".repeat(100)) ?? "").length === 64,
  "cap at 64 chars",
);

// tokenize: drop 1-char when longer exists; all 1-char → []
assertEq(tokenizeProductSearchQuery("ceramic mug"), ["ceramic", "mug"], "multi-word tokens");
assertEq(tokenizeProductSearchQuery("a red mug"), ["red", "mug"], "drop short filler");
assertEq(tokenizeProductSearchQuery("a"), [], "single char → too short");
assertEq(tokenizeProductSearchQuery("x y"), [], "all one-char → too short");
assertEq(tokenizeProductSearchQuery("st"), ["st"], "two-char kept");

// LIKE escaping
assertEq(escapeLikeWildcards("100%"), "100\\%", "escape percent");
assertEq(escapeLikeWildcards("a_b"), "a\\_b", "escape underscore");
assertEq(escapeLikeWildcards("a\\b"), "a\\\\b", "escape backslash");
assertEq(escapeLikeWildcards("50%_off\\sale"), "50\\%\\_off\\\\sale", "escape all");

// “ceramic mug” must be two AND tokens (matches Ceramic Coffee Mug via title)
const ceramicTokens = tokenizeProductSearchQuery(
  normalizeProductSearchQuery("ceramic mug")!,
);
assertEq(ceramicTokens, ["ceramic", "mug"], "ceramic mug → AND tokens for title phrase gaps");

// description / category / shop would be matched by the same token Match SQL
// (integration covered by searchActiveProducts field ORs — unit check tokens only)
assertEq(
  tokenizeProductSearchQuery(normalizeProductSearchQuery("handmade")!),
  ["handmade"],
  "single description-style token",
);
assertEq(
  tokenizeProductSearchQuery(normalizeProductSearchQuery("Home Decor")!),
  ["Home", "Decor"],
  "category-style tokens preserved case for LIKE LOWER()",
);

console.log("verify-product-search: ok");
