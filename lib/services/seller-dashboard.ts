import type { Order, Product, SellerProfile } from "@/lib/types";
import {
  getSellerEarnings,
  type SellerEarnings,
  type SellerEarningsLine,
} from "./seller-earnings";
import { listOwnProducts } from "./seller-listings";
import {
  listSellerOrderItemsForOrderIds,
  listSellerOrders,
} from "./seller-orders";
import { getSellerMetrics, type SellerMetrics } from "./seller-metrics";
import { getOwnSellerProfile } from "./seller-application";
import { getSellerViewInsights, type SellerViewInsights } from "./view-stats";

const DEFAULT_CURRENCY = "LKR";
const LOW_STOCK_THRESHOLD = 5;

export type SellerAnalyticsRange = "30d" | "12m";

export type SellerSalesBucket = {
  bucket: string;
  orderCount: number;
  revenue: number;
  currency: string;
};

export type SellerProductEarnings = {
  productId: string;
  title: string;
  quantity: number;
  revenue: number;
};

export type SellerDashboardSnapshot = {
  metrics: SellerMetrics;
  listingCounts: {
    total: number;
    active: number;
    draft: number;
    pendingReview: number;
  };
  recentOrders: Order[];
  lowStock: Product[];
  shop: {
    shopName: string | null;
    slug: string | null;
    hasBank: boolean;
    hasPolicies: boolean;
  };
  earningsSeries: SellerSalesBucket[];
  earnings: SellerEarnings;
  views: SellerViewInsights;
  viewProducts: Array<{ productId: string; title: string; count: number }>;
};

export type SellerEarningsAnalytics = {
  range: SellerAnalyticsRange;
  currency: string;
  series: SellerSalesBucket[];
  byProduct: SellerProductEarnings[];
  earnings: SellerEarnings;
};

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

function resolveRange(range?: SellerAnalyticsRange): {
  start: Date;
  end: Date;
  bucket: "day" | "month";
} {
  const now = new Date();
  const selected = range === "12m" ? "12m" : "30d";
  if (selected === "30d") {
    const end = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
    );
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - 30);
    return { start, end, bucket: "day" };
  }
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));
  return { start, end, bucket: "month" };
}

function generateBucketKeys(
  start: Date,
  end: Date,
  bucket: "day" | "month",
): string[] {
  const keys: string[] = [];
  if (bucket === "day") {
    const cur = new Date(start);
    while (cur < end) {
      const key = toDayBucket(cur.toISOString());
      if (key) keys.push(key);
      cur.setUTCDate(cur.getUTCDate() + 1);
    }
    return keys;
  }
  const cur = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
  while (cur < end) {
    const key = toMonthBucket(cur.toISOString());
    if (key) keys.push(key);
    cur.setUTCMonth(cur.getUTCMonth() + 1);
  }
  return keys;
}

export function bucketSellerEarnings(
  lines: SellerEarningsLine[],
  range: SellerAnalyticsRange,
  currency: string,
): SellerSalesBucket[] {
  const { start, end, bucket } = resolveRange(range);
  const keys = generateBucketKeys(start, end, bucket);
  const map = new Map<string, SellerSalesBucket>();
  for (const key of keys) {
    map.set(key, {
      bucket: key,
      orderCount: 0,
      revenue: 0,
      currency,
    });
  }

  const seenOrders = new Set<string>();
  for (const line of lines) {
    if (!line.paidAt) continue;
    const paid = new Date(line.paidAt);
    if (Number.isNaN(paid.getTime()) || paid < start || paid >= end) continue;
    const key =
      bucket === "day" ? toDayBucket(line.paidAt) : toMonthBucket(line.paidAt);
    if (!key) continue;
    const row = map.get(key);
    if (!row) continue;
    row.revenue += line.payment.amount;
    if (!seenOrders.has(`${key}:${line.order.$id}`)) {
      seenOrders.add(`${key}:${line.order.$id}`);
      row.orderCount += 1;
    }
  }

  return [...map.values()].map((row) => ({
    ...row,
    revenue: Number.isFinite(row.revenue) ? row.revenue : 0,
  }));
}

function shopCompleteness(profile: SellerProfile | null): SellerDashboardSnapshot["shop"] {
  if (!profile) {
    return {
      shopName: null,
      slug: null,
      hasBank: false,
      hasPolicies: false,
    };
  }
  return {
    shopName: profile.shopName,
    slug: profile.slug,
    hasBank: Boolean(
      profile.bankName && profile.bankAccountName && profile.bankAccountNumber,
    ),
    hasPolicies: Boolean(profile.returnPolicy || profile.shippingPolicy),
  };
}

export async function getSellerDashboardSnapshot(): Promise<SellerDashboardSnapshot> {
  const [metrics, products, recentOrders, earnings, profile, views] =
    await Promise.all([
      getSellerMetrics(),
      listOwnProducts({ limit: 100 }),
      listSellerOrders({ limit: 5 }),
      getSellerEarnings(),
      getOwnSellerProfile(),
      getSellerViewInsights(),
    ]);

  const listingCounts = {
    total: products.length,
    active: products.filter((p) => p.status === "active").length,
    draft: products.filter((p) => p.status === "draft").length,
    pendingReview: products.filter((p) => p.status === "pending_review").length,
  };

  const lowStock = products
    .filter(
      (p) =>
        p.status !== "archived" &&
        p.available &&
        p.stock >= 0 &&
        p.stock <= LOW_STOCK_THRESHOLD,
    )
    .slice(0, 5);

  return {
    metrics,
    listingCounts,
    recentOrders,
    lowStock,
    shop: shopCompleteness(profile),
    earningsSeries: bucketSellerEarnings(
      earnings.allLines,
      "30d",
      earnings.currency || DEFAULT_CURRENCY,
    ),
    earnings,
    views,
    viewProducts: views.topProducts.map((row) => ({
      productId: row.productId,
      count: row.count,
      title:
        products.find((product) => product.$id === row.productId)?.title ??
        "Listing",
    })),
  };
}

export async function getSellerEarningsAnalytics(
  range: SellerAnalyticsRange = "30d",
): Promise<SellerEarningsAnalytics> {
  const earnings = await getSellerEarnings();
  const currency = earnings.currency || DEFAULT_CURRENCY;
  const series = bucketSellerEarnings(earnings.allLines, range, currency);

  const paidOrderIds = [
    ...new Set(earnings.allLines.map((line) => line.order.$id)),
  ];
  const items = await listSellerOrderItemsForOrderIds(paidOrderIds);
  const byProductMap = new Map<string, SellerProductEarnings>();
  for (const item of items) {
    const current = byProductMap.get(item.productId) ?? {
      productId: item.productId,
      title: item.title,
      quantity: 0,
      revenue: 0,
    };
    current.quantity += item.quantity;
    current.revenue += item.lineTotal;
    byProductMap.set(item.productId, current);
  }

  const byProduct = [...byProductMap.values()].sort(
    (a, b) => b.revenue - a.revenue,
  );

  return {
    range,
    currency,
    series,
    byProduct,
    earnings,
  };
}

export function parseSellerAnalyticsRange(
  raw: string | undefined,
): SellerAnalyticsRange {
  return raw === "12m" ? "12m" : "30d";
}
