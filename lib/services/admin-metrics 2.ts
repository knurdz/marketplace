import { Query } from "node-appwrite";
import {
  DATABASE_ID,
  TABLE_ORDERS,
  TABLE_PAYMENTS,
  TABLE_SELLER_PROFILES,
  hasAppwritePublicConfig,
} from "@/lib/appwrite/config";
import { createAdminClient } from "@/lib/appwrite/server";
import type { PaymentStatus, SellerStatus } from "@/lib/types";

const APPROVED_SELLER_STATUS: SellerStatus = "approved";
const PAID_PAYMENT_STATUS: PaymentStatus = "paid";
const DEFAULT_CURRENCY = "LKR";
const PAID_PAGE_SIZE = 100;

export type AdminMetrics = {
  totalUsers: number;
  activeSellers: number;
  totalOrders: number;
  grossRevenue: number;
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

function asNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return value.length > 0 ? value : null;
}

function safeCount(value: unknown): number {
  const n = asNumber(value, 0);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

function emptyMetrics(): AdminMetrics {
  return {
    totalUsers: 0,
    activeSellers: 0,
    totalOrders: 0,
    grossRevenue: 0,
    currency: DEFAULT_CURRENCY,
  };
}

async function countUsers(): Promise<number> {
  const { users } = await createAdminClient();
  const result = await users.list({
    queries: [Query.limit(1)],
    total: true,
  });
  return safeCount(result.total);
}

async function countTableRows(
  tableId: string,
  queries: string[] = [],
): Promise<number> {
  const { tables } = await createAdminClient();
  const result = await tables.listRows({
    databaseId: DATABASE_ID,
    tableId,
    queries: [...queries, Query.limit(1)],
    total: true,
  });
  return safeCount(result.total);
}

async function sumPaidPayments(): Promise<{ grossRevenue: number; currency: string }> {
  const { tables } = await createAdminClient();
  let grossRevenue = 0;
  let currency = DEFAULT_CURRENCY;
  let cursor: string | undefined;

  for (;;) {
    const queries = [
      Query.equal("status", PAID_PAYMENT_STATUS),
      Query.limit(PAID_PAGE_SIZE),
    ];
    if (cursor) {
      queries.push(Query.cursorAfter(cursor));
    }

    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_PAYMENTS,
      queries,
      total: false,
    });

    if (result.rows.length === 0) break;

    for (const row of result.rows) {
      const record = row as unknown as Record<string, unknown>;
      grossRevenue += asNumber(record.amount);
      if (currency === DEFAULT_CURRENCY) {
        const rowCurrency = asNullableString(record.currency);
        if (rowCurrency) currency = rowCurrency;
      }
    }

    if (result.rows.length < PAID_PAGE_SIZE) break;
    const lastId = asNullableString(
      (result.rows[result.rows.length - 1] as unknown as Record<string, unknown>)
        .$id,
    );
    if (!lastId) break;
    cursor = lastId;
  }

  return {
    grossRevenue: Number.isFinite(grossRevenue) ? grossRevenue : 0,
    currency,
  };
}

/**
 * Platform-wide admin metrics (server-only; requires APPWRITE_API_KEY).
 * Returns zeros on empty data or Appwrite errors — never throws to callers.
 */
export async function getAdminMetrics(): Promise<AdminMetrics> {
  if (!hasAppwritePublicConfig()) return emptyMetrics();
  if (!process.env.APPWRITE_API_KEY?.trim()) return emptyMetrics();

  try {
    const [totalUsers, activeSellers, totalOrders, revenue] = await Promise.all([
      countUsers(),
      countTableRows(TABLE_SELLER_PROFILES, [
        Query.equal("status", APPROVED_SELLER_STATUS),
      ]),
      countTableRows(TABLE_ORDERS),
      sumPaidPayments(),
    ]);

    return {
      totalUsers,
      activeSellers,
      totalOrders,
      grossRevenue: revenue.grossRevenue,
      currency: revenue.currency,
    };
  } catch {
    return emptyMetrics();
  }
}
