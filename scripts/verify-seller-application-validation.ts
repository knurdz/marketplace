/**
 * Runnable validation checks for seller application input parsing.
 * Run: npx tsx scripts/verify-seller-application-validation.ts
 */
import {
  normalizeShopSlug,
  parseSellerApplicationInput,
  parseSellerBankDetailsInput,
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

const cleared = parseSellerBankDetailsInput({});
assert(cleared.ok, "empty bank input should clear");
if (cleared.ok) {
  assert(cleared.bankName === null, "cleared bank name");
  assert(cleared.bankAccountName === null, "cleared account name");
  assert(cleared.bankAccountNumber === null, "cleared account number");
  assert(cleared.bankTransferNotes === null, "cleared transfer notes");
}

assert(
  !parseSellerBankDetailsInput({ bankName: "Commercial Bank" }).ok,
  "partial bank input rejected",
);
assert(
  !parseSellerBankDetailsInput({
    bankName: "x".repeat(129),
    bankAccountName: "Seller",
    bankAccountNumber: "1234567890",
  }).ok,
  "long bank name rejected",
);
assert(
  !parseSellerBankDetailsInput({
    bankName: "Commercial Bank",
    bankAccountName: "Seller",
    bankAccountNumber: "ABC123",
  }).ok,
  "illegal account chars rejected",
);

assert(
  !parseSellerBankDetailsInput({
    bankTransferNotes: "Put the order ID in the remark",
  }).ok,
  "notes without bank details rejected",
);

const bankOk = parseSellerBankDetailsInput({
  bankName: "Commercial Bank",
  bankAccountName: "Campus Crafts",
  bankAccountNumber: "1234-5678 90",
  bankTransferNotes: "  Include the order ID in the remark  ",
});
assert(bankOk.ok, "valid bank triple should parse");
if (bankOk.ok) {
  assert(bankOk.bankName === "Commercial Bank", "bank name preserved");
  assert(bankOk.bankAccountName === "Campus Crafts", "account name preserved");
  assert(bankOk.bankAccountNumber === "1234-5678 90", "account number preserved");
  assert(
    bankOk.bankTransferNotes === "Include the order ID in the remark",
    "transfer notes trimmed",
  );
}

assert(
  !parseSellerBankDetailsInput({
    bankName: "Commercial Bank",
    bankAccountName: "Campus Crafts",
    bankAccountNumber: "1234567890",
    bankTransferNotes: "x".repeat(2001),
  }).ok,
  "long transfer notes rejected",
);

console.log("seller-application validation checks passed");
