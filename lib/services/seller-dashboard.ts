import type { Product, PurchaseRequest, SellerProfile } from "@/lib/types";
import { listOwnProducts } from "./seller-listings";
import { listSellerPurchaseRequests } from "./purchase-requests";
import { getSellerMetrics, type SellerMetrics } from "./seller-metrics";
import { getOwnSellerProfile } from "./seller-application";
import {
  getOwnSellerReviewInsights,
  type OwnSellerReviewInsights,
} from "./reviews";
import { getSellerViewInsights, type SellerViewInsights } from "./view-stats";

const LOW_STOCK_THRESHOLD = 5;

export type SellerAnalyticsRange = "30d" | "12m";

/** Time-bucket sold request counts (revenue retained at 0 for legacy chart shape). */
export type SellerSalesBucket = {
  bucket: string;
  orderCount: number;
  revenue: number;
  currency: string;
};

export type SellerRequestDayBucket = {
  bucket: string;
  newRequests: number;
  sold: number;
};

export type SellerDashboardSnapshot = {
  metrics: SellerMetrics;
  listingCounts: {
    total: number;
    active: number;
    draft: number;
    pendingReview: number;
  };
  recentRequests: PurchaseRequest[];
  lowStock: Product[];
  shop: {
    shopName: string | null;
    slug: string | null;
    hasPolicies: boolean;
  };
  earningsSeries: SellerSalesBucket[];
  requestSeries: SellerRequestDayBucket[];
  views: SellerViewInsights;
  viewProducts: Array<{ productId: string; title: string; count: number }>;
  reviewInsights: OwnSellerReviewInsights;
};

function toDayBucket(iso: string): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function resolveRange(range?: SellerAnalyticsRange): {
  start: Date;
  end: Date;
} {
  const now = new Date();
  const selected = range === "12m" ? "12m" : "30d";
  if (selected === "30d") {
    const end = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
    );
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - 30);
    return { start, end };
  }
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));
  return { start, end };
}

function generateDayKeys(start: Date, end: Date): string[] {
  const keys: string[] = [];
  const cur = new Date(start);
  while (cur < end) {
    const key = toDayBucket(cur.toISOString());
    if (key) keys.push(key);
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return keys;
}

function bucketSoldRequests(
  requests: PurchaseRequest[],
  range: SellerAnalyticsRange,
): SellerSalesBucket[] {
  const { start, end } = resolveRange(range);
  const keys = generateDayKeys(start, end);
  const map = new Map<string, SellerSalesBucket>();
  for (const key of keys) {
    map.set(key, { bucket: key, orderCount: 0, revenue: 0, currency: "LKR" });
  }

  for (const request of requests) {
    if (request.status !== "sold" || !request.$createdAt) continue;
    const created = new Date(request.$createdAt);
    if (Number.isNaN(created.getTime()) || created < start || created >= end) {
      continue;
    }
    const key = toDayBucket(request.$createdAt);
    if (!key) continue;
    const row = map.get(key);
    if (row) row.orderCount += 1;
  }

  return [...map.values()];
}

function bucketNewAndSoldRequests(
  allRequests: PurchaseRequest[],
  soldRequests: PurchaseRequest[],
  range: SellerAnalyticsRange,
): SellerRequestDayBucket[] {
  const { start, end } = resolveRange(range);
  const keys = generateDayKeys(start, end);
  const map = new Map<string, SellerRequestDayBucket>();
  for (const key of keys) {
    map.set(key, { bucket: key, newRequests: 0, sold: 0 });
  }

  for (const request of allRequests) {
    if (!request.$createdAt) continue;
    const created = new Date(request.$createdAt);
    if (Number.isNaN(created.getTime()) || created < start || created >= end) {
      continue;
    }
    const key = toDayBucket(request.$createdAt);
    if (!key) continue;
    const row = map.get(key);
    if (row) row.newRequests += 1;
  }

  for (const request of soldRequests) {
    if (request.status !== "sold" || !request.$createdAt) continue;
    const created = new Date(request.$createdAt);
    if (Number.isNaN(created.getTime()) || created < start || created >= end) {
      continue;
    }
    const key = toDayBucket(request.$createdAt);
    if (!key) continue;
    const row = map.get(key);
    if (row) row.sold += 1;
  }

  return [...map.values()];
}

function shopCompleteness(profile: SellerProfile | null): SellerDashboardSnapshot["shop"] {
  if (!profile) {
    return {
      shopName: null,
      slug: null,
      hasPolicies: false,
    };
  }
  return {
    shopName: profile.shopName,
    slug: profile.slug,
    hasPolicies: Boolean(profile.returnPolicy || profile.shippingPolicy),
  };
}

/** Pure assembly shared by seller session and admin shop detail loaders. */
export function buildSellerDashboardSnapshot(input: {
  metrics: SellerMetrics;
  products: Product[];
  recentRequests: PurchaseRequest[];
  profile: SellerProfile | null;
  views: SellerViewInsights;
  soldRequests: PurchaseRequest[];
  allRequests: PurchaseRequest[];
  reviewInsights: OwnSellerReviewInsights;
}): SellerDashboardSnapshot {
  const { products, views } = input;

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
    metrics: input.metrics,
    listingCounts,
    recentRequests: input.recentRequests,
    lowStock,
    shop: shopCompleteness(input.profile),
    earningsSeries: bucketSoldRequests(input.soldRequests, "30d"),
    requestSeries: bucketNewAndSoldRequests(
      input.allRequests,
      input.soldRequests,
      "30d",
    ),
    views,
    viewProducts: views.topProducts.map((row) => ({
      productId: row.productId,
      count: row.count,
      title:
        products.find((product) => product.$id === row.productId)?.title ??
        "Listing",
    })),
    reviewInsights: input.reviewInsights,
  };
}

export async function getSellerDashboardSnapshot(): Promise<SellerDashboardSnapshot> {
  const [
    metrics,
    products,
    recentRequests,
    profile,
    views,
    soldRequests,
    allRequests,
    reviewInsights,
  ] = await Promise.all([
    getSellerMetrics(),
    listOwnProducts({ limit: 100 }),
    listSellerPurchaseRequests({ limit: 5 }),
    getOwnSellerProfile(),
    getSellerViewInsights(),
    listSellerPurchaseRequests({ status: "sold", limit: 100 }),
    listSellerPurchaseRequests({ limit: 100 }),
    getOwnSellerReviewInsights(),
  ]);

  return buildSellerDashboardSnapshot({
    metrics,
    products,
    recentRequests,
    profile,
    views,
    soldRequests,
    allRequests,
    reviewInsights,
  });
}

export function parseSellerAnalyticsRange(
  raw: string | undefined,
): SellerAnalyticsRange {
  return raw === "12m" ? "12m" : "30d";
}
