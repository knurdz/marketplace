import { Query } from "node-appwrite";
import {
  DATABASE_ID,
  TABLE_BANK_SLIPS,
  TABLE_ORDERS,
  TABLE_PRODUCTS,
  TABLE_REPORTS,
  TABLE_SELLER_PROFILES,
  hasAppwritePublicConfig,
} from "@/lib/appwrite/config";
import { requireLabel } from "@/lib/appwrite/roles";
import { createAdminClient } from "@/lib/appwrite/server";
import {
  evaluateBadgeEligibility,
  evaluateFraudFlags,
  FRAUD_ROLLING_WINDOW_DAYS,
  OPEN_REPORT_STATUSES,
  type TrustBankSlip,
  type TrustOrder,
  type TrustReport,
  type TrustSellerProfile,
} from "@/lib/trust/rules";
import type { ReportStatus, SellerStatus } from "@/lib/types";
import { isReportStatus, isSellerStatus } from "@/lib/types";
import { asBankSlip, asOrder } from "./orders";
import { asSellerProfile } from "./seller-approvals";

const APPROVED_SELLER_STATUS: SellerStatus = "approved";
const PAGE_SIZE = 100;
const QUERY_CHUNK = 100;
/** Cap approved sellers evaluated per list call (most recently created first). */
export const MAX_SELLERS_EVALUATED = 100;

export type SellerTrustSignals = {
  verified: boolean;
  verifiedReasons: string[];
  flags: { rule: string; reason: string }[];
};

export type FlaggedSellerRow = {
  sellerId: string;
  shopName: string;
  flags: { rule: string; reason: string }[];
};

export type VerifiedSellerRow = {
  sellerId: string;
  shopName: string;
  verifiedReasons: string[];
};

function asNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return value.length > 0 ? value : null;
}

function adminSdkAvailable(): boolean {
  return hasAppwritePublicConfig() && Boolean(process.env.APPWRITE_API_KEY?.trim());
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

function toTrustProfile(
  row: Record<string, unknown>,
): TrustSellerProfile | null {
  const profile = asSellerProfile(row);
  const createdAt = asNullableString(row.$createdAt);
  if (!profile || !createdAt) return null;
  return {
    userId: profile.userId,
    shopName: profile.shopName,
    status: profile.status,
    createdAt,
  };
}

function toTrustOrder(row: Record<string, unknown>): TrustOrder | null {
  const order = asOrder(row);
  const createdAt = asNullableString(row.$createdAt);
  if (!order || !createdAt) return null;
  return {
    $id: order.$id,
    sellerId: order.sellerId,
    status: order.status,
    totalAmount: order.totalAmount,
    createdAt,
  };
}

function toTrustSlip(row: Record<string, unknown>): TrustBankSlip | null {
  const slip = asBankSlip(row);
  const createdAt = asNullableString(row.$createdAt);
  if (!slip || !createdAt) return null;
  return {
    orderId: slip.orderId,
    status: slip.status,
    createdAt,
  };
}

function toTrustReport(row: Record<string, unknown>): TrustReport | null {
  const productId = asNullableString(row.productId);
  const statusRaw = row.status;
  if (!productId || !isReportStatus(statusRaw)) return null;
  return { productId, status: statusRaw };
}

function isOpenReportStatus(status: ReportStatus): boolean {
  return (OPEN_REPORT_STATUSES as readonly ReportStatus[]).includes(status);
}

function rollingWindowStartIso(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - FRAUD_ROLLING_WINDOW_DAYS);
  return d.toISOString();
}

async function listRowsPaginated(
  tableId: string,
  baseQueries: string[],
  maxRows: number,
): Promise<Record<string, unknown>[]> {
  const { tables } = await createAdminClient();
  const rows: Record<string, unknown>[] = [];
  let cursor: string | undefined;

  for (;;) {
    const remaining = maxRows - rows.length;
    if (remaining <= 0) break;

    const queries = [
      ...baseQueries,
      Query.limit(Math.min(PAGE_SIZE, remaining)),
    ];
    if (cursor) queries.push(Query.cursorAfter(cursor));

    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId,
      queries,
    });

    if (result.rows.length === 0) break;

    for (const row of result.rows) {
      rows.push(row as unknown as Record<string, unknown>);
      if (rows.length >= maxRows) break;
    }

    if (rows.length >= maxRows || result.rows.length < Math.min(PAGE_SIZE, remaining)) {
      break;
    }

    const lastId = asNullableString(
      (result.rows[result.rows.length - 1] as unknown as Record<string, unknown>)
        .$id,
    );
    if (!lastId) break;
    cursor = lastId;
  }

  return rows;
}

