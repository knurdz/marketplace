import { DbException, ID, Permission, Query, Role } from "@/lib/db/compat";
import {
  DATABASE_ID,
  TABLE_REVIEWS,
  hasDatabaseConfig,
} from "@/lib/backend/config";
import { ROLE_LABELS, requireLabel, userHasLabel } from "@/lib/backend/roles";
import {
  createAdminClient,
  createPublicClient,
  createSessionClient,
} from "@/lib/backend/server";
import { getLoggedInUser } from "@/lib/backend/session";
import { notifyAdminsEvent, notifyUserEvent } from "@/lib/email/events";
import {
  assertRateLimit,
  getClientIp,
  RATE_LIMIT_MESSAGE,
  RATE_LIMITS,
} from "@/lib/security/rate-limit";
import { logError } from "@/lib/observability/log-error";
import type { Review, ReviewStatus } from "@/lib/types";
import { isReviewStatus } from "@/lib/types";
import { writeAuditLog } from "./audit-logs";
import { getOwnPurchaseRequestDetail } from "./purchase-requests";
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
  requestId?: string;
  existingStatus?: ReviewStatus;
};

export type CreateSellerReviewInput = {
  requestId: string;
  rating: number;
  comment?: string | null;
};

export type ReviewModerationResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

export type AdminReviewView = {
  $id: string;
  requestId: string;
  buyerId: string;
  sellerId: string;
  rating: number;
  comment: string | null;
  status: ReviewStatus;
  $createdAt: string | null;
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
  const requestId = asNullableString(row.requestId);
  const buyerId = asNullableString(row.buyerId);
  const sellerId = asNullableString(row.sellerId);
  const rating = asRating(row.rating);
  const statusRaw = row.status;
  if (
    !$id ||
    !requestId ||
    !buyerId ||
    !sellerId ||
    !rating ||
    !isReviewStatus(statusRaw)
  ) {
    return null;
  }

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
    requestId,
    buyerId,
    sellerId,
    rating,
    comment,
    status: statusRaw,
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
  if (error instanceof DbException) {
    if (error.code === 409) return true;
    const msg = String(error.message || "").toLowerCase();
    return msg.includes("unique") || msg.includes("already exists");
  }
  return false;
}

async function assertReviewMutationRateLimit(userId: string): Promise<void> {
  const ip = await getClientIp();
  const result = await assertRateLimit({
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
    return { error: "Sign in to leave a review.", errorCode: code };
  }
  if (code === REVIEW_ERROR_CODES.RATE_LIMITED) {
    return { error: RATE_LIMIT_MESSAGE, errorCode: code };
  }
  if (code === REVIEW_ERROR_CODES.NOT_ELIGIBLE) {
    return {
      error: "You can review this seller after a sold request.",
      errorCode: code,
    };
  }
  if (code === REVIEW_ERROR_CODES.ALREADY_REVIEWED) {
    return {
      error: "You already submitted a review for this request.",
      errorCode: code,
    };
  }
  return {
    error: "Could not submit your review.",
    errorCode: REVIEW_ERROR_CODES.NOT_ALLOWED,
  };
}

async function findReviewForRequest(requestId: string): Promise<Review | null> {
  if (!hasDatabaseConfig()) return null;
  try {
    const { tables } = await createAdminClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_REVIEWS,
      queries: [Query.equal("requestId", requestId), Query.limit(1)],
    });
    const row = result.rows[0];
    if (!row) return null;
    return asReview(row as unknown as Record<string, unknown>);
  } catch (error) {
    logError("reviews.findForRequest", error, { requestId });
    return null;
  }
}

const APPROVED_REVIEW_PAGE = 100;
const APPROVED_REVIEW_MAX = 500;

