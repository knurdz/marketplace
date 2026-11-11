import { ID, Permission, Query, Role } from "@/lib/db/appwrite-shim";
import { createNotificationForUser } from "@/lib/appwrite/notifications";
import { getOwnProfile } from "@/lib/appwrite/profiles";
import {
  DATABASE_ID,
  TABLE_PRODUCTS,
  TABLE_PROFILES,
  TABLE_PURCHASE_REQUESTS,
  hasAppwritePublicConfig,
} from "@/lib/appwrite/config";
import { mayBrowsePublicCatalog } from "@/lib/appwrite/roles";
import { createAdminClient, createSessionClient } from "@/lib/appwrite/server";
import { getActiveUserById, getLoggedInUser } from "@/lib/appwrite/session";
import { getDb } from "@/lib/db/client";
import { purchaseRequests } from "@/lib/db/schema";
import { logError } from "@/lib/observability/log-error";
import {
  assertRateLimit,
  getClientIp,
  RATE_LIMIT_MESSAGE,
  RATE_LIMITS,
} from "@/lib/security/rate-limit";
import type {
  PurchaseRequest,
  PurchaseRequestContact,
  PurchaseRequestDetail,
  PurchaseRequestStatus,
} from "@/lib/types";
import {
  canSellerResolvePurchaseRequest,
  isPurchaseRequestStatus,
  OPEN_PURCHASE_REQUEST_STATUS,
} from "@/lib/types";
import { and, count, eq } from "drizzle-orm";
import { getProduct, isProductPurchasable } from "./products";
import {
  PURCHASE_REQUEST_ERROR_CODES,
  type CreatePurchaseRequestResult,
  type PurchaseRequestErrorCode,
  type ResolvePurchaseRequestResult,
} from "./purchase-request-errors";

export {
  PURCHASE_REQUEST_ERROR_CODES,
  type CreatePurchaseRequestResult,
  type PurchaseRequestActionState,
  type PurchaseRequestErrorCode,
  type ResolvePurchaseRequestResult,
} from "./purchase-request-errors";

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

export function asPurchaseRequest(
  row: Record<string, unknown>,
): PurchaseRequest | null {
  const $id = asNullableString(row.$id);
  const buyerId = asNullableString(row.buyerId);
  const sellerId = asNullableString(row.sellerId);
  const productId = asNullableString(row.productId);
  const title = asNullableString(row.title);
  const currency = asNullableString(row.currency);
  const statusRaw = row.status;

  if (
    !$id ||
    !buyerId ||
    !sellerId ||
    !productId ||
    !title ||
    !currency ||
    !isPurchaseRequestStatus(statusRaw)
  ) {
    return null;
  }

  const quantity = Math.max(0, Math.floor(asNumber(row.quantity)));
  if (quantity < 1) return null;

  return {
    $id,
    buyerId,
    sellerId,
    productId,
    title,
    quantity,
    unitPrice: asNumber(row.unitPrice),
    currency,
    status: statusRaw,
    ...(asNullableString(row.$createdAt)
      ? { $createdAt: asNullableString(row.$createdAt)! }
      : {}),
    ...(asNullableString(row.$updatedAt)
      ? { $updatedAt: asNullableString(row.$updatedAt)! }
      : {}),
  };
}

async function notifyUserSafe(params: {
  userId: string;
  type: string;
  title: string;
  body: string;
  link?: string | null;
}): Promise<void> {
  try {
    await createNotificationForUser(params);
  } catch (error) {
    logError("purchaseRequest.notify", error, {
      type: params.type,
      userId: params.userId,
    });
  }
}

async function loadProfileContact(
  userId: string,
): Promise<PurchaseRequestContact> {
  const user = await getActiveUserById(userId);
  let phone: string | null = null;
  let displayName: string | null = null;

  try {
    const { tables } = await createAdminClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_PROFILES,
      queries: [Query.equal("userId", userId), Query.limit(1)],
    });
    const row = result.rows[0] as Record<string, unknown> | undefined;
    if (row) {
      phone = asNullableString(row.phone);
      displayName = asNullableString(row.displayName);
    }
  } catch (error) {
    logError("purchaseRequest.profileContact", error, { userId });
  }

  return {
    phone,
    email: user?.email ?? null,
    displayName: displayName ?? user?.name ?? null,
  };
}

