"use server";

/**
 * Client-callable cart mutations for storefront UI.
 * Next.js requires direct async exports in "use server" files (no re-exports).
 */

import { revalidatePath } from "next/cache";
import {
  addToCart as addToCartImpl,
  clearCart as clearCartImpl,
  clearCartAndAdd as clearCartAndAddImpl,
  removeCartItem as removeCartItemImpl,
  updateCartItemQuantity as updateCartItemQuantityImpl,
} from "./cart";
import type { CartActionState } from "./cart-errors";

function revalidateCartPaths() {
  revalidatePath("/cart");
  revalidatePath("/", "layout");
}

export async function addToCart(
  productId: string,
  quantity: number,
): Promise<CartActionState> {
  const result = await addToCartImpl({ productId, quantity });
  if (result.success) revalidateCartPaths();
  return result;
}

export async function clearCartAndAdd(
  productId: string,
  quantity: number,
): Promise<CartActionState> {
  const result = await clearCartAndAddImpl({ productId, quantity });
  if (result.success) revalidateCartPaths();
  return result;
}

export async function updateCartItemQuantity(
  itemId: string,
  quantity: number,
): Promise<CartActionState> {
  const result = await updateCartItemQuantityImpl({ itemId, quantity });
  if (result.success) revalidateCartPaths();
  return result;
}

export async function removeCartItem(
  itemId: string,
): Promise<CartActionState> {
  const result = await removeCartItemImpl(itemId);
  if (result.success) revalidateCartPaths();
  return result;
}

export async function clearCart(): Promise<CartActionState> {
  const result = await clearCartImpl();
  if (result.success) revalidateCartPaths();
  return result;
}

export type { CartActionState } from "./cart-errors";
