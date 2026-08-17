import { Query } from "node-appwrite";
import type { Models } from "node-appwrite";
import {
  DATABASE_ID,
  TABLE_ORDERS,
  TABLE_PAYMENTS,
  TABLE_SELLER_PROFILES,
  hasAppwritePublicConfig,
} from "@/lib/appwrite/config";
import { requireLabel } from "@/lib/appwrite/roles";
import { createAdminClient } from "@/lib/appwrite/server";
import type { PaymentStatus, SellerStatus } from "@/lib/types";

const APPROVED_SELLER_STATUS: SellerStatus = "approved";
const PAID_PAYMENT_STATUS: PaymentStatus = "paid";
const DEFAULT_CURRENCY = "LKR";
const PAGE_SIZE = 100;

export type AnalyticsRange = "30d" | "12m";
export type AnalyticsBucket = "day" | "month";

export type SalesBucket = {
  bucket: string;
  orderCount: number;
  revenue: number;
  currency: string;
};

export type UserGrowthBucket = {
  bucket: string;
  newUsers: number;
  newSellers: number;
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

function adminSdkAvailable(): boolean {
  return hasAppwritePublicConfig() && Boolean(process.env.APPWRITE_API_KEY?.trim());
}

function resolveRange(range?: AnalyticsRange): {
  start: string;
  end: string;
  bucket: AnalyticsBucket;
} {
  const selected = range === "12m" ? "12m" : "30d";
  const now = new Date();

  if (selected === "30d") {
    const end = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
    );
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - 30);
    return { start: start.toISOString(), end: end.toISOString(), bucket: "day" };
  }

  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));
  return { start: start.toISOString(), end: end.toISOString(), bucket: "month" };
}

function toDayBucket(iso: string): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function toMonthBucket(iso: string): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function bucketKeyFromIso(iso: string, bucket: AnalyticsBucket): string | null {
  return bucket === "day" ? toDayBucket(iso) : toMonthBucket(iso);
}

function generateBucketKeys(
  start: string,
  end: string,
  bucket: AnalyticsBucket,
): string[] {
  const keys: string[] = [];
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return keys;
  }

  if (bucket === "day") {
    const cur = new Date(startDate);
    while (cur < endDate) {
      const key = toDayBucket(cur.toISOString());
      if (key) keys.push(key);
      cur.setUTCDate(cur.getUTCDate() + 1);
    }
    return keys;
  }

  const cur = new Date(
    Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1),
  );
  while (cur < endDate) {
    const key = toMonthBucket(cur.toISOString());
    if (key) keys.push(key);
    cur.setUTCMonth(cur.getUTCMonth() + 1);
  }
  return keys;
}

function initSalesBuckets(keys: string[]): Map<string, SalesBucket> {
  const map = new Map<string, SalesBucket>();
  for (const key of keys) {
    map.set(key, {
      bucket: key,
      orderCount: 0,
      revenue: 0,
      currency: DEFAULT_CURRENCY,
    });
  }
  return map;
}

function initGrowthBuckets(keys: string[]): Map<string, UserGrowthBucket> {
  const map = new Map<string, UserGrowthBucket>();
  for (const key of keys) {
    map.set(key, { bucket: key, newUsers: 0, newSellers: 0 });
  }
  return map;
}

function mapToSortedSales(map: Map<string, SalesBucket>, currency: string): SalesBucket[] {
  return [...map.values()].map((row) => ({
    ...row,
    currency,
    revenue: Number.isFinite(row.revenue) ? row.revenue : 0,
  }));
}

function mapToSortedGrowth(map: Map<string, UserGrowthBucket>): UserGrowthBucket[] {
  return [...map.values()];
}

async function pageTableRowsInRange(
  tableId: string,
  start: string,
  end: string,
  extraQueries: string[],
  onRow: (row: Record<string, unknown>) => void,
): Promise<void> {
  const { tables } = await createAdminClient();
  let cursor: string | undefined;

  for (;;) {
    const queries = [
      Query.greaterThanEqual("$createdAt", start),
      Query.lessThan("$createdAt", end),
      ...extraQueries,
      Query.limit(PAGE_SIZE),
    ];
    if (cursor) {
      queries.push(Query.cursorAfter(cursor));
    }

    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId,
      queries,
      total: false,
    });

    if (result.rows.length === 0) break;

    for (const row of result.rows) {
      onRow(row as unknown as Record<string, unknown>);
    }

    if (result.rows.length < PAGE_SIZE) break;
    const lastId = asNullableString(
      (result.rows[result.rows.length - 1] as unknown as Record<string, unknown>)
        .$id,
    );
    if (!lastId) break;
    cursor = lastId;
  }
}