/** Public list of approved seller reviews (newest first). */
export async function listApprovedSellerReviews(
  sellerId: string,
  opts?: { limit?: number; cursor?: string },
): Promise<Review[]> {
  if (!hasDatabaseConfig()) return [];

  const trimmed = sellerId?.trim();
  if (!trimmed) return [];

  const limit = Math.min(Math.max(opts?.limit ?? 50, 1), 100);

  try {
    const { tables } = await createPublicClient();
    const queries = [
      Query.equal("sellerId", trimmed),
      Query.equal("status", "approved"),
      Query.orderDesc("$createdAt"),
      Query.limit(limit),
    ];
    if (opts?.cursor?.trim()) {
      queries.push(Query.cursorAfter(opts.cursor.trim()));
    }
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_REVIEWS,
      queries,
    });

    const out: Review[] = [];
    for (const row of result.rows) {
      const review = asReview(row as unknown as Record<string, unknown>);
      if (review && review.sellerId === trimmed && review.status === "approved") {
        out.push(review);
      }
    }
    return out;
  } catch (error) {
    logError("reviews.listApprovedSeller", error, { sellerId: trimmed });
    return [];
  }
}

/** All approved reviews for a seller (paginated cap for metrics). */
export async function listAllApprovedSellerReviews(
  sellerId: string,
): Promise<Review[]> {
  const trimmed = sellerId?.trim();
  if (!trimmed || !hasDatabaseConfig()) return [];

  const out: Review[] = [];
  let cursor: string | undefined;

  while (out.length < APPROVED_REVIEW_MAX) {
    const batch = await listApprovedSellerReviews(trimmed, {
      limit: APPROVED_REVIEW_PAGE,
      cursor,
    });
    if (batch.length === 0) break;
    out.push(...batch);
    if (batch.length < APPROVED_REVIEW_PAGE) break;
    cursor = batch[batch.length - 1]?.$id;
    if (!cursor) break;
  }

  return out;
}

export type SellerReviewDistributionRow = {
  stars: 1 | 2 | 3 | 4 | 5;
  count: number;
  percent: number;
};

export type SellerReviewMetrics = {
  average: number | null;
  count: number;
  distribution: SellerReviewDistributionRow[];
};

export function computeSellerReviewMetrics(reviews: Review[]): SellerReviewMetrics {
  const approved = reviews.filter((r) => r.status === "approved");
  const count = approved.length;
  if (count === 0) {
    return {
      average: null,
      count: 0,
      distribution: [1, 2, 3, 4, 5].map((stars) => ({
        stars: stars as 1 | 2 | 3 | 4 | 5,
        count: 0,
        percent: 0,
      })),
    };
  }

  const buckets = new Map<number, number>();
  for (const stars of [1, 2, 3, 4, 5]) buckets.set(stars, 0);
  let sum = 0;
  for (const review of approved) {
    sum += review.rating;
    buckets.set(review.rating, (buckets.get(review.rating) ?? 0) + 1);
  }

  const distribution: SellerReviewDistributionRow[] = [1, 2, 3, 4, 5].map(
    (stars) => {
      const starCount = buckets.get(stars) ?? 0;
      return {
        stars: stars as 1 | 2 | 3 | 4 | 5,
        count: starCount,
        percent: Math.round((starCount / count) * 1000) / 10,
      };
    },
  );

  return {
    average: Math.round((sum / count) * 10) / 10,
    count,
    distribution,
  };
}

export async function getSellerReviewMetrics(
  sellerId: string,
): Promise<SellerReviewMetrics> {
  const reviews = await listAllApprovedSellerReviews(sellerId);
  return computeSellerReviewMetrics(reviews);
}

export async function getSellerRatingSummary(sellerId: string): Promise<{
  average: number | null;
  count: number;
}> {
  const metrics = await getSellerReviewMetrics(sellerId);
  return { average: metrics.average, count: metrics.count };
}

export type OwnSellerReviewInsights = {
  metrics: SellerReviewMetrics;
  reviews: Review[];
};

/** Approved reviews + metrics for the signed-in seller (session). */
export async function getOwnSellerReviewInsights(): Promise<OwnSellerReviewInsights> {
  const empty: OwnSellerReviewInsights = {
    metrics: computeSellerReviewMetrics([]),
    reviews: [],
  };

  if (!hasDatabaseConfig()) return empty;

  const user = await getLoggedInUser();
  if (!user || !userHasLabel(user, ROLE_LABELS.seller)) return empty;

  const reviews = await listAllApprovedSellerReviews(user.$id);
  return {
    metrics: computeSellerReviewMetrics(reviews),
    reviews,
  };
}

export async function getOwnReviewForRequest(
  requestId: string,
): Promise<Review | null> {
  const user = await getLoggedInUser();
  if (!user) return null;
  const review = await findReviewForRequest(requestId.trim());
  if (!review || review.buyerId !== user.$id) return null;
  return review;
}

