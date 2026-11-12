/**
 * Patch merge + change summary checks for active listing edits.
 * Run: npx tsx scripts/verify-listing-revisions.ts
 */
import type { Product, ProductImage } from "../lib/types";
import {
  buildAdminChangeLines,
  isRevisionPatchEmpty,
  mergeFieldPatch,
  pruneRevisionPatch,
} from "../lib/services/listing-revisions";
import { ACTIVE_PRODUCT_STATUS } from "../lib/types/status";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const liveProduct: Product = {
  $id: "prod_1",
  sellerId: "seller_1",
  categoryId: "cat_a",
  title: "Original",
  description: "Desc",
  price: 100,
  isFree: false,
  status: ACTIVE_PRODUCT_STATUS,
  stock: 5,
  available: true,
  currency: "LKR",
  featured: false,
};

const liveImages: ProductImage[] = [
  {
    $id: "img_1",
    productId: "prod_1",
    fileId: "file_a",
    sortOrder: 0,
    alt: null,
  },
];

const merged = mergeFieldPatch(
  {},
  {
    title: "Updated",
    description: "Desc",
    categoryId: "cat_a",
    price: 100,
    stock: 5,
    isFree: false,
  },
  true,
);
const pruned = pruneRevisionPatch(liveProduct, liveImages, merged);
assert(pruned.title === "Updated", "title change kept");
assert(pruned.description === undefined, "unchanged description pruned");
assert(!isRevisionPatchEmpty(pruned), "non-empty after title change");

const noop = pruneRevisionPatch(liveProduct, liveImages, merged);
assert(noop.title === "Updated", "title still differs");

const revertTitle = pruneRevisionPatch(liveProduct, liveImages, {
  title: "Original",
});
assert(isRevisionPatchEmpty(revertTitle), "revert to live clears patch");

const imagePatch = pruneRevisionPatch(liveProduct, liveImages, {
  images: [{ fileId: "file_b", sortOrder: 0, alt: null }],
});
assert(imagePatch.images !== undefined, "image swap stays in patch");

const lines = buildAdminChangeLines(
  liveProduct,
  { title: "Updated", stock: 8 },
  {
    categoryNameById: new Map([
      ["cat_a", "Art"],
      ["cat_b", "Books"],
    ]),
    liveImages,
  },
);
assert(lines.some((l) => l.startsWith("Title:")), "title line");
assert(lines.some((l) => l.startsWith("Stock:")), "stock line");

console.log("verify-listing-revisions: OK");