async function pageUsersInRegistrationRange(
  start: string,
  end: string,
  onUser: (user: Models.User<Models.Preferences>) => void,
): Promise<void> {
  const { users } = await createAdminClient();
  let cursor: string | undefined;

  for (;;) {
    const queries = [
      Query.greaterThanEqual("registration", start),
      Query.lessThan("registration", end),
      Query.orderAsc("registration"),
      Query.limit(PAGE_SIZE),
    ];
    if (cursor) {
      queries.push(Query.cursorAfter(cursor));
    }

    const result = await users.list({ queries, total: false });
    if (result.users.length === 0) break;

    for (const user of result.users) {
      onUser(user);
    }

    if (result.users.length < PAGE_SIZE) break;
    const lastId = result.users.at(-1)?.$id;
    if (!lastId) break;
    cursor = lastId;
  }
}

function userRegistrationIso(user: Models.User<Models.Preferences>): string | null {
  const registration = asNullableString(user.registration);
  if (registration) return registration;
  return asNullableString(user.$createdAt);
}

/**
 * Aggregate paid revenue + order counts per time bucket (bounded range only).
 * Server-only; admin label + APPWRITE_API_KEY required. Never throws.
 */
export async function getSalesOverTime(opts?: {
  range?: AnalyticsRange;
  bucket?: AnalyticsBucket;
}): Promise<SalesBucket[]> {
  await requireLabel("admin");
  if (!adminSdkAvailable()) return [];

  const { start, end, bucket } = resolveRange(opts?.range);
  const keys = generateBucketKeys(start, end, bucket);
  if (keys.length === 0) return [];

  const buckets = initSalesBuckets(keys);
  let currency = DEFAULT_CURRENCY;

  try {
    await pageTableRowsInRange(TABLE_ORDERS, start, end, [], (row) => {
      const createdAt = asNullableString(row.$createdAt);
      if (!createdAt) return;
      const key = bucketKeyFromIso(createdAt, bucket);
      if (!key || !buckets.has(key)) return;
      const entry = buckets.get(key)!;
      entry.orderCount += 1;
    });

    await pageTableRowsInRange(
      TABLE_PAYMENTS,
      start,
      end,
      [Query.equal("status", PAID_PAYMENT_STATUS)],
      (row) => {
        const createdAt = asNullableString(row.$createdAt);
        if (!createdAt) return;
        const key = bucketKeyFromIso(createdAt, bucket);
        if (!key || !buckets.has(key)) return;
        const entry = buckets.get(key)!;
        entry.revenue += asNumber(row.amount);
        if (currency === DEFAULT_CURRENCY) {
          const rowCurrency = asNullableString(row.currency);
          if (rowCurrency) currency = rowCurrency;
        }
      },
    );

    return mapToSortedSales(buckets, currency);
  } catch {
    return [];
  }
}

/**
 * Aggregate new user signups + approved seller profiles per time bucket.
 * Server-only; admin label + APPWRITE_API_KEY required. Never throws.
 */
export async function getUserGrowthOverTime(opts?: {
  range?: AnalyticsRange;
  bucket?: AnalyticsBucket;
}): Promise<UserGrowthBucket[]> {
  await requireLabel("admin");
  if (!adminSdkAvailable()) return [];

  const { start, end, bucket } = resolveRange(opts?.range);
  const keys = generateBucketKeys(start, end, bucket);
  if (keys.length === 0) return [];

  const buckets = initGrowthBuckets(keys);

  try {
    await pageUsersInRegistrationRange(start, end, (user) => {
      const iso = userRegistrationIso(user);
      if (!iso) return;
      const key = bucketKeyFromIso(iso, bucket);
      if (!key || !buckets.has(key)) return;
      buckets.get(key)!.newUsers += 1;
    });

    await pageTableRowsInRange(
      TABLE_SELLER_PROFILES,
      start,
      end,
      [Query.equal("status", APPROVED_SELLER_STATUS)],
      (row) => {
        const createdAt = asNullableString(row.$createdAt);
        if (!createdAt) return;
        const key = bucketKeyFromIso(createdAt, bucket);
        if (!key || !buckets.has(key)) return;
        buckets.get(key)!.newSellers += 1;
      },
    );

    return mapToSortedGrowth(buckets);
  } catch {
    return [];
  }
}

export function parseAnalyticsRange(value: string | undefined): AnalyticsRange {
  return value === "12m" ? "12m" : "30d";
}
