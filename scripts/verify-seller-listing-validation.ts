/**
 * Runnable validation checks for seller draft listing input parsing.
 * Run: npx tsx scripts/verify-seller-listing-validation.ts
 */
import {
  canSubmitListingForReview,
  parseCreateDraftProductInput,
} from "../lib/services/seller-listings";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const valid = parseCreateDraftProductInput({
  title: "Sticker pack",
  description: "Handmade vinyl stickers for laptops.",
  categoryId: "cat_demo_001",
  price: 500,
  stock: 10,
});
assert(valid.ok, "valid input should parse");
if (valid.ok) {
  assert(valid.title === "Sticker pack", "title preserved");
  assert(valid.isFree === false, "paid listing not free");
  assert(valid.stock === 10, "stock preserved");
  assert(valid.available === true, "omitted available defaults true");
}

const unavailable = parseCreateDraftProductInput({
  title: "Paused item",
  description: "Temporarily off sale.",
  categoryId: "cat_demo_001",
  price: 100,
  stock: 5,
  available: false,
});
assert(unavailable.ok, "available false should parse");
if (unavailable.ok) {
  assert(unavailable.available === false, "available false preserved");
}

assert(
  !parseCreateDraftProductInput({
    title: "Item",
    description: "x",
    categoryId: "c1",
    price: 1,
    stock: 1,
    available: "maybe",
  }).ok,
  "invalid available rejected",
);

const freeListing = parseCreateDraftProductInput({
  title: "Free sample",
  description: "One per buyer.",
  categoryId: "cat_demo_001",
  price: 0,
  stock: 5,
});
assert(freeListing.ok, "price 0 should parse");
if (freeListing.ok) {
  assert(freeListing.isFree === true, "price 0 => isFree");
}

assert(
  !parseCreateDraftProductInput({
    title: "   ",
    description: "x",
    categoryId: "c1",
    price: 1,
    stock: 1,
  }).ok,
  "empty title rejected",
);

assert(
  !parseCreateDraftProductInput({
    title: "x".repeat(201),
    description: "x",
    categoryId: "c1",
    price: 1,
    stock: 1,
  }).ok,
  "long title rejected",
);

assert(
  !parseCreateDraftProductInput({
    title: "Item",
    description: "",
    categoryId: "c1",
    price: 1,
    stock: 1,
  }).ok,
  "empty description rejected",
);

assert(
  !parseCreateDraftProductInput({
    title: "Item",
    description: "x",
    categoryId: "",
    price: 1,
    stock: 1,
  }).ok,
  "empty category rejected",
);

assert(
  !parseCreateDraftProductInput({
    title: "Item",
    description: "x",
    categoryId: "c1",
    price: -1,
    stock: 1,
  }).ok,
  "negative price rejected",
);

assert(
  !parseCreateDraftProductInput({
    title: "Item",
    description: "x",
    categoryId: "c1",
    price: 1,
    stock: -1,
  }).ok,
  "negative stock rejected",
);

assert(
  !parseCreateDraftProductInput({
    title: "Item",
    description: "x",
    categoryId: "c1",
    price: 1,
    stock: 1,
    sellerId: "forged",
  }).ok,
  "sellerId from form rejected",
);

assert(
  !parseCreateDraftProductInput({
    title: "Item",
    description: "x",
    categoryId: "c1",
    price: 1,
    stock: 1,
    status: "active",
  }).ok,
  "status from form rejected",
);

assert(canSubmitListingForReview("draft"), "draft can submit");
assert(canSubmitListingForReview("rejected"), "rejected can submit");
assert(!canSubmitListingForReview("pending_review"), "pending_review cannot submit");
assert(!canSubmitListingForReview("active"), "active cannot submit");
assert(!canSubmitListingForReview("archived"), "archived cannot submit");

console.log("seller-listing validation checks passed");
