import { Query } from "@/lib/db/compat";
import {
  DATABASE_ID,
  TABLE_SELLER_PROFILES,
  hasDatabaseConfig,
} from "@/lib/backend/config";
import { createAdminClient } from "@/lib/backend/server";
import type { SellerStatus } from "@/lib/types";
import { countPurchaseRequestsByStatus } from "./purchase-requests";

const APPROVED_SELLER_STATUS: SellerStatus = "approved";

export type AdminMetrics = {
  totalUsers: number;
  activeSellers: number;
  openRequests: number;
  soldRequests: number;
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

function emptyMetrics(): AdminMetrics {
  return {
    totalUsers: 0,
    activeSellers: 0,
    openRequests: 0,
    soldRequests: 0,
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

/**
 * Platform-wide admin metrics (server-only; requires DATABASE_URL).
 * Returns zeros on empty data or Appwrite errors: never throws to callers.
 */
export async function getAdminMetrics(): Promise<AdminMetrics> {
  if (!hasDatabaseConfig()) return emptyMetrics();
  if (!process.env.DATABASE_URL?.trim()) return emptyMetrics();

  try {
    const [totalUsers, activeSellers, requestCounts] = await Promise.all([
      countUsers(),
      countTableRows(TABLE_SELLER_PROFILES, [
        Query.equal("status", APPROVED_SELLER_STATUS),
      ]),
      countPurchaseRequestsByStatus(),
    ]);

    return {
      totalUsers,
      activeSellers,
      openRequests: requestCounts.requested,
      soldRequests: requestCounts.sold,
    };
  } catch {
    return emptyMetrics();
  }
}