/** Seller phone for Buy gating (product page). Does not expose email publicly. */
export async function getSellerPhoneForBuy(
  sellerId: string,
): Promise<string | null> {
  if (!hasAppwritePublicConfig() || !sellerId.trim()) return null;
  const contact = await loadProfileContact(sellerId.trim());
  return contact.phone;
}

function requestRowPermissions(buyerId: string, sellerId: string): string[] {
  return [
    Permission.read(Role.user(buyerId)),
    Permission.read(Role.user(sellerId)),
    Permission.read(Role.label("admin")),
    Permission.update(Role.user(sellerId)),
    Permission.update(Role.label("admin")),
  ];
}

async function assertRequestRateLimit(userId: string): Promise<void> {
  const ip = await getClientIp();
  const result = assertRateLimit({
    bucket: "purchaseRequests",
    key: `${userId}:${ip}`,
    ...RATE_LIMITS.purchaseRequests,
  });
  if (!result.ok) {
    const err = new Error(RATE_LIMIT_MESSAGE);
    (err as Error & { code: PurchaseRequestErrorCode }).code =
      PURCHASE_REQUEST_ERROR_CODES.RATE_LIMITED;
    throw err;
  }
}

export async function createPurchaseRequest(input: {
  productId: string;
  quantity: number;
}): Promise<CreatePurchaseRequestResult> {
  if (!hasAppwritePublicConfig()) {
    return {
      ok: false,
      error: "Buy requests are not available right now.",
      errorCode: PURCHASE_REQUEST_ERROR_CODES.NOT_CONFIGURED,
    };
  }

  const user = await getLoggedInUser();
  if (!user) {
    return {
      ok: false,
      error: "Sign in to send a buy request.",
      errorCode: PURCHASE_REQUEST_ERROR_CODES.NOT_AUTHENTICATED,
    };
  }

  if (mayBrowsePublicCatalog(user)) {
    return {
      ok: false,
      error: "Admin and seller accounts cannot send buy requests.",
      errorCode: PURCHASE_REQUEST_ERROR_CODES.NOT_ALLOWED,
    };
  }

  try {
    await assertRequestRateLimit(user.$id);
  } catch (error) {
    const code = (error as Error & { code?: PurchaseRequestErrorCode }).code;
    if (code === PURCHASE_REQUEST_ERROR_CODES.RATE_LIMITED) {
      return {
        ok: false,
        error: RATE_LIMIT_MESSAGE,
        errorCode: code,
      };
    }
    throw error;
  }

  const productId = input.productId?.trim() ?? "";
  const quantity = Math.floor(Number(input.quantity));
  if (!productId || !Number.isInteger(quantity) || quantity < 1) {
    return {
      ok: false,
      error: "Enter a valid quantity.",
      errorCode: PURCHASE_REQUEST_ERROR_CODES.INVALID_INPUT,
    };
  }

  const product = await getProduct(productId);
  if (!product || !isProductPurchasable(product)) {
    return {
      ok: false,
      error: "This product is not available.",
      errorCode: PURCHASE_REQUEST_ERROR_CODES.PRODUCT_UNAVAILABLE,
    };
  }

  if (product.sellerId === user.$id) {
    return {
      ok: false,
      error: "You cannot request your own listing.",
      errorCode: PURCHASE_REQUEST_ERROR_CODES.OWN_PRODUCT,
    };
  }

  if (quantity > product.stock) {
    return {
      ok: false,
      error: `Only ${product.stock} in stock.`,
      errorCode: PURCHASE_REQUEST_ERROR_CODES.INSUFFICIENT_STOCK,
    };
  }

  const buyerProfile = await getOwnProfile();
  if (!buyerProfile?.phone) {
    return {
      ok: false,
      error: "Add a phone number in your account before sending a request.",
      errorCode: PURCHASE_REQUEST_ERROR_CODES.BUYER_PHONE_REQUIRED,
    };
  }

  const sellerContact = await loadProfileContact(product.sellerId);
  if (!sellerContact.phone) {
    return {
      ok: false,
      error: "This seller has not added a phone number yet.",
      errorCode: PURCHASE_REQUEST_ERROR_CODES.SELLER_PHONE_REQUIRED,
    };
  }

  try {
    const { tables } = await createAdminClient();
    const row = await tables.createRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PURCHASE_REQUESTS,
      rowId: ID.unique(),
      data: {
        buyerId: user.$id,
        sellerId: product.sellerId,
        productId: product.$id,
        title: product.title.slice(0, 200),
        quantity,
        unitPrice: product.price,
        currency: product.currency,
        status: OPEN_PURCHASE_REQUEST_STATUS,
      },
      permissions: requestRowPermissions(user.$id, product.sellerId),
    });

    const request = asPurchaseRequest(row as unknown as Record<string, unknown>);
    if (!request) {
      return {
        ok: false,
        error: "Could not create the request.",
        errorCode: PURCHASE_REQUEST_ERROR_CODES.NOT_ALLOWED,
      };
    }

    await notifyUserSafe({
      userId: product.sellerId,
      type: "request.created",
      title: "New buy request",
      body: `A buyer requested ${quantity}× ${product.title}. Contact them to arrange the sale.`,
      link: `/seller/requests/${request.$id}`,
    });

    return { ok: true, requestId: request.$id };
  } catch (error) {
    logError("purchaseRequest.create", error, { productId });
    return {
      ok: false,
      error: "Could not create the request.",
      errorCode: PURCHASE_REQUEST_ERROR_CODES.NOT_ALLOWED,
    };
  }
}

