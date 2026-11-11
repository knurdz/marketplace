import { Query } from "@/lib/db/compat";
import {
  DATABASE_ID,
  TABLE_PRODUCTS,
  TABLE_PROFILES,
  TABLE_PURCHASE_REQUESTS,
  TABLE_REPORTS,
  TABLE_REVIEWS,
  TABLE_SELLER_PROFILES,
  hasDatabaseConfig,
} from "@/lib/backend/config";
import { requireLabel } from "@/lib/backend/roles";
import { createAdminClient } from "@/lib/backend/server";
import type {
  AuditLogEntry,
  Product,
  PurchaseRequest,
  Review,
  SellerProfile,
} from "@/lib/types";
import { getAuditLogsForResource } from "./audit-logs";
import { asProduct } from "./products";
import { asPurchaseRequest } from "./purchase-requests";
import { countPurchaseRequestsByStatus } from "./purchase-requests";
import {
  asReview,
  computeSellerReviewMetrics,
  listAllApprovedSellerReviews,
  type OwnSellerReviewInsights,
} from "./reviews";
import { asSellerProfile } from "./seller-approvals";
import {
  buildSellerDashboardSnapshot,
  type SellerDashboardSnapshot,
} from "./seller-dashboard";
import { getSellerViewInsightsForSellerId } from "./view-stats";

const PRODUCT_PAGE = 100;
const REQUEST_PAGE = 100;
const REVIEW_STATUS_PAGE = 100;
const REPORT_CHUNK = 100;
const AUDIT_CAP = 20;

export type AdminShopAccount = {
  userId: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: string;
  suspended: boolean;
  phone: string | null;
  isAdmin: boolean;
};

export type AdminShopListingExtras = {
  rejected: number;
  archived: number;
  unavailable: number;
  featured: number;
};

export type AdminShopConversion = {
  shopViews30d: number;
  newRequests30d: number;
  sold30d: number;
  soldPerRequestRate: number | null;
};

export type AdminShopReviewModeration = {
  pending: number;
  rejected: number;
};

export type AdminShopReportCounts = {
  open: number;
  resolved: number;
};

export type AdminShopDetail = {
  profile: SellerProfile;
  $createdAt: string | null;
  $updatedAt: string | null;
  account: AdminShopAccount;
  snapshot: SellerDashboardSnapshot;
  listingExtras: AdminShopListingExtras;
  conversion: AdminShopConversion;
  reviewModeration: AdminShopReviewModeration;
  reportCounts: AdminShopReportCounts;
  audit: AuditLogEntry[];
};

function adminSdkAvailable(): boolean {
  return hasDatabaseConfig();
}

function asNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return value.length > 0 ? value : null;
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

async function loadSellerProfileRow(
  profileId: string,
): Promise<{ profile: SellerProfile; row: Record<string, unknown> } | null> {
  const trimmed = profileId.trim();
  if (!trimmed) return null;

  const { tables } = await createAdminClient();
  try {
    const row = await tables.getRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_SELLER_PROFILES,
      rowId: trimmed,
    });
    const record = row as unknown as Record<string, unknown>;
    const profile = asSellerProfile(record);
    if (!profile) return null;
    return { profile, row: record };
  } catch {
    return null;
  }
}

async function loadAccount(
  userId: string,
): Promise<AdminShopAccount | null> {
  const { users, tables } = await createAdminClient();

  let name = "";
  let email = "";
  let emailVerified = false;
  let role = "buyer";
  let suspended = false;
  let isAdmin = false;

  try {
    const user = await users.get({ userId });
    name = typeof user.name === "string" ? user.name : "";
    email = typeof user.email === "string" ? user.email : "";
    emailVerified = user.emailVerification === true;
    const labels = Array.isArray(user.labels) ? user.labels : [];
    role = labels[0] ?? "buyer";
    suspended = user.status === false;
    isAdmin = labels.includes("admin");
  } catch {
    return null;
  }

  let phone: string | null = null;
  try {
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_PROFILES,
      queries: [Query.equal("userId", userId), Query.limit(1)],
    });
    const row = result.rows[0] as unknown as Record<string, unknown> | undefined;
    if (row) {
      phone = asNullableString(row.phone);
    }
  } catch {
    phone = null;
  }

  return {
    userId,
    name,
    email,
    emailVerified,
    role,
    suspended,
    phone,
    isAdmin,
  };
}