async function fetchApprovedSellerProfiles(
  maxSellers: number,
): Promise<TrustSellerProfile[]> {
  const rows = await listRowsPaginated(
    TABLE_SELLER_PROFILES,
    [
      Query.equal("status", APPROVED_SELLER_STATUS),
      Query.orderDesc("$createdAt"),
    ],
    maxSellers,
  );

  const profiles: TrustSellerProfile[] = [];
  for (const row of rows) {
    const p = toTrustProfile(row);
    if (p) profiles.push(p);
  }
  return profiles;
}

async function fetchSellerProfileByUserId(
  sellerId: string,
): Promise<TrustSellerProfile | null> {
  const { tables } = await createAdminClient();
  const result = await tables.listRows({
    databaseId: DATABASE_ID,
    tableId: TABLE_SELLER_PROFILES,
    queries: [Query.equal("userId", sellerId), Query.limit(1)],
  });
  const row = result.rows[0] as unknown as Record<string, unknown> | undefined;
  if (!row) return null;
  return toTrustProfile(row);
}

async function fetchOrdersForSellerIds(
  sellerIds: string[],
): Promise<TrustOrder[]> {
  if (sellerIds.length === 0) return [];

  const { tables } = await createAdminClient();
  const orders: TrustOrder[] = [];

  for (const batch of chunk(sellerIds, QUERY_CHUNK)) {
    let cursor: string | undefined;
    for (;;) {
      const queries = [
        Query.equal("sellerId", batch),
        Query.limit(PAGE_SIZE),
      ];
      if (cursor) queries.push(Query.cursorAfter(cursor));

      const result = await tables.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLE_ORDERS,
        queries,
      });

      if (result.rows.length === 0) break;

      for (const row of result.rows) {
        const o = toTrustOrder(row as unknown as Record<string, unknown>);
        if (o) orders.push(o);
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

  return orders;
}

async function fetchRejectedSlipsInWindow(): Promise<TrustBankSlip[]> {
  const windowStart = rollingWindowStartIso();
  const rows = await listRowsPaginated(
    TABLE_BANK_SLIPS,
    [
      Query.equal("status", "rejected"),
      Query.greaterThanEqual("$createdAt", windowStart),
      Query.orderDesc("$createdAt"),
    ],
    500,
  );

  const slips: TrustBankSlip[] = [];
  for (const row of rows) {
    const s = toTrustSlip(row);
    if (s) slips.push(s);
  }
  return slips;
}

async function fetchProductIdsForSellers(
  sellerIds: string[],
): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  if (sellerIds.length === 0) return map;

  const { tables } = await createAdminClient();

  for (const batch of chunk(sellerIds, QUERY_CHUNK)) {
    let cursor: string | undefined;
    for (;;) {
      const queries = [
        Query.equal("sellerId", batch),
        Query.limit(PAGE_SIZE),
      ];
      if (cursor) queries.push(Query.cursorAfter(cursor));

      const result = await tables.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLE_PRODUCTS,
        queries,
      });

      if (result.rows.length === 0) break;

      for (const row of result.rows) {
        const record = row as unknown as Record<string, unknown>;
        const productId = asNullableString(record.$id);
        const sellerId = asNullableString(record.sellerId);
        if (!productId || !sellerId) continue;
        const list = map.get(sellerId) ?? [];
        list.push(productId);
        map.set(sellerId, list);
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

  return map;
}

async function fetchOpenReportsForProductIds(
  productIds: string[],
): Promise<TrustReport[]> {
  if (productIds.length === 0) return [];

  const { tables } = await createAdminClient();
  const reports: TrustReport[] = [];

  for (const batch of chunk(productIds, QUERY_CHUNK)) {
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_REPORTS,
      queries: [
        Query.equal("productId", batch),
        Query.equal("status", [...OPEN_REPORT_STATUSES]),
        Query.limit(PAGE_SIZE),
      ],
    });

    for (const row of result.rows) {
      const r = toTrustReport(row as unknown as Record<string, unknown>);
      if (r && isOpenReportStatus(r.status)) reports.push(r);
    }
  }

  return reports;
}

function groupOrdersBySeller(orders: TrustOrder[]): Map<string, TrustOrder[]> {
  const map = new Map<string, TrustOrder[]>();
  for (const o of orders) {
    const list = map.get(o.sellerId) ?? [];
    list.push(o);
    map.set(o.sellerId, list);
  }
  return map;
}

function mapSlipsToSellers(
  slips: TrustBankSlip[],
  orderSellerMap: Map<string, string>,
): Map<string, TrustBankSlip[]> {
  const map = new Map<string, TrustBankSlip[]>();
  for (const slip of slips) {
    const sellerId = orderSellerMap.get(slip.orderId);
    if (!sellerId) continue;
    const list = map.get(sellerId) ?? [];
    list.push(slip);
    map.set(sellerId, list);
  }
  return map;
}

