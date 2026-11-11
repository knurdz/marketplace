"use server";

import { revalidatePath } from "next/cache";
import {
  approveReview as approveReviewImpl,
  createSellerReview as createSellerReviewImpl,
  rejectReview as rejectReviewImpl,
  type CreateSellerReviewInput,
} from "./reviews";
import type { ReviewActionState } from "./review-errors";
import type { ReviewModerationResult } from "./reviews";
import { verifyFormGuard } from "@/lib/security/bot-guard";

export async function createSellerReview(
  formData: FormData,
): Promise<ReviewActionState> {
  const guard = await verifyFormGuard(formData, "review.seller.create");
  if (!guard.ok) {
    return { error: "Could not submit this form. Please refresh and try again." };
  }
  const input: CreateSellerReviewInput = {
    requestId: readString(formData, "requestId"),
    rating: Number(readString(formData, "rating")),
    comment: readString(formData, "comment") || null,
  };
  const result = await createSellerReviewImpl(input);
  if (result.success) {
    revalidatePath(`/requests/${input.requestId}`);
    revalidatePath("/admin/reviews");
  }
  return result;
}

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function approveReviewAction(
  _prev: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  const reviewId =
    typeof formData.get("reviewId") === "string"
      ? String(formData.get("reviewId")).trim()
      : "";
  const result: ReviewModerationResult = await approveReviewImpl(reviewId);
  if (!result.ok) {
    return { error: result.error };
  }
  revalidatePath("/admin/reviews");
  revalidatePath("/shop", "layout");
  return { success: result.message };
}

export async function rejectReviewAction(
  _prev: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  const reviewId =
    typeof formData.get("reviewId") === "string"
      ? String(formData.get("reviewId")).trim()
      : "";
  const result: ReviewModerationResult = await rejectReviewImpl(reviewId);
  if (!result.ok) {
    return { error: result.error };
  }
  revalidatePath("/admin/reviews");
  return { success: result.message };
}

/** @deprecated */
export async function createProductReview(): Promise<ReviewActionState> {
  return {
    error:
      "Product reviews are no longer supported. Review the seller from a sold request.",
  };
}

export type { ReviewActionState } from "./review-errors";