async function listRequestsFor(
  field: "buyerId" | "sellerId",
  userId: string,
  opts?: { status?: PurchaseRequestStatus | PurchaseRequestStatus[]; cursor?: string; limit?: number },
): Promise<PurchaseRequest[]> {
  if (!hasAppwritePublicConfig()) return [];

  const limit = Math.min(Math.max(opts?.limit ?? 50, 1), 100);
  const queries = [
    Query.equal(field, userId),
    Query.orderDesc("$createdAt"),
    Query.limit(limit),
  ];

  if (opts?.status) {
    const statuses = Array.isArray(opts.status) ? opts.status : [opts.status];
    queries.push(Query.equal("status", statuses));
  }
  if (opts?.cursor?.trim()) {
    queries.push(Query.cursorAfter(opts.cursor.trim()));
  }

  try {
    const { tables } = await createSessionClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_PURCHASE_REQUESTS,
      queries,
    });
    const out: PurchaseRequest[] = [];
    for (const row of result.rows) {
      const request = asPurchaseRequest(row as unknown as Record<string, unknown>);
      if (request && request[field] === userId) out.push(request);
    }
    return out;
  } catch (error) {
    logError("purchaseRequest.list", error, { field, userId });
    return [];
  }
}

export async function listOwnPurchaseRequests(opts?: {
  status?: PurchaseRequestStatus | PurchaseRequestStatus[];
  cursor?: string;
  limit?: number;
}): Promise<PurchaseRequest[]> {
  const user = await getLoggedInUser();
  if (!user) return [];
  return listRequestsFor("buyerId", user.$id, opts);
}

export async function listSellerPurchaseRequests(opts?: {
  status?: PurchaseRequestStatus | PurchaseRequestStatus[];
  cursor?: string;
  limit?: number;
}): Promise<PurchaseRequest[]> {
  const user = await getLoggedInUser();
  if (!user) return [];
  return listRequestsFor("sellerId", user.$id, opts);
}

export async function listAllPurchaseRequests(opts?: {
  status?: PurchaseRequestStatus | PurchaseRequestStatus[];
  cursor?: string;
  limit?: number;
}): Promise<PurchaseRequest[]> {
  if (!hasAppwritePublicConfig()) return [];

  const limit = Math.min(Math.max(opts?.limit ?? 50, 1), 100);
  const queries = [
    Query.orderDesc("$createdAt"),
    Query.limit(limit),
  ];
  if (opts?.status) {
    const statuses = Array.isArray(opts.status) ? opts.status : [opts.status];
    queries.push(Query.equal("status", statuses));
  }
  if (opts?.cursor?.trim()) {
    queries.push(Query.cursorAfter(opts.cursor.trim()));
  }

  try {
    const { tables } = await createAdminClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_PURCHASE_REQUESTS,
      queries,
    });
    const out: PurchaseRequest[] = [];
    for (const row of result.rows) {
      const request = asPurchaseRequest(row as unknown as Record<string, unknown>);
      if (request) out.push(request);
    }
    return out;
  } catch (error) {
    logError("purchaseRequest.listAll", error);
    return [];
  }
}

