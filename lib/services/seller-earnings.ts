import { Query } from "node-appwrite";
import {
  DATABASE_ID,
  TABLE_ORDERS,
  TABLE_PAYMENTS,
  hasAppwritePublicConfig,
} from "@/lib/appwrite/config";
import { createSessionClient } from "@/lib/appwrite/server";
import { getLoggedInUser } from "@/lib/appwrite/session";
import type { Order, Payment } from "@/lib/types";
import { asOrder, asPayment } from "./orders";
import { ownedBySeller } from "./seller-orders";

const DEFAULT_CURRENCY = "LKR";
const PAGE_SIZE = 100;
const LIST_DISPLAY_LIMIT = 50;

export type SellerEarningsLine = {
  order: Order;
  payment: Payment;
};

export type SellerEarnings = {
  total: number;
  currency: string;
  lines: SellerEarningsLine[];
  lineCount: number;
};

function asNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return value.length > 0 ? value : null;
}

function emptyEarnings(): SellerEarnings {
  return { total: 0, currency: DEFAULT_CURRENCY, lines: [], lineCount: 0 };
}

/**
 * Pure sum from payment rows (no I/O). Used by verify script and paging loop.
 */
export function aggregatePaidEarnings(payments: Payment[]): {
  total: number;
  currency: string;
} {
  let total = 0;
  let currency = DEFAULT_CURRENCY;

  for (const payment of payments) {
    if (payment.status !== "paid") continue;
    total += payment.amount;
    if (currency === DEFAULT_CURRENCY && payment.currency) {
      currency = payment.currency;
    }
  }

  return {
    total: Number.isFinite(total) ? total : 0,
    currency,
  };
}

// ponytail: O(orders) scan — payments have no sellerId; add column if sellers outgrow paging.
async function listSellerOrders(sellerId: string): Promise<Order[]> {
  const { tables } = await createSessionClient();
  const orders: Order[] = [];
  let cursor: string | undefined;

  for (;;) {
    const queries = [
      Query.equal("sellerId", sellerId),
      Query.orderDesc("$createdAt"),
      Query.limit(PAGE_SIZE),
    ];
    if (cursor) {
      queries.push(Query.cursorAfter(cursor));
    }

    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_ORDERS,
      queries,
      total: false,
    });

    if (result.rows.length === 0) break;

    for (const row of result.rows) {
      const order = asOrder(row as unknown as Record<string, unknown>);
      if (order && ownedBySeller(order, sellerId)) {
        orders.push(order);
      }
    }

    if (result.rows.length < PAGE_SIZE) break;
    const lastId = asNullableString(
      (result.rows[result.rows.length - 1] as unknown as Record<string, unknown>)
        .$id,
    );
    if (!lastId) break;
    cursor = lastId;
  }

  return orders;
}

async function fetchPaidPaymentsForOrders(
  orderIds: string[],
  ownedOrderIds: Set<string>,
): Promise<Payment[]> {
  if (orderIds.length === 0) return [];

  const { tables } = await createSessionClient();
  const payments: Payment[] = [];

  for (let i = 0; i < orderIds.length; i += PAGE_SIZE) {
    const chunk = orderIds.slice(i, i + PAGE_SIZE);
    let cursor: string | undefined;

    for (;;) {
      const queries = [
        Query.equal("orderId", chunk),
        Query.equal("status", "paid"),
        Query.limit(PAGE_SIZE),
      ];
      if (cursor) {
        queries.push(Query.cursorAfter(cursor));
      }

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
          ownedOrderIds.has(payment.orderId)
        ) {
          payments.push(payment);
        }
      }

      if (result.rows.length < PAGE_SIZE) break;
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

function buildEarningsLines(
  orders: Order[],
  payments: Payment[],
  sellerId: string,
): SellerEarningsLine[] {
  const orderById = new Map(orders.map((o) => [o.$id, o]));
  const orderIndex = new Map(orders.map((o, i) => [o.$id, i]));
  const lines: SellerEarningsLine[] = [];

  for (const payment of payments) {
    const order = orderById.get(payment.orderId);
    if (!order || !ownedBySeller(order, sellerId)) continue;
    lines.push({ order, payment });
  }

  lines.sort(
    (a, b) =>
      (orderIndex.get(a.order.$id) ?? 0) - (orderIndex.get(b.order.$id) ?? 0),
  );

  return lines;
}

/**
 * Read-only seller earnings (session client; own sellerId orders + paid payments only).
 * Returns zeros on empty data or Appwrite errors — never throws to callers.
 */
export async function getSellerEarnings(): Promise<SellerEarnings> {
  if (!hasAppwritePublicConfig()) return emptyEarnings();

  const user = await getLoggedInUser();
  if (!user) return emptyEarnings();

  const sellerId = user.$id;

  try {
    const orders = await listSellerOrders(sellerId);
    const ownedOrderIds = new Set(orders.map((o) => o.$id));
    const payments = await fetchPaidPaymentsForOrders(
      [...ownedOrderIds],
      ownedOrderIds,
    );

    const { total, currency } = aggregatePaidEarnings(payments);
    const lines = buildEarningsLines(orders, payments, sellerId);

    return {
      total,
      currency,
      lineCount: lines.length,
      lines: lines.slice(0, LIST_DISPLAY_LIMIT),
    };
  } catch {
    return emptyEarnings();
  }
}
