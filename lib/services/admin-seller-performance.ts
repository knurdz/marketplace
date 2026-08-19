import { Query } from "node-appwrite";
import {
  DATABASE_ID,
  TABLE_ORDERS,
  TABLE_PAYMENTS,
  TABLE_SELLER_PROFILES,
  hasAppwritePublicConfig,
} from "@/lib/appwrite/config";
import { requireLabel } from "@/lib/appwrite/roles";
import { createAdminClient } from "@/lib/appwrite/server";
import type { Order, Payment, SellerStatus } from "@/lib/types";
import { asOrder, asPayment } from "./orders";
import { aggregatePaidEarnings } from "./seller-earnings";
import { SELLER_PENDING_STATUSES } from "./seller-metrics";
import { ownedBySeller } from "./seller-orders";
import { asSellerProfile } from "./seller-approvals";

const APPROVED_SELLER_STATUS: SellerStatus = "approved";
const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;
const QUERY_CHUNK = 100;

export type SellerPerformanceInput = {
  sellerId: string;
  shopName: string;
  slug: string;
};

export type SellerPerformanceRow = {
  sellerId: string;
  shopName: string;
  slug: string;
  orderCount: number;
  pendingCount: number;
  revenue: number;
  currency: string;
};

export type ListApprovedSellerPerformanceResult = {
  rows: SellerPerformanceRow[];
  nextCursor: string | null;
};

function asNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return value.length > 0 ? value : null;
}

function adminSdkAvailable(): boolean {
  return hasAppwritePublicConfig() && Boolean(process.env.APPWRITE_API_KEY?.trim());
}

