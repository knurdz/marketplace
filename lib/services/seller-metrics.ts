import { Query } from "node-appwrite";
import {
  DATABASE_ID,
  TABLE_ORDERS,
  hasAppwritePublicConfig,
} from "@/lib/appwrite/config";
import { createSessionClient } from "@/lib/appwrite/server";
import { getLoggedInUser } from "@/lib/appwrite/session";
import type { Order, OrderStatus } from "@/lib/types";
import { getSellerEarnings } from "./seller-earnings";

const DEFAULT_CURRENCY = "LKR";

/** Order statuses that count toward seller revenue (paid or later fulfillment). */
export const SELLER_REVENUE_STATUSES: readonly OrderStatus[] = [
  "paid",
  "processing",
  "shipped",
  "ready_pickup",
  "completed",
];

/** Order statuses awaiting seller action (fulfillment or slip review). */
export const SELLER_PENDING_STATUSES: readonly OrderStatus[] = [
  "payment_review",
  "paid",
  "processing",
  "shipped",
  "ready_pickup",
];

export type SellerMetrics = {
  orderCount: number;
  pendingCount: number;
  revenue: number;
  currency: string;
};

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function safeCount(value: unknown): number {
  const n = asNumber(value, 0);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

function emptyMetrics(): SellerMetrics {
  return {
    orderCount: 0,
    pendingCount: 0,
    revenue: 0,
    currency: DEFAULT_CURRENCY,
  };
}

function isRevenueStatus(status: OrderStatus): boolean {
  return (SELLER_REVENUE_STATUSES as readonly string[]).includes(status);
}

/**
 * Pure order-status revenue helper (verify script). Dashboard KPIs use paid payments.
 */
export function aggregateSellerRevenue(orders: Order[]): {
  revenue: number;
  currency: string;
} {
  let revenue = 0;
  let currency = DEFAULT_CURRENCY;

  for (const order of orders) {
    if (!isRevenueStatus(order.status)) continue;
    revenue += order.totalAmount;
    if (currency === DEFAULT_CURRENCY && order.currency) {
      currency = order.currency;
    }
  }

  return {
    revenue: Number.isFinite(revenue) ? revenue : 0,
    currency,
  };
}

async function countSellerOrders(
  sellerId: string,
  statusFilter?: readonly OrderStatus[],
): Promise<number> {
  const { tables } = await createSessionClient();
  const queries = [Query.equal("sellerId", sellerId)];
  if (statusFilter && statusFilter.length > 0) {
    queries.push(Query.equal("status", [...statusFilter]));
  }
  queries.push(Query.limit(1));

  const result = await tables.listRows({
    databaseId: DATABASE_ID,
    tableId: TABLE_ORDERS,
    queries,
    total: true,
  });
  return safeCount(result.total);
}

/**
 * Read-only seller dashboard KPIs (session client; own sellerId only).
 * Revenue matches earnings: sum of payments with status paid.
 * Returns zeros on empty data or Appwrite errors — never throws to callers.
 */
export async function getSellerMetrics(): Promise<SellerMetrics> {
  if (!hasAppwritePublicConfig()) return emptyMetrics();

  const user = await getLoggedInUser();
  if (!user) return emptyMetrics();

  const sellerId = user.$id;

  try {
    const [orderCount, pendingCount, earnings] = await Promise.all([
      countSellerOrders(sellerId),
      countSellerOrders(sellerId, SELLER_PENDING_STATUSES),
      getSellerEarnings(),
    ]);

    return {
      orderCount,
      pendingCount,
      revenue: earnings.total,
      currency: earnings.currency,
    };
  } catch {
    return emptyMetrics();
  }
}