function countOpenReportsBySeller(
  productIdsBySeller: Map<string, string[]>,
  reports: TrustReport[],
): Map<string, number> {
  const productToSeller = new Map<string, string>();
  for (const [sellerId, productIds] of productIdsBySeller) {
    for (const pid of productIds) {
      productToSeller.set(pid, sellerId);
    }
  }

  const counts = new Map<string, number>();
  for (const report of reports) {
    if (!isOpenReportStatus(report.status)) continue;
    const sellerId = productToSeller.get(report.productId);
    if (!sellerId) continue;
    counts.set(sellerId, (counts.get(sellerId) ?? 0) + 1);
  }
  return counts;
}

type SellerEvaluationBundle = {
  profiles: TrustSellerProfile[];
  ordersBySeller: Map<string, TrustOrder[]>;
  slipsBySeller: Map<string, TrustBankSlip[]>;
  openReportCountBySeller: Map<string, number>;
};

async function buildEvaluationBundle(
  profiles: TrustSellerProfile[],
): Promise<SellerEvaluationBundle> {
  const sellerIds = profiles.map((p) => p.userId);

  const [orders, rejectedSlips, productIdsBySeller] = await Promise.all([
    fetchOrdersForSellerIds(sellerIds),
    fetchRejectedSlipsInWindow(),
    fetchProductIdsForSellers(sellerIds),
  ]);

  const orderSellerMap = new Map<string, string>();
  for (const o of orders) {
    orderSellerMap.set(o.$id, o.sellerId);
  }

  const allProductIds = [...productIdsBySeller.values()].flat();
  const openReports = await fetchOpenReportsForProductIds(allProductIds);

  return {
    profiles,
    ordersBySeller: groupOrdersBySeller(orders),
    slipsBySeller: mapSlipsToSellers(rejectedSlips, orderSellerMap),
    openReportCountBySeller: countOpenReportsBySeller(
      productIdsBySeller,
      openReports,
    ),
  };
}

function evaluateSellerFromBundle(
  profile: TrustSellerProfile,
  bundle: SellerEvaluationBundle,
): SellerTrustSignals {
  const sellerId = profile.userId;
  const orders = bundle.ordersBySeller.get(sellerId) ?? [];
  const slips = bundle.slipsBySeller.get(sellerId) ?? [];
  const openReportCount = bundle.openReportCountBySeller.get(sellerId) ?? 0;

  const badge = evaluateBadgeEligibility({ profile, orders, openReportCount });
  const flags = evaluateFraudFlags({ profile, orders, slips, openReportCount });

  return {
    verified: badge.verified,
    verifiedReasons: badge.reasons,
    flags,
  };
}

/**
 * Trust signals for one seller (computed on read). Admin-only.
 */
export async function getSellerTrustSignals(
  sellerId: string,
): Promise<SellerTrustSignals | null> {
  await requireLabel("admin");
  if (!adminSdkAvailable()) {
    return { verified: false, verifiedReasons: [], flags: [] };
  }

  try {
    const profile = await fetchSellerProfileByUserId(sellerId);
    if (!profile || !isSellerStatus(profile.status)) {
      return null;
    }

    const bundle = await buildEvaluationBundle([profile]);
    return evaluateSellerFromBundle(profile, bundle);
  } catch {
    return { verified: false, verifiedReasons: [], flags: [] };
  }
}

/**
 * Approved sellers with at least one triggered fraud flag.
 * Evaluates up to MAX_SELLERS_EVALUATED most recently created approved sellers.
 */
export async function listSellersWithFlags(): Promise<FlaggedSellerRow[]> {
  await requireLabel("admin");
  if (!adminSdkAvailable()) return [];

  try {
    const profiles = await fetchApprovedSellerProfiles(MAX_SELLERS_EVALUATED);
    if (profiles.length === 0) return [];

    const bundle = await buildEvaluationBundle(profiles);
    const flagged: FlaggedSellerRow[] = [];

    for (const profile of profiles) {
      const signals = evaluateSellerFromBundle(profile, bundle);
      if (signals.flags.length === 0) continue;
      flagged.push({
        sellerId: profile.userId,
        shopName: profile.shopName,
        flags: signals.flags,
      });
    }

    return flagged;
  } catch {
    return [];
  }
}

/**
 * Approved sellers currently eligible for the computed Verified badge.
 * Same seller cap as listSellersWithFlags().
 */
export async function listVerifiedSellers(): Promise<VerifiedSellerRow[]> {
  await requireLabel("admin");
  if (!adminSdkAvailable()) return [];

  try {
    const profiles = await fetchApprovedSellerProfiles(MAX_SELLERS_EVALUATED);
    if (profiles.length === 0) return [];

    const bundle = await buildEvaluationBundle(profiles);
    const verified: VerifiedSellerRow[] = [];

    for (const profile of profiles) {
      const signals = evaluateSellerFromBundle(profile, bundle);
      if (!signals.verified) continue;
      verified.push({
        sellerId: profile.userId,
        shopName: profile.shopName,
        verifiedReasons: signals.verifiedReasons,
      });
    }

    return verified;
  } catch {
    return [];
  }
}