/** UI gating: create re-validates eligibility server-side. */
export async function canReviewSellerRequest(
  requestId: string,
): Promise<ReviewEligibility> {
  if (!hasDatabaseConfig()) return { eligible: false };

  const user = await getLoggedInUser();
  if (!user) return { eligible: false };

  const trimmed = requestId?.trim();
  if (!trimmed) return { eligible: false };

  const detail = await getOwnPurchaseRequestDetail(trimmed);
  if (!detail || detail.request.buyerId !== user.$id) {
    return { eligible: false };
  }
  if (detail.request.status !== "sold") {
    return { eligible: false };
  }

  const existing = await findReviewForRequest(trimmed);
  if (existing) {
    return {
      eligible: false,
      requestId: trimmed,
      existingStatus: existing.status,
    };
  }

  return { eligible: true, requestId: trimmed };
}

/** Create a pending seller review after a sold own request. */
export async function createSellerReview(
  input: CreateSellerReviewInput,
): Promise<ReviewActionState> {
  if (!hasDatabaseConfig()) return notConfiguredState();

  try {
    const user = await requireUser();
    await assertReviewMutationRateLimit(user.$id);

    const requestId = input.requestId?.trim() ?? "";
    if (!requestId) {
      return {
        error: "Request id is required.",
        errorCode: REVIEW_ERROR_CODES.INVALID_INPUT,
      };
    }

    const rating = asRating(input.rating);
    if (!rating) {
      return {
        error: "Rating must be between 1 and 5.",
        errorCode: REVIEW_ERROR_CODES.INVALID_INPUT,
      };
    }

    const comment =
      input.comment == null
        ? null
        : String(input.comment).trim().slice(0, 2000) || null;

    const detail = await getOwnPurchaseRequestDetail(requestId);
    if (!detail || detail.request.buyerId !== user.$id) {
      const err = new Error("Not eligible to review.");
      (err as Error & { code: ReviewErrorCode }).code =
        REVIEW_ERROR_CODES.NOT_ELIGIBLE;
      throw err;
    }
    if (detail.request.status !== "sold") {
      const err = new Error("Not eligible to review.");
      (err as Error & { code: ReviewErrorCode }).code =
        REVIEW_ERROR_CODES.NOT_ELIGIBLE;
      throw err;
    }

    const existing = await findReviewForRequest(requestId);
    if (existing) {
      return {
        error: "You already submitted a review for this request.",
        errorCode: REVIEW_ERROR_CODES.ALREADY_REVIEWED,
      };
    }

    const { tables } = await createSessionClient();
    const row = await tables.createRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_REVIEWS,
      rowId: ID.unique(),
      data: {
        requestId,
        buyerId: user.$id,
        sellerId: detail.request.sellerId,
        rating,
        comment,
        status: "pending",
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

    await Promise.all([
      notifyUserEvent(user.$id, {
        type: "review.submitted",
        title: "Review submitted",
        body: "Thanks. Your seller review was submitted and is waiting for admin approval.",
        link: `/requests/${requestId}`,
      }),
      notifyAdminsEvent({
        type: "review.submitted.admin",
        title: "New seller review to moderate",
        body: `A buyer submitted a ${rating}-star seller review.`,
        link: "/admin/reviews",
        detailLines: [
          `Review: ${created.$id}`,
          `Request: ${requestId}`,
          `Seller: ${detail.request.sellerId}`,
        ],
      }),
    ]);

    return {
      success: "Thanks. Your review was submitted and is waiting for admin approval.",
    };
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return {
        error: "You already submitted a review for this request.",
        errorCode: REVIEW_ERROR_CODES.ALREADY_REVIEWED,
      };
    }
    return mapReviewError(err);
  }
}

