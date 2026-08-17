import { AppwriteException, ID, Permission, Query, Role } from "node-appwrite";
import {
  DATABASE_ID,
  TABLE_REVIEWS,
  hasAppwritePublicConfig,
} from "@/lib/appwrite/config";
import { createPublicClient, createSessionClient } from "@/lib/appwrite/server";
import { getLoggedInUser } from "@/lib/appwrite/session";
import {
  assertRateLimit,
  getClientIp,
  RATE_LIMIT_MESSAGE,
  RATE_LIMITS,
} from "@/lib/security/rate-limit";
import type { Review } from "@/lib/types";
import { getOwnOrderItems, listOwnOrders } from "./orders";
import { getProduct } from "./products";
import {
  REVIEW_ERROR_CODES,
  type ReviewActionState,
  type ReviewErrorCode,
} from "./review-errors";

export {
  REVIEW_ERROR_CODES,
  type ReviewActionState,
  type ReviewErrorCode,
} from "./review-errors";

export type ReviewEligibility = {
  eligible: boolean;
  orderId?: string;
};

export type CreateProductReviewInput = {
  productId: string;
  productRating: number;
  sellerRating?: number | null;
  comment?: string | null;
};

function asNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return value.length > 0 ? value : null;
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function asRating(value: unknown): number | null {
  const n = asNumber(value, NaN);
  if (!Number.isFinite(n)) return null;
  const rounded = Math.floor(n);
  if (rounded < 1 || rounded > 5) return null;
  return rounded;
}

/** Map a TablesDB row to Review; returns null if required fields invalid. */
export function asReview(row: Record<string, unknown>): Review | null {
  const $id = asNullableString(row.$id);
  const orderId = asNullableString(row.orderId);
  const productId = asNullableString(row.productId);
  const buyerId = asNullableString(row.buyerId);
  const sellerId = asNullableString(row.sellerId);
  const productRating = asRating(row.productRating);
  if (!$id || !orderId || !productId || !buyerId || !sellerId || !productRating) {
    return null;
  }

  const sellerRatingRaw = row.sellerRating;
  const sellerRating =
    sellerRatingRaw == null || sellerRatingRaw === ""
      ? null
      : asRating(sellerRatingRaw);

  const commentRaw = row.comment;
  const comment =
    commentRaw == null
      ? null
      : typeof commentRaw === "string"
        ? commentRaw.trim().slice(0, 2000) || null
        : null;

  const createdAt = asNullableString(row.$createdAt) ?? undefined;

  return {
    $id,
    orderId,
    productId,
    buyerId,
    sellerId,
    productRating,
    sellerRating,
    comment,
    ...(createdAt ? { $createdAt: createdAt } : {}),
  };
}

function reviewRowPermissions(buyerId: string): string[] {
  return [
    Permission.read(Role.user(buyerId)),
    Permission.read(Role.label("admin")),
    Permission.update(Role.label("admin")),
    Permission.delete(Role.label("admin")),
  ];
}

function isUniqueConstraintError(error: unknown): boolean {
  if (error instanceof AppwriteException) {
    if (error.code === 409) return true;
    const msg = String(error.message || "").toLowerCase();
    return msg.includes("unique") || msg.includes("already exists");
  }
  return false;
}

async function assertReviewMutationRateLimit(userId: string): Promise<void> {
  const ip = await getClientIp();
  const result = assertRateLimit({
    bucket: "reviews",
    key: `${userId}:${ip}`,
    ...RATE_LIMITS.reviews,
  });
  if (!result.ok) {
    const err = new Error(RATE_LIMIT_MESSAGE);
    (err as Error & { code: ReviewErrorCode }).code =
      REVIEW_ERROR_CODES.RATE_LIMITED;
    throw err;
  }
}

async function requireUser() {
  const user = await getLoggedInUser();
  if (!user) {
    const err = new Error("You must be signed in.");
    (err as Error & { code: ReviewErrorCode }).code =
      REVIEW_ERROR_CODES.NOT_AUTHENTICATED;
    throw err;
  }
  return user;
}

function notConfiguredState(): ReviewActionState {
  return {
    error: "Reviews are not available right now.",
    errorCode: REVIEW_ERROR_CODES.NOT_CONFIGURED,
  };
}

function mapReviewError(err: unknown): ReviewActionState {
  const code = (err as Error & { code?: ReviewErrorCode }).code;
  if (code === REVIEW_ERROR_CODES.NOT_AUTHENTICATED) {
    return {
      error: "Sign in to leave a review.",
      errorCode: code,
    };
  }
  if (code === REVIEW_ERROR_CODES.RATE_LIMITED) {
    return {
      error: RATE_LIMIT_MESSAGE,
      errorCode: code,
    };
  }
  if (code === REVIEW_ERROR_CODES.NOT_ELIGIBLE) {
    return {
      error: "You can review this product after completing an order.",
      errorCode: code,
    };
  }
  if (code === REVIEW_ERROR_CODES.ALREADY_REVIEWED) {
    return {
      error: "You already reviewed this order.",
      errorCode: code,
    };
  }
  return {
    error: "Could not submit your review.",
    errorCode: REVIEW_ERROR_CODES.NOT_ALLOWED,
  };
}

