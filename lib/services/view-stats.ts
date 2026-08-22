import { ID, Query } from "node-appwrite";
import {
  DATABASE_ID,
  TABLE_VIEW_STATS,
  hasAppwritePublicConfig,
} from "@/lib/appwrite/config";
import { ROLE_LABELS, userHasLabel } from "@/lib/appwrite/roles";
import { createAdminClient } from "@/lib/appwrite/server";
import { getLoggedInUser } from "@/lib/appwrite/session";
import {
  assertRateLimit,
  getClientIp,
  RATE_LIMITS,
} from "@/lib/security/rate-limit";

export type ViewKind = "product" | "shop";

export type ViewStatRow = {
  $id: string;
  sellerId: string;
  kind: ViewKind;
  targetId: string;
  day: string;
  count: number;
};

export type SellerProductViewRow = {
  productId: string;
  count: number;
};

export type SellerViewInsights = {
  shopTotal: number;
  shopSeries: Array<{ bucket: string; count: number }>;
  productTotal: number;
  topProducts: SellerProductViewRow[];
};

const PAGE_SIZE = 100;

function utcDay(date = new Date()): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function asCount(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.floor(value);
  }
  return 0;
}

function asViewRow(row: Record<string, unknown>): ViewStatRow | null {
  const $id = typeof row.$id === "string" ? row.$id : "";
  const sellerId = typeof row.sellerId === "string" ? row.sellerId : "";
  const kind = row.kind === "product" || row.kind === "shop" ? row.kind : null;
  const targetId = typeof row.targetId === "string" ? row.targetId : "";
  const day = typeof row.day === "string" ? row.day : "";
  if (!$id || !sellerId || !kind || !targetId || !day) return null;
  return { $id, sellerId, kind, targetId, day, count: asCount(row.count) };
}

function emptyInsights(): SellerViewInsights {
  return {
    shopTotal: 0,
    shopSeries: [],
    productTotal: 0,
    topProducts: [],
  };
}

async function findDayRow(params: {
  sellerId: string;
  kind: ViewKind;
  targetId: string;
  day: string;
}): Promise<ViewStatRow | null> {
  const { tables } = await createAdminClient();
  const result = await tables.listRows({
    databaseId: DATABASE_ID,
    tableId: TABLE_VIEW_STATS,
    queries: [
      Query.equal("sellerId", params.sellerId),
      Query.equal("kind", params.kind),
      Query.equal("targetId", params.targetId),
      Query.equal("day", params.day),
      Query.limit(1),
    ],
  });
  const row = result.rows[0];
  if (!row) return null;
  return asViewRow(row as unknown as Record<string, unknown>);
}

/**
 * Increment a daily aggregate view. No buyer userId stored.
 * Dedupes refresh spam: one count per IP + target per UTC day.
 */
export async function recordMarketplaceView(input: {
  sellerId: string;
  kind: ViewKind;
  targetId: string;
}): Promise<void> {
  if (!hasAppwritePublicConfig() || !process.env.APPWRITE_API_KEY?.trim()) {
    return;
  }

  const sellerId = input.sellerId.trim();
  const targetId = input.targetId.trim();
  if (!sellerId || !targetId) return;
  if (input.kind !== "product" && input.kind !== "shop") return;

  const ip = await getClientIp();
  const day = utcDay();
  const rate = assertRateLimit({
    bucket: "views",
    key: `${ip}:${input.kind}:${targetId}:${day}`,
    ...RATE_LIMITS.views,
  });
  if (!rate.ok) return;

  try {
    const { tables } = await createAdminClient();
    const existing = await findDayRow({
      sellerId,
      kind: input.kind,
      targetId,
      day,
    });

    if (existing) {
      await tables.updateRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_VIEW_STATS,
        rowId: existing.$id,
        data: { count: existing.count + 1 },
      });
      return;
    }

    try {
      await tables.createRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_VIEW_STATS,
        rowId: ID.unique(),
        data: {
          sellerId,
          kind: input.kind,
          targetId,
          day,
          count: 1,
        },
        permissions: [],
      });
    } catch {
      const raced = await findDayRow({
        sellerId,
        kind: input.kind,
        targetId,
        day,
      });
      if (!raced) return;
      await tables.updateRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_VIEW_STATS,
        rowId: raced.$id,
        data: { count: raced.count + 1 },
      });
    }
  } catch {
    // Table may not exist yet, or Appwrite is unreachable — never fail the page.
  }
}

function lastNDays(n: number): string[] {
  const keys: string[] = [];
  const end = new Date();
  const cursor = new Date(
    Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate() - (n - 1)),
  );
  for (let i = 0; i < n; i += 1) {
    keys.push(utcDay(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return keys;
}

async function listOwnViewRows(sellerId: string): Promise<ViewStatRow[]> {
  const { tables } = await createAdminClient();
  const rows: ViewStatRow[] = [];
  let cursor: string | undefined;

  for (;;) {
    const queries = [
      Query.equal("sellerId", sellerId),
      Query.orderDesc("day"),
      Query.limit(PAGE_SIZE),
    ];
    if (cursor) queries.push(Query.cursorAfter(cursor));

    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_VIEW_STATS,
      queries,
    });
    if (result.rows.length === 0) break;

    for (const row of result.rows) {
      const parsed = asViewRow(row as unknown as Record<string, unknown>);
      if (parsed && parsed.sellerId === sellerId) {
        rows.push(parsed);
      }
    }

    if (result.rows.length < PAGE_SIZE) break;
    const last = result.rows[result.rows.length - 1];
    const lastId =
      last && typeof (last as { $id?: string }).$id === "string"
        ? (last as { $id: string }).$id
        : "";
    if (!lastId) break;
    cursor = lastId;
  }

  return rows;
}

/** Own-only view aggregates for the seller dashboard. */
export async function getSellerViewInsights(): Promise<SellerViewInsights> {
  if (!hasAppwritePublicConfig() || !process.env.APPWRITE_API_KEY?.trim()) {
    return emptyInsights();
  }

  const user = await getLoggedInUser();
  if (!user || !userHasLabel(user, ROLE_LABELS.seller)) {
    return emptyInsights();
  }

  try {
    const rows = await listOwnViewRows(user.$id);
    const days = lastNDays(30);
    const shopByDay = new Map(days.map((day) => [day, 0]));
    const productTotals = new Map<string, number>();
    let shopTotal = 0;
    let productTotal = 0;

    for (const row of rows) {
      if (row.kind === "shop") {
        shopTotal += row.count;
        if (shopByDay.has(row.day)) {
          shopByDay.set(row.day, (shopByDay.get(row.day) ?? 0) + row.count);
        }
      } else if (row.kind === "product") {
        productTotal += row.count;
        productTotals.set(
          row.targetId,
          (productTotals.get(row.targetId) ?? 0) + row.count,
        );
      }
    }

    const topProducts = [...productTotals.entries()]
      .map(([productId, count]) => ({ productId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return {
      shopTotal,
      productTotal,
      shopSeries: days.map((bucket) => ({
        bucket,
        count: shopByDay.get(bucket) ?? 0,
      })),
      topProducts,
    };
  } catch {
    return emptyInsights();
  }
}