function clampLimit(raw?: number): number {
  return Math.min(Math.max(raw ?? DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

function isPendingStatus(status: Order["status"]): boolean {
  return (SELLER_PENDING_STATUSES as readonly string[]).includes(status);
}

function emptyList(): ListApprovedSellerPerformanceResult {
  return { rows: [], nextCursor: null };
}

/**
 * Pure per-seller KPI rollup (no I/O). Revenue is paid payments only;
 * pending uses SELLER_PENDING_STATUSES. Payments whose order is not owned
 * by that seller are ignored.
 */
export function aggregateSellerPerformanceRows(
  sellers: SellerPerformanceInput[],
  orders: Order[],
  payments: Payment[],
): SellerPerformanceRow[] {
  const ordersBySeller = new Map<string, Order[]>();
  for (const order of orders) {
    const list = ordersBySeller.get(order.sellerId) ?? [];
    list.push(order);
    ordersBySeller.set(order.sellerId, list);
  }

  return sellers.map((seller) => {
    const sellerOrders = (ordersBySeller.get(seller.sellerId) ?? []).filter(
      (order) => ownedBySeller(order, seller.sellerId),
    );
    const ownedOrderIds = new Set(sellerOrders.map((order) => order.$id));
    const sellerPayments = payments.filter(
      (payment) =>
        payment.status === "paid" && ownedOrderIds.has(payment.orderId),
    );
    const { total, currency } = aggregatePaidEarnings(sellerPayments);

    return {
      sellerId: seller.sellerId,
      shopName: seller.shopName,
      slug: seller.slug,
      orderCount: sellerOrders.length,
      pendingCount: sellerOrders.filter((order) => isPendingStatus(order.status))
        .length,
      revenue: total,
      currency,
    };
  });
}

async function listApprovedSellerPage(opts: {
  limit: number;
  cursor?: string;
}): Promise<{ sellers: SellerPerformanceInput[]; nextCursor: string | null }> {
  const { tables } = await createAdminClient();
  const queries = [
    Query.equal("status", APPROVED_SELLER_STATUS),
    Query.orderDesc("$createdAt"),
    Query.limit(opts.limit),
  ];
  if (opts.cursor) {
    queries.push(Query.cursorAfter(opts.cursor));
  }

  const result = await tables.listRows({
    databaseId: DATABASE_ID,
    tableId: TABLE_SELLER_PROFILES,
    queries,
  });

  const sellers: SellerPerformanceInput[] = [];
  for (const row of result.rows) {
    const record = row as unknown as Record<string, unknown>;
    const profile = asSellerProfile(record);
    if (!profile || profile.status !== APPROVED_SELLER_STATUS) continue;
    sellers.push({
      sellerId: profile.userId,
      shopName: profile.shopName,
      slug: profile.slug,
    });
  }

  const lastRowId = asNullableString(
    (result.rows.at(-1) as unknown as Record<string, unknown> | undefined)?.$id,
  );
  const nextCursor =
    result.rows.length === opts.limit && lastRowId ? lastRowId : null;

  return { sellers, nextCursor };
}

async function fetchOrdersForSellerIds(sellerIds: string[]): Promise<Order[]> {
  if (sellerIds.length === 0) return [];

  const { tables } = await createAdminClient();
  const orders: Order[] = [];
  const allowed = new Set(sellerIds);

  for (const batch of chunk(sellerIds, QUERY_CHUNK)) {
    let cursor: string | undefined;
    for (;;) {
      const queries = [
        Query.equal("sellerId", batch),
        Query.limit(QUERY_CHUNK),
      ];
      if (cursor) queries.push(Query.cursorAfter(cursor));

      const result = await tables.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLE_ORDERS,
        queries,
      });

      if (result.rows.length === 0) break;

      for (const row of result.rows) {
        const order = asOrder(row as unknown as Record<string, unknown>);
        if (order && allowed.has(order.sellerId)) {
          orders.push(order);
        }
      }

      if (result.rows.length < QUERY_CHUNK) break;
      const lastId = asNullableString(
        (result.rows[result.rows.length - 1] as unknown as Record<
          string,
          unknown
        >).$id,
      );
      if (!lastId) break;
      cursor = lastId;
    }
  }

  return orders;
}

async function fetchPaidPaymentsForOrderIds(
  orderIds: string[],
): Promise<Payment[]> {
  if (orderIds.length === 0) return [];

  const { tables } = await createAdminClient();
  const payments: Payment[] = [];
  const allowed = new Set(orderIds);

  for (const batch of chunk(orderIds, QUERY_CHUNK)) {
    let cursor: string | undefined;
    for (;;) {
      const queries = [
        Query.equal("orderId", batch),
        Query.equal("status", "paid"),
        Query.limit(QUERY_CHUNK),
      ];
      if (cursor) queries.push(Query.cursorAfter(cursor));

      const result = await tables.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLE_PAYMENTS,
        queries,
      });

      if (result.rows.length === 0) break;

      for (const row of result.rows) {
        const payment = asPayment(row as unknown as Record<string, unknown>);
        if (
          payment &&
          payment.status === "paid" &&
          allowed.has(payment.orderId)
        ) {
          payments.push(payment);
        }
      }

      if (result.rows.length < QUERY_CHUNK) break;
      const lastId = asNullableString(
        (result.rows[result.rows.length - 1] as unknown as Record<
          string,
          unknown
        >).$id,
      );
      if (!lastId) break;
      cursor = lastId;
    }
  }

  return payments;
}

/**
 * Admin-only KPI list for approved sellers (server-only; admin SDK).
 * Bank fields are never included. Empty on missing config or Appwrite errors.
 */
export async function listApprovedSellerPerformance(opts?: {
  limit?: number;
  cursor?: string;
}): Promise<ListApprovedSellerPerformanceResult> {
  await requireLabel("admin");

  if (!adminSdkAvailable()) {
    return emptyList();
  }

  const limit = clampLimit(opts?.limit);
  const cursor = opts?.cursor?.trim() || undefined;

  try {
    const { sellers, nextCursor } = await listApprovedSellerPage({
      limit,
      cursor,
    });
    if (sellers.length === 0) {
      return emptyList();
    }

    const sellerIds = sellers.map((s) => s.sellerId);
    const orders = await fetchOrdersForSellerIds(sellerIds);
    const payments = await fetchPaidPaymentsForOrderIds(
      orders.map((order) => order.$id),
    );

    return {
      rows: aggregateSellerPerformanceRows(sellers, orders, payments),
      nextCursor,
    };
  } catch {
    return emptyList();
  }
}
