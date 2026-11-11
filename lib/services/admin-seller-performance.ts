import { Query } from "@/lib/db/appwrite-shim";
import {
  DATABASE_ID,
  TABLE_PURCHASE_REQUESTS,
  TABLE_SELLER_PROFILES,
  hasAppwritePublicConfig,
} from "@/lib/appwrite/config";
import { requireLabel } from "@/lib/appwrite/roles";
import { createAdminClient } from "@/lib/appwrite/server";
import type { PurchaseRequest, SellerStatus } from "@/lib/types";
import { asPurchaseRequest } from "./purchase-requests";
import { asSellerProfile } from "./seller-approvals";

const APPROVED_SELLER_STATUS: SellerStatus = "approved";
const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;
const QUERY_CHUNK = 100;

export type SellerPerformanceInput = {
  profileId: string;
  sellerId: string;
  shopName: string;
  slug: string;
};

export type SellerPerformanceRow = {
  profileId: string;
  sellerId: string;
  shopName: string;
  slug: string;
  orderCount: number;
  pendingCount: number;
  cancelledCount: number;
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
  return hasAppwritePublicConfig() && Boolean(process.env.DATABASE_URL?.trim());
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

function emptyList(): ListApprovedSellerPerformanceResult {
  return { rows: [], nextCursor: null };
}

/**
 * Pure per-seller KPI rollup (no I/O).
 * orderCount = sold; pendingCount = open (requested); cancelledCount = cancelled.
 */
export function aggregateSellerPerformanceRows(
  sellers: SellerPerformanceInput[],
  requests: PurchaseRequest[],
): SellerPerformanceRow[] {
  const requestsBySeller = new Map<string, PurchaseRequest[]>();
  for (const request of requests) {
    const list = requestsBySeller.get(request.sellerId) ?? [];
    list.push(request);
    requestsBySeller.set(request.sellerId, list);
  }

  return sellers.map((seller) => {
    const sellerRequests = requestsBySeller.get(seller.sellerId) ?? [];
    const sold = sellerRequests.filter((r) => r.status === "sold").length;
    const open = sellerRequests.filter((r) => r.status === "requested").length;
    const cancelled = sellerRequests.filter(
      (r) => r.status === "cancelled",
    ).length;

    return {
      profileId: seller.profileId,
      sellerId: seller.sellerId,
      shopName: seller.shopName,
      slug: seller.slug,
      orderCount: sold,
      pendingCount: open,
      cancelledCount: cancelled,
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
      profileId: profile.$id,
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

async function fetchPurchaseRequestsForSellerIds(
  sellerIds: string[],
): Promise<PurchaseRequest[]> {
  if (sellerIds.length === 0) return [];

  const { tables } = await createAdminClient();
  const requests: PurchaseRequest[] = [];
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
        tableId: TABLE_PURCHASE_REQUESTS,
        queries,
      });

      if (result.rows.length === 0) break;

      for (const row of result.rows) {
        const request = asPurchaseRequest(
          row as unknown as Record<string, unknown>,
        );
        if (request && allowed.has(request.sellerId)) {
          requests.push(request);
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

  return requests;
}

/**
 * Admin-only KPI list for approved sellers (server-only; admin SDK).
 * Empty on missing config or Appwrite errors.
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
    const requests = await fetchPurchaseRequestsForSellerIds(sellerIds);

    return {
      rows: aggregateSellerPerformanceRows(sellers, requests),
      nextCursor,
    };
  } catch {
    return emptyList();
  }
}