function validateRating(value: number, label: string): string | null {
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    return `${label} must be between 1 and 5.`;
  }
  return null;
}

async function hasReviewForOrder(
  orderId: string,
  buyerId: string,
): Promise<boolean> {
  if (!hasAppwritePublicConfig()) return false;

  try {
    const { tables } = await createPublicClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_REVIEWS,
      queries: [
        Query.equal("orderId", orderId),
        Query.equal("buyerId", buyerId),
        Query.limit(1),
      ],
    });
    return result.rows.length > 0;
  } catch {
    return false;
  }
}

/** Find a completed own order containing the product that has not been reviewed yet. */
async function findEligibleReviewOrder(
  productId: string,
  buyerId: string,
): Promise<string | null> {
  const orders = await listOwnOrders({ limit: 50 });
  const completed = orders.filter((order) => order.status === "completed");

  for (const order of completed) {
    const items = await getOwnOrderItems(order.$id);
    const containsProduct = items.some((item) => item.productId === productId);
    if (!containsProduct) continue;

    const alreadyReviewed = await hasReviewForOrder(order.$id, buyerId);
    if (!alreadyReviewed) {
      return order.$id;
    }
  }

  return null;
}

/** Public list of reviews for a product (newest first). */
export async function listProductReviews(
  productId: string,
  opts?: { limit?: number },
): Promise<Review[]> {
  if (!hasAppwritePublicConfig()) return [];

  const trimmed = productId?.trim();
  if (!trimmed) return [];

  const limit = Math.min(Math.max(opts?.limit ?? 50, 1), 50);

  try {
    const { tables } = await createPublicClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_REVIEWS,
      queries: [
        Query.equal("productId", trimmed),
        Query.orderDesc("$createdAt"),
        Query.limit(limit),
      ],
    });

    const out: Review[] = [];
    for (const row of result.rows) {
      const review = asReview(row as unknown as Record<string, unknown>);
      if (review && review.productId === trimmed) {
        out.push(review);
      }
    }
    return out;
  } catch {
    return [];
  }
}

/** UI gating only — create re-validates eligibility server-side. */
export async function canReviewProduct(
  productId: string,
): Promise<ReviewEligibility> {
  if (!hasAppwritePublicConfig()) return { eligible: false };

  const user = await getLoggedInUser();
  if (!user) return { eligible: false };

  const trimmed = productId?.trim();
  if (!trimmed) return { eligible: false };

  const orderId = await findEligibleReviewOrder(trimmed, user.$id);
  if (!orderId) return { eligible: false };

  return { eligible: true, orderId };
}

/** Create a review after verifying a completed own order contains the product. */
export async function createProductReview(
  input: CreateProductReviewInput,
): Promise<ReviewActionState> {
  if (!hasAppwritePublicConfig()) return notConfiguredState();

  try {
    const user = await requireUser();
    await assertReviewMutationRateLimit(user.$id);

    const trimmedProductId = input.productId?.trim();
    if (!trimmedProductId) {
      return {
        error: "Product id is required.",
        errorCode: REVIEW_ERROR_CODES.INVALID_INPUT,
      };
    }

    const productRatingError = validateRating(
      input.productRating,
      "Product rating",
    );
    if (productRatingError) {
      return {
        error: productRatingError,
        errorCode: REVIEW_ERROR_CODES.INVALID_INPUT,
      };
    }

    let sellerRating: number | null = null;
    if (input.sellerRating != null && input.sellerRating !== undefined) {
      const sellerRatingError = validateRating(
        input.sellerRating,
        "Seller rating",
      );
      if (sellerRatingError) {
        return {
          error: sellerRatingError,
          errorCode: REVIEW_ERROR_CODES.INVALID_INPUT,
        };
      }
      sellerRating = input.sellerRating;
    }

    const comment =
      input.comment == null
        ? null
        : String(input.comment).trim().slice(0, 2000) || null;

    const product = await getProduct(trimmedProductId);
    if (!product) {
      return {
        error: "This product is not available.",
        errorCode: REVIEW_ERROR_CODES.PRODUCT_UNAVAILABLE,
      };
    }

    const orderId = await findEligibleReviewOrder(trimmedProductId, user.$id);
    if (!orderId) {
      const err = new Error("Not eligible to review.");
      (err as Error & { code: ReviewErrorCode }).code =
        REVIEW_ERROR_CODES.NOT_ELIGIBLE;
      throw err;
    }

    const { tables } = await createSessionClient();
    const row = await tables.createRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_REVIEWS,
      rowId: ID.unique(),
      data: {
        orderId,
        productId: trimmedProductId,
        buyerId: user.$id,
        sellerId: product.sellerId,
        productRating: input.productRating,
        sellerRating,
        comment,
      },
      permissions: reviewRowPermissions(user.$id),
    });

    const created = asReview(row as unknown as Record<string, unknown>);
    if (!created || created.buyerId !== user.$id) {
      return {
        error: "Could not submit your review.",
        errorCode: REVIEW_ERROR_CODES.NOT_ALLOWED,
      };
    }

    return { success: "Thank you — your review was submitted." };
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return {
        error: "You already reviewed this order.",
        errorCode: REVIEW_ERROR_CODES.ALREADY_REVIEWED,
      };
    }
    return mapReviewError(err);
  }
}