async function listProductsForSeller(sellerId: string): Promise<Product[]> {
  const { tables } = await createAdminClient();
  const out: Product[] = [];
  let cursor: string | undefined;

  for (;;) {
    const queries = [
      Query.equal("sellerId", sellerId),
      Query.orderDesc("$createdAt"),
      Query.limit(PRODUCT_PAGE),
    ];
    if (cursor) queries.push(Query.cursorAfter(cursor));

    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_PRODUCTS,
      queries,
    });
    if (result.rows.length === 0) break;

    for (const row of result.rows) {
      const product = asProduct(row as unknown as Record<string, unknown>);
      if (product && product.sellerId === sellerId) out.push(product);
    }

    if (result.rows.length < PRODUCT_PAGE) break;
    const lastId = asNullableString(
      (result.rows.at(-1) as unknown as Record<string, unknown> | undefined)
        ?.$id,
    );
    if (!lastId) break;
    cursor = lastId;
  }

  return out;
}

async function listRequestsForSeller(
  sellerId: string,
  opts?: { status?: PurchaseRequest["status"]; limit?: number },
): Promise<PurchaseRequest[]> {
  const { tables } = await createAdminClient();
  const limit = Math.min(Math.max(opts?.limit ?? REQUEST_PAGE, 1), REQUEST_PAGE);
  const queries = [
    Query.equal("sellerId", sellerId),
    Query.orderDesc("$createdAt"),
    Query.limit(limit),
  ];
  if (opts?.status) {
    queries.push(Query.equal("status", opts.status));
  }

  const result = await tables.listRows({
    databaseId: DATABASE_ID,
    tableId: TABLE_PURCHASE_REQUESTS,
    queries,
  });

  const out: PurchaseRequest[] = [];
  for (const row of result.rows) {
    const request = asPurchaseRequest(row as unknown as Record<string, unknown>);
    if (request && request.sellerId === sellerId) out.push(request);
  }
  return out;
}

async function countReviewsByStatus(
  sellerId: string,
  status: Review["status"],
): Promise<number> {
  const { tables } = await createAdminClient();
  let total = 0;
  let cursor: string | undefined;

  for (;;) {
    const queries = [
      Query.equal("sellerId", sellerId),
      Query.equal("status", status),
      Query.limit(REVIEW_STATUS_PAGE),
    ];
    if (cursor) queries.push(Query.cursorAfter(cursor));

    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_REVIEWS,
      queries,
    });
    if (result.rows.length === 0) break;

    for (const row of result.rows) {
      const review = asReview(row as unknown as Record<string, unknown>);
      if (review && review.sellerId === sellerId && review.status === status) {
        total += 1;
      }
    }

    if (result.rows.length < REVIEW_STATUS_PAGE) break;
    const lastId = asNullableString(
      (result.rows.at(-1) as unknown as Record<string, unknown> | undefined)
        ?.$id,
    );
    if (!lastId) break;
    cursor = lastId;
  }

  return total;
}

async function countReportsForProductIds(
  productIds: string[],
): Promise<AdminShopReportCounts> {
  const counts: AdminShopReportCounts = { open: 0, resolved: 0 };
  if (productIds.length === 0) return counts;

  const { tables } = await createAdminClient();
  const allowed = new Set(productIds);

  for (const batch of chunk(productIds, REPORT_CHUNK)) {
    let cursor: string | undefined;
    for (;;) {
      const queries = [
        Query.equal("productId", batch),
        Query.limit(REPORT_CHUNK),
      ];
      if (cursor) queries.push(Query.cursorAfter(cursor));

      const result = await tables.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLE_REPORTS,
        queries,
      });
      if (result.rows.length === 0) break;

      for (const row of result.rows) {
        const record = row as unknown as Record<string, unknown>;
        const productId = asNullableString(record.productId);
        const status = asNullableString(record.status);
        if (!productId || !allowed.has(productId) || !status) continue;
        if (status === "open" || status === "reviewing") {
          counts.open += 1;
        } else if (status === "resolved" || status === "dismissed") {
          counts.resolved += 1;
        }
      }

      if (result.rows.length < REPORT_CHUNK) break;
      const lastId = asNullableString(
        (result.rows.at(-1) as unknown as Record<string, unknown> | undefined)
          ?.$id,
      );
      if (!lastId) break;
      cursor = lastId;
    }
  }

  return counts;
}

