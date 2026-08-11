"use server";

/**
 * Client-callable wishlist mutations for storefront UI.
 */

import { revalidatePath } from "next/cache";
import {
  addToOwnWishlist as addToOwnWishlistImpl,
  removeFromOwnWishlist as removeFromOwnWishlistImpl,
  toggleOwnWishlistProduct as toggleOwnWishlistProductImpl,
} from "./wishlist";
import type { WishlistActionState } from "./wishlist-errors";

function revalidateWishlistPaths(productId?: string) {
  revalidatePath("/wishlist");
  revalidatePath("/", "layout");
  if (productId) {
    revalidatePath(`/products/${productId}`);
  }
}

export async function addToWishlist(
  productId: string,
): Promise<WishlistActionState> {
  const result = await addToOwnWishlistImpl(productId);
  if (result.success || result.saved) {
    revalidateWishlistPaths(productId);
  }
  return result;
}

export async function removeFromWishlist(
  productId: string,
): Promise<WishlistActionState> {
  const result = await removeFromOwnWishlistImpl(productId);
  if (result.success) {
    revalidateWishlistPaths(productId);
  }
  return result;
}

export async function toggleWishlistProduct(
  productId: string,
): Promise<WishlistActionState> {
  const result = await toggleOwnWishlistProductImpl(productId);
  if (result.success || result.saved !== undefined) {
    revalidateWishlistPaths(productId);
  }
  return result;
}

export type { WishlistActionState } from "./wishlist-errors";