async function getRequestRow(
  requestId: string,
): Promise<PurchaseRequest | null> {
  if (!hasAppwritePublicConfig() || !requestId.trim()) return null;
  try {
    const { tables } = await createSessionClient();
    const row = await tables.getRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PURCHASE_REQUESTS,
      rowId: requestId.trim(),
    });
    return asPurchaseRequest(row as unknown as Record<string, unknown>);
  } catch {
    try {
      const { tables } = await createAdminClient();
      const row = await tables.getRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_PURCHASE_REQUESTS,
        rowId: requestId.trim(),
      });
      return asPurchaseRequest(row as unknown as Record<string, unknown>);
    } catch (error) {
      logError("purchaseRequest.get", error, { requestId });
      return null;
    }
  }
}

/** Buyer or seller (or admin via detail pages) loads request + counterparty contact. */
/** Buyer-owned purchase request row (session). */
export async function getPurchaseRequestForBuyer(
  requestId: string,
): Promise<PurchaseRequest | null> {
  const user = await getLoggedInUser();
  if (!user) return null;
  const request = await getRequestRow(requestId);
  if (!request || request.buyerId !== user.$id) return null;
  return request;
}

/** Seller-owned purchase request row (session). */
export async function getPurchaseRequestForSeller(
  requestId: string,
): Promise<PurchaseRequest | null> {
  const user = await getLoggedInUser();
  if (!user) return null;
  const request = await getRequestRow(requestId);
  if (!request || request.sellerId !== user.$id) return null;
  return request;
}

export async function getOwnPurchaseRequestDetail(
  requestId: string,
): Promise<PurchaseRequestDetail | null> {
  const user = await getLoggedInUser();
  if (!user) return null;

  const request = await getRequestRow(requestId);
  if (!request) return null;

  const isBuyer = request.buyerId === user.$id;
  const isSeller = request.sellerId === user.$id;
  if (!isBuyer && !isSeller) return null;

  const counterpartyId = isBuyer ? request.sellerId : request.buyerId;
  const contact = await loadProfileContact(counterpartyId);
  return { request, contact };
}

export async function getAdminPurchaseRequestDetail(
  requestId: string,
): Promise<PurchaseRequestDetail | null> {
  const request = await getRequestRow(requestId);
  if (!request) return null;
  const contact = await loadProfileContact(request.buyerId);
  return { request, contact };
}

export async function markPurchaseRequestSold(
  requestId: string,
): Promise<ResolvePurchaseRequestResult> {
  return resolvePurchaseRequest(requestId, "sold");
}

export async function markPurchaseRequestCancelled(
  requestId: string,
): Promise<ResolvePurchaseRequestResult> {
  return resolvePurchaseRequest(requestId, "cancelled");
}

