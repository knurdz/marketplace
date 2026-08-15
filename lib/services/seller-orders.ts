import { Query } from "node-appwrite";
import {
  DATABASE_ID,
  TABLE_ORDER_ITEMS,
  TABLE_ORDERS,
  TABLE_PAYMENTS,
  hasAppwritePublicConfig,
} from "@/lib/appwrite/config";
import { createSessionClient } from "@/lib/appwrite/server";
import { getLoggedInUser } from "@/lib/appwrite/session";
import type { Order, OrderItem, OrderStatus, Payment } from "@/lib/types";
import {
  asOrder,
  asOrderItem,
  asPayment,
} from "./orders";

/** IDOR predicate: order belongs to the given seller. */
export function ownedBySeller(order: Order, sellerId: string): boolean {
  return order.sellerId === sellerId;
}

/** Load an order for the signed-in seller (IDOR-safe). */
export async function getSellerOrder(orderId: string): Promise<Order | null> {
  if (!hasAppwritePublicConfig()) return null;

  const user = await getLoggedInUser();
  if (!user) return null;

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

/** Newest-first list for the signed-in seller only. */
export async function listSellerOrders(opts?: {
  limit?: number;
  status?: readonly OrderStatus[];
}): Promise<Order[]> {
  if (!hasAppwritePublicConfig()) return [];

  const user = await getLoggedInUser();
  if (!user) return [];

  const limit = Math.min(Math.max(opts?.limit ?? 50, 1), 50);
  const statusFilter = opts?.status;

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
