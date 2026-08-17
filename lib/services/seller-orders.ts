import { Query } from "node-appwrite";
import {
  DATABASE_ID,
  TABLE_ORDER_ITEMS,
  TABLE_ORDERS,
  TABLE_PAYMENTS,
  hasAppwritePublicConfig,
} from "@/lib/appwrite/config";
import { ROLE_LABELS, userHasLabel } from "@/lib/appwrite/roles";
import { createAdminClient, createSessionClient } from "@/lib/appwrite/server";
import { getLoggedInUser } from "@/lib/appwrite/session";
import {
  assertRateLimit,
  getClientIp,
  RATE_LIMIT_MESSAGE,
  RATE_LIMITS,
} from "@/lib/security/rate-limit";
import type { Order, OrderItem, OrderStatus, Payment } from "@/lib/types";
import {
  canSellerFulfillmentTransition,
  isOrderStatus,
} from "@/lib/types";
import {
  asOrder,
  asOrderItem,
  asPayment,
} from "./orders";

export type FulfillSellerOrderResult =
  | { ok: true; orderStatus: OrderStatus }
  | { ok: false; error: string };

/** IDOR predicate: order belongs to the given seller. */
export function ownedBySeller(order: Order, sellerId: string): boolean {
  return order.sellerId === sellerId;
}

/** Load an order for the signed-in seller (IDOR-safe). */
export async function getSellerOrder(orderId: string): Promise<Order | null> {
  if (!hasAppwritePublicConfig()) return null;

  const user = await getLoggedInUser();
  if (!user || !userHasLabel(user, ROLE_LABELS.seller)) return null;

  const trimmed = orderId?.trim();
  if (!trimmed) return null;

  try {
    const { tables } = await createSessionClient();
    const row = await tables.getRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_ORDERS,
      rowId: trimmed,
    });
    const order = asOrder(row as unknown as Record<string, unknown>);
    if (!order || !ownedBySeller(order, user.$id)) return null;
    return order;
  } catch {
    return null;
  }
}

const INBOX_PAGE_SIZE = 50;

/** Newest-first list for the signed-in seller only. */
export async function listSellerOrders(opts?: {
  limit?: number;
  status?: readonly OrderStatus[];
  cursor?: string;
}): Promise<Order[]> {
  if (!hasAppwritePublicConfig()) return [];

  const user = await getLoggedInUser();
  if (!user || !userHasLabel(user, ROLE_LABELS.seller)) return [];

  const limit = Math.min(Math.max(opts?.limit ?? INBOX_PAGE_SIZE, 1), INBOX_PAGE_SIZE);
  const statusFilter = opts?.status;
  const cursor = opts?.cursor?.trim() || undefined;

  try {
    const { tables } = await createSessionClient();
    const queries = [
      Query.equal("sellerId", user.$id),
      Query.orderDesc("$createdAt"),
      Query.limit(limit),
    ];
    if (statusFilter && statusFilter.length > 0) {
      queries.splice(1, 0, Query.equal("status", [...statusFilter]));
    }
    if (cursor) {
      queries.push(Query.cursorAfter(cursor));
    }

    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_ORDERS,
      queries,
    });

    const out: Order[] = [];
    for (const row of result.rows) {
      const order = asOrder(row as unknown as Record<string, unknown>);
      if (order && ownedBySeller(order, user.$id)) {
        out.push(order);
      }
    }
    return out;
  } catch {
    return [];
  }
}

/** Line items for an order owned by the signed-in seller (IDOR-safe). */
export async function getSellerOrderItems(orderId: string): Promise<OrderItem[]> {
  const order = await getSellerOrder(orderId);
  if (!order) return [];

  try {
    const { tables } = await createSessionClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_ORDER_ITEMS,
      queries: [Query.equal("orderId", order.$id), Query.limit(100)],
    });

    const out: OrderItem[] = [];
    for (const row of result.rows) {
      const item = asOrderItem(row as unknown as Record<string, unknown>);
      if (item && item.orderId === order.$id) {
        out.push(item);
      }
    }
    return out;
  } catch {
    return [];
  }
}

/** Payment row for an order owned by the signed-in seller (IDOR-safe). */
export async function getSellerPaymentForOrder(
  orderId: string,
): Promise<Payment | null> {
  if (!hasAppwritePublicConfig()) return null;

  const order = await getSellerOrder(orderId);
  if (!order) return null;

  const trimmed = orderId.trim();
  if (!trimmed) return null;

  try {
    const { tables } = await createSessionClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_PAYMENTS,
      queries: [Query.equal("orderId", trimmed), Query.limit(1)],
    });

    const row = result.rows[0];
    if (!row) return null;

    const payment = asPayment(row as unknown as Record<string, unknown>);
    if (!payment || payment.orderId !== order.$id) return null;
    return payment;
  } catch {
    return null;
  }
}

/** Advance order status on the seller fulfillment track (IDOR + FSM + admin write). */
export async function fulfillSellerOrder(
  orderId: string,
  nextStatus: OrderStatus,
): Promise<FulfillSellerOrderResult> {
  if (!hasAppwritePublicConfig()) {
    return { ok: false, error: "Orders are not configured yet." };
  }

  const user = await getLoggedInUser();
  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }

  if (!userHasLabel(user, ROLE_LABELS.seller)) {
    return { ok: false, error: "Seller access is required." };
  }

  const trimmed = orderId?.trim();
  if (!trimmed) {
    return { ok: false, error: "Order not found." };
  }

  if (!isOrderStatus(nextStatus)) {
    return { ok: false, error: "Invalid order status." };
  }

  const order = await getSellerOrder(trimmed);
  if (!order) {
    return { ok: false, error: "Order not found." };
  }

  if (!canSellerFulfillmentTransition(order.status, nextStatus)) {
    return { ok: false, error: "This status change is not allowed." };
  }

  if (order.status === nextStatus) {
    return { ok: true, orderStatus: nextStatus };
  }

  const payment = await getSellerPaymentForOrder(order.$id);
  if (!payment || payment.status !== "paid") {
    return { ok: false, error: "Order is not paid yet." };
  }

  const ip = await getClientIp();
  const rate = assertRateLimit({
    bucket: "fulfillment",
    key: `${user.$id}:${ip}`,
    ...RATE_LIMITS.fulfillment,
  });
  if (!rate.ok) {
    return { ok: false, error: RATE_LIMIT_MESSAGE };
  }

  const expectedFrom = order.status;

  try {
    const { tables } = await createAdminClient();
    const freshRow = await tables.getRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_ORDERS,
      rowId: order.$id,
    });
    const fresh = asOrder(freshRow as unknown as Record<string, unknown>);
    if (!fresh || fresh.status !== expectedFrom) {
      return {
        ok: false,
        error: "This order was updated. Refresh and try again.",
      };
    }

    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_ORDERS,
      rowId: order.$id,
      data: { status: nextStatus },
    });
  } catch {
    return {
      ok: false,
      error: "Could not update order status. Please try again.",
    };
  }

  return { ok: true, orderStatus: nextStatus };
}