async function resolvePurchaseRequest(
  requestId: string,
  nextStatus: "sold" | "cancelled",
): Promise<ResolvePurchaseRequestResult> {
  if (!hasAppwritePublicConfig()) {
    return {
      ok: false,
      error: "Requests are not available right now.",
      errorCode: PURCHASE_REQUEST_ERROR_CODES.NOT_CONFIGURED,
    };
  }

  const user = await getLoggedInUser();
  if (!user) {
    return {
      ok: false,
      error: "Sign in to update this request.",
      errorCode: PURCHASE_REQUEST_ERROR_CODES.NOT_AUTHENTICATED,
    };
  }

  try {
    await assertRequestRateLimit(user.$id);
  } catch {
    return {
      ok: false,
      error: RATE_LIMIT_MESSAGE,
      errorCode: PURCHASE_REQUEST_ERROR_CODES.RATE_LIMITED,
    };
  }

  const trimmed = requestId?.trim() ?? "";
  if (!trimmed) {
    return {
      ok: false,
      error: "Request not found.",
      errorCode: PURCHASE_REQUEST_ERROR_CODES.NOT_FOUND,
    };
  }

  const request = await getRequestRow(trimmed);
  if (!request || request.sellerId !== user.$id) {
    return {
      ok: false,
      error: "Request not found.",
      errorCode: PURCHASE_REQUEST_ERROR_CODES.NOT_FOUND,
    };
  }

  if (!canSellerResolvePurchaseRequest(request.status)) {
    return {
      ok: false,
      error: "This request was already resolved.",
      errorCode: PURCHASE_REQUEST_ERROR_CODES.ALREADY_RESOLVED,
    };
  }

  const { tables } = await createAdminClient();
  let transactionId: string | null = null;

  try {
    const tx = await tables.createTransaction({ ttl: 120 });
    transactionId = tx.$id;

    if (nextStatus === "sold") {
      try {
        await tables.decrementRowColumn({
          databaseId: DATABASE_ID,
          tableId: TABLE_PRODUCTS,
          rowId: request.productId,
          column: "stock",
          value: request.quantity,
          min: 0,
          transactionId,
        });
      } catch {
        await tables.deleteTransaction({ transactionId });
        transactionId = null;
        return {
          ok: false,
          error: "Not enough stock to mark this as sold.",
          errorCode: PURCHASE_REQUEST_ERROR_CODES.INSUFFICIENT_STOCK,
        };
      }
    }

    const updated = await tables.updateRowIfColumnIn({
      databaseId: DATABASE_ID,
      tableId: TABLE_PURCHASE_REQUESTS,
      rowId: request.$id,
      column: "status",
      values: [OPEN_PURCHASE_REQUEST_STATUS],
      data: { status: nextStatus },
      transactionId,
    });

    if (!updated) {
      await tables.deleteTransaction({ transactionId });
      transactionId = null;
      return {
        ok: false,
        error: "This request was already resolved.",
        errorCode: PURCHASE_REQUEST_ERROR_CODES.ALREADY_RESOLVED,
      };
    }

    await tables.updateTransaction({ transactionId, commit: true });
    transactionId = null;

    await notifyUserSafe({
      userId: request.buyerId,
      type: nextStatus === "sold" ? "request.sold" : "request.cancelled",
      title: nextStatus === "sold" ? "Request marked sold" : "Request cancelled",
      body:
        nextStatus === "sold"
          ? `The seller marked your request for ${request.title} as sold. You can rate this seller on the request page.`
          : `The seller cancelled your request for ${request.title}.`,
      link: `/requests/${request.$id}`,
    });

    return { ok: true, status: nextStatus };
  } catch (error) {
    if (transactionId) {
      try {
        await tables.deleteTransaction({ transactionId });
      } catch {
        /* ignore rollback errors */
      }
    }
    logError("purchaseRequest.resolve", error, {
      requestId: trimmed,
      nextStatus,
    });
    return {
      ok: false,
      error: "Could not update the request.",
      errorCode: PURCHASE_REQUEST_ERROR_CODES.NOT_ALLOWED,
    };
  }
}

export async function countPurchaseRequestsByStatus(opts?: {
  sellerId?: string;
}): Promise<Record<PurchaseRequestStatus, number>> {
  const empty: Record<PurchaseRequestStatus, number> = {
    requested: 0,
    sold: 0,
    cancelled: 0,
  };
  if (!hasAppwritePublicConfig()) return empty;

  try {
    const db = getDb();
    for (const status of Object.keys(empty) as PurchaseRequestStatus[]) {
      const where = opts?.sellerId
        ? and(
            eq(purchaseRequests.status, status),
            eq(purchaseRequests.sellerId, opts.sellerId),
          )
        : eq(purchaseRequests.status, status);
      const rows = await db
        .select({ value: count() })
        .from(purchaseRequests)
        .where(where);
      empty[status] = Number(rows[0]?.value ?? 0);
    }
    return empty;
  } catch (error) {
    logError("purchaseRequest.counts", error);
    return empty;
  }
}