export async function listReviewsForAdmin(opts?: {
  status?: ReviewStatus;
  cursor?: string;
  limit?: number;
}): Promise<AdminReviewView[]> {
  await requireLabel("admin");
  if (!hasDatabaseConfig()) return [];

  const limit = Math.min(Math.max(opts?.limit ?? 50, 1), 100);
  const queries = [Query.orderDesc("$createdAt"), Query.limit(limit)];
  if (opts?.status) {
    queries.unshift(Query.equal("status", opts.status));
  } else {
    queries.unshift(Query.equal("status", "pending"));
  }
  if (opts?.cursor?.trim()) {
    queries.push(Query.cursorAfter(opts.cursor.trim()));
  }

  try {
    const { tables } = await createAdminClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_REVIEWS,
      queries,
    });
    const out: AdminReviewView[] = [];
    for (const row of result.rows) {
      const review = asReview(row as unknown as Record<string, unknown>);
      if (!review) continue;
      out.push({
        $id: review.$id,
        requestId: review.requestId,
        buyerId: review.buyerId,
        sellerId: review.sellerId,
        rating: review.rating,
        comment: review.comment,
        status: review.status,
        $createdAt: review.$createdAt ?? null,
      });
    }
    return out;
  } catch (error) {
    logError("reviews.listAdmin", error);
    return [];
  }
}

async function moderateReview(
  reviewId: string,
  nextStatus: "approved" | "rejected",
): Promise<ReviewModerationResult> {
  if (!hasDatabaseConfig()) {
    return { ok: false, error: "Reviews are not available right now." };
  }

  const admin = await requireLabel("admin");
  const trimmed = reviewId?.trim() ?? "";
  if (!trimmed) {
    return { ok: false, error: "Review not found." };
  }

  try {
    const { tables } = await createAdminClient();
    const row = await tables.getRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_REVIEWS,
      rowId: trimmed,
    });
    const review = asReview(row as unknown as Record<string, unknown>);
    if (!review) {
      return { ok: false, error: "Review not found." };
    }
    if (review.status !== "pending") {
      return { ok: false, error: "This review was already resolved." };
    }

    const updated = await tables.updateRowIfColumnIn({
      databaseId: DATABASE_ID,
      tableId: TABLE_REVIEWS,
      rowId: review.$id,
      column: "status",
      values: ["pending"],
      data: { status: nextStatus },
    });

    if (!updated) {
      return { ok: false, error: "This review was already resolved." };
    }

    await writeAuditLog({
      actorId: admin.$id,
      event: nextStatus === "approved" ? "review.approved" : "review.rejected",
      resourceType: "review",
      resourceId: review.$id,
      meta: {
        requestId: review.requestId,
        sellerId: review.sellerId,
        buyerId: review.buyerId,
      },
    });

    if (nextStatus === "approved") {
      await Promise.all([
        notifyUserEvent(review.buyerId, {
          type: "review.approved",
          title: "Review approved",
          body: "Your seller review is now visible on their shop.",
          link: `/requests/${review.requestId}`,
        }),
        notifyUserEvent(review.sellerId, {
          type: "review.approved.seller",
          title: "New review on your shop",
          body: `A buyer left a ${review.rating}-star review. It is now visible on your shop.`,
          link: "/seller/reviews",
        }),
      ]);
    } else {
      await notifyUserEvent(review.buyerId, {
        type: "review.rejected",
        title: "Review not approved",
        body: "An admin did not approve your seller review.",
        link: `/requests/${review.requestId}`,
      });
    }

    return {
      ok: true,
      message:
        nextStatus === "approved"
          ? "Review approved."
          : "Review rejected.",
    };
  } catch (error) {
    logError("reviews.moderate", error, { reviewId: trimmed, nextStatus });
    return { ok: false, error: "Could not update the review." };
  }
}

export async function approveReview(
  reviewId: string,
): Promise<ReviewModerationResult> {
  return moderateReview(reviewId, "approved");
}

export async function rejectReview(
  reviewId: string,
): Promise<ReviewModerationResult> {
  return moderateReview(reviewId, "rejected");
}

/** @deprecated Use canReviewSellerRequest */
export async function canReviewProduct(
  _productId: string,
): Promise<ReviewEligibility> {
  return { eligible: false };
}

/** @deprecated Use listApprovedSellerReviews */
export async function listProductReviews(
  _productId: string,
): Promise<Review[]> {
  return [];
}

/** @deprecated Use createSellerReview */
export async function createProductReview(): Promise<ReviewActionState> {
  return {
    error: "Product reviews are no longer supported. Review the seller from a sold request.",
    errorCode: REVIEW_ERROR_CODES.NOT_ALLOWED,
  };
}
