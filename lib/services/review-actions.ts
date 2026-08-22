"use server";

/**
 * Client-callable review mutations for storefront UI.
 */

import { revalidatePath } from "next/cache";
import {
  createProductReview as createProductReviewImpl,
  type CreateProductReviewInput,
} from "./reviews";
import type { ReviewActionState } from "./review-errors";

function revalidateReviewPaths(productId?: string) {
  if (productId) {
    revalidatePath(`/products/${productId}`);
  }
}

export async function createProductReview(
  input: CreateProductReviewInput,
): Promise<ReviewActionState> {
  const result = await createProductReviewImpl(input);
  if (result.success) {
    revalidateReviewPaths(input.productId);
  }
  return result;
}

export type { ReviewActionState } from "./review-errors";