function listingExtrasFromProducts(products: Product[]): AdminShopListingExtras {
  return {
    rejected: products.filter((p) => p.status === "rejected").length,
    archived: products.filter((p) => p.status === "archived").length,
    unavailable: products.filter((p) => !p.available).length,
    featured: products.filter((p) => p.featured).length,
  };
}

function conversionFromSnapshot(
  snapshot: SellerDashboardSnapshot,
): AdminShopConversion {
  const newRequests30d = snapshot.requestSeries.reduce(
    (sum, row) => sum + row.newRequests,
    0,
  );
  const sold30d = snapshot.requestSeries.reduce((sum, row) => sum + row.sold, 0);
  return {
    shopViews30d: snapshot.views.shopTotal,
    newRequests30d,
    sold30d,
    soldPerRequestRate:
      newRequests30d > 0
        ? Math.round((sold30d / newRequests30d) * 1000) / 10
        : null,
  };
}

/**
 * Admin-only shop detail for `/admin/sellers/[profileId]`.
 * Returns null when the profile id is missing or invalid.
 */
export async function getAdminShopDetail(
  profileId: string,
): Promise<AdminShopDetail | null> {
  await requireLabel("admin");

  const trimmed = profileId?.trim();
  if (!trimmed || !adminSdkAvailable()) return null;

  const loaded = await loadSellerProfileRow(trimmed);
  if (!loaded) return null;

  const { profile, row } = loaded;
  const sellerId = profile.userId;

  const [
    account,
    products,
    recentRequests,
    soldRequests,
    allRequests,
    views,
    approvedReviews,
    pendingReviews,
    rejectedReviews,
    statusCounts,
  ] = await Promise.all([
    loadAccount(sellerId),
    listProductsForSeller(sellerId),
    listRequestsForSeller(sellerId, { limit: 5 }),
    listRequestsForSeller(sellerId, { status: "sold", limit: 100 }),
    listRequestsForSeller(sellerId, { limit: 100 }),
    getSellerViewInsightsForSellerId(sellerId),
    listAllApprovedSellerReviews(sellerId),
    countReviewsByStatus(sellerId, "pending"),
    countReviewsByStatus(sellerId, "rejected"),
    countPurchaseRequestsByStatus({ sellerId }),
  ]);

  if (!account) return null;

  const reviewInsights: OwnSellerReviewInsights = {
    metrics: computeSellerReviewMetrics(approvedReviews),
    reviews: approvedReviews,
  };

  const snapshot = buildSellerDashboardSnapshot({
    metrics: {
      openCount: statusCounts.requested,
      soldCount: statusCounts.sold,
      cancelledCount: statusCounts.cancelled,
    },
    products,
    recentRequests,
    profile,
    views,
    soldRequests,
    allRequests,
    reviewInsights,
  });

  const [reportCounts, auditRaw] = await Promise.all([
    countReportsForProductIds(products.map((p) => p.$id)),
    getAuditLogsForResource("seller_profile", profile.$id),
  ]);

  const audit = auditRaw.slice(0, AUDIT_CAP).map((entry) => ({
    ...entry,
    // Avoid dumping opaque meta blobs on the admin shop page.
    meta: null,
  }));

  return {
    profile,
    $createdAt: asNullableString(row.$createdAt),
    $updatedAt: asNullableString(row.$updatedAt),
    account,
    snapshot,
    listingExtras: listingExtrasFromProducts(products),
    conversion: conversionFromSnapshot(snapshot),
    reviewModeration: {
      pending: pendingReviews,
      rejected: rejectedReviews,
    },
    reportCounts,
    audit,
  };
}
