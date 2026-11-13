import { Query } from "@/lib/db/compat";
import {
  DATABASE_ID,
  TABLE_PRODUCTS,
  TABLE_REPORTS,
  TABLE_SELLER_PROFILES,
  hasDatabaseConfig,
} from "@/lib/backend/config";
import { createAdminClient } from "@/lib/backend/server";
import { notifyUserEvent } from "@/lib/email/events";
import { assertAdminUser } from "@/lib/security/admin-auth";
import type { Product, ProductStatus, Report, ReportStatus } from "@/lib/types";
import {
  ACTIVE_PRODUCT_STATUS,
  ARCHIVED_PRODUCT_STATUS,
  isReportStatus,
} from "@/lib/types";
import { writeAuditLog } from "./audit-logs";
import { removeListingCore } from "./listing-moderation";
import { asProduct } from "./products";
import { asReport } from "./reports";
import { suspendUserCore } from "./user-management";

const OPEN_STATUS = "open" as const;
const REVIEWING_STATUS = "reviewing" as const;
const RESOLVED_STATUS = "resolved" as const;
const DISMISSED_STATUS = "dismissed" as const;
const MAX_NOTE_LENGTH = 500;
const DEFAULT_PAGE_SIZE = 24;
const MAX_PAGE_SIZE = 100;

export type ReportTriageResult =
  { ok: true; message: string } | { ok: false; error: string };

export type AdminReportView = {
  $id: string;
  reporterId: string;
  productId: string;
  reason: string;
  details: string | null;
  status: ReportStatus;
  $createdAt: string | null;
  productTitle: string | null;
  productStatus: ProductStatus | null;
  sellerId: string | null;
  shopName: string | null;
};

function adminSdkAvailable(): boolean {
  return hasDatabaseConfig();
}

function asCreatedAt(row: Record<string, unknown>): string | null {
  const value = row.$createdAt;
  return typeof value === "string" && value.length > 0 ? value : null;
}

function toAdminView(
  report: Report,
  createdAt: string | null,
  product: Product | null,
  shopName: string | null,
): AdminReportView {
  return {
    $id: report.$id,
    reporterId: report.reporterId,
    productId: report.productId,
    reason: report.reason,
    details: report.details,
    status: report.status,
    $createdAt: createdAt,
    productTitle: product?.title ?? null,
    productStatus: product?.status ?? null,
    sellerId: product?.sellerId ?? null,
    shopName,
  };
}

function asNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return value.length > 0 ? value : null;
}

async function loadShopNameBySellerId(
  sellerId: string,
): Promise<string | null> {
  const trimmed = sellerId?.trim();
  if (!trimmed) return null;

  const { tables } = await createAdminClient();
  try {
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_SELLER_PROFILES,
      queries: [Query.equal("userId", trimmed), Query.limit(1)],
    });
    const row = result.rows[0] as unknown as
      Record<string, unknown> | undefined;
    if (!row) return null;
    return asNullableString(row.shopName);
  } catch {
    return null;
  }
}

async function loadSellerProfileByUserId(sellerId: string): Promise<{
  $id: string;
  status: string;
  shopName: string | null;
} | null> {
  const trimmed = sellerId?.trim();
  if (!trimmed) return null;

  const { tables } = await createAdminClient();
  try {
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_SELLER_PROFILES,
      queries: [Query.equal("userId", trimmed), Query.limit(1)],
    });
    const row = result.rows[0] as unknown as
      Record<string, unknown> | undefined;
    if (!row) return null;
    const $id = asNullableString(row.$id);
    const status = asNullableString(row.status);
    if (!$id || !status) return null;
    return {
      $id,
      status,
      shopName: asNullableString(row.shopName),
    };
  } catch {
    return null;
  }
}

async function listActiveProductIdsForSeller(
  sellerId: string,
): Promise<string[]> {
  const trimmed = sellerId?.trim();
  if (!trimmed) return [];

  const { tables } = await createAdminClient();
  const ids: string[] = [];
  let cursor: string | undefined;

  for (;;) {
    const queries = [
      Query.equal("sellerId", trimmed),
      Query.equal("status", ACTIVE_PRODUCT_STATUS),
      Query.limit(100),
    ];
    if (cursor) queries.push(Query.cursorAfter(cursor));

    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_PRODUCTS,
      queries,
      total: false,
    });

    if (result.rows.length === 0) break;

    for (const row of result.rows) {
      const id = asNullableString(
        (row as unknown as Record<string, unknown>).$id,
      );
      if (id) ids.push(id);
    }

    if (result.rows.length < 100) break;
    const lastId = asNullableString(
      (
        result.rows[result.rows.length - 1] as unknown as Record<
          string,
          unknown
        >
      ).$id,
    );
    if (!lastId) break;
    cursor = lastId;
  }

  return ids;
}

async function loadReport(reportId: string): Promise<{
  report: Report;
  $createdAt: string | null;
} | null> {
  const trimmed = reportId?.trim();
  if (!trimmed) return null;

  const { tables } = await createAdminClient();
  try {
    const row = await tables.getRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_REPORTS,
      rowId: trimmed,
    });
    const record = row as unknown as Record<string, unknown>;
    const report = asReport(record);
    if (!report) return null;
    return { report, $createdAt: asCreatedAt(record) };
  } catch {
    return null;
  }
}

async function loadProduct(productId: string): Promise<Product | null> {
  const trimmed = productId?.trim();
  if (!trimmed) return null;

  const { tables } = await createAdminClient();
  try {
    const row = await tables.getRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PRODUCTS,
      rowId: trimmed,
    });
    return asProduct(row as unknown as Record<string, unknown>);
  } catch {
    return null;
  }
}

function parseNote(note: string): string | ReportTriageResult {
  const trimmed = note.trim();
  if (!trimmed) {
    return { ok: false, error: "Note is required." };
  }
  if (trimmed.length > MAX_NOTE_LENGTH) {
    return {
      ok: false,
      error: `Note must be at most ${MAX_NOTE_LENGTH} characters.`,
    };
  }
  return trimmed;
}

function auditMeta(
  report: Report,
  extra?: Record<string, string>,
): Record<string, string> {
  return {
    productId: report.productId,
    reporterId: report.reporterId,
    priorStatus: report.status,
    reason: report.reason.slice(0, 200),
    ...extra,
  };
}

/** Parse URL search param into ReportStatus; invalid values default to open. */
export function parseReportStatusFilter(raw: unknown): ReportStatus {
  return isReportStatus(raw) ? raw : OPEN_STATUS;
}

/**
 * Admin-scoped report list by status (server-only; admin SDK).
 * Paginated via limit + optional cursor ($id of last row).
 */
export async function listReports(opts?: {
  status?: ReportStatus;
  limit?: number;
  cursor?: string;
}): Promise<AdminReportView[]> {
  await assertAdminUser();

  if (!adminSdkAvailable()) return [];

  const status = opts?.status ?? OPEN_STATUS;
  const limit = Math.min(
    Math.max(opts?.limit ?? DEFAULT_PAGE_SIZE, 1),
    MAX_PAGE_SIZE,
  );
  const cursor = opts?.cursor?.trim() || undefined;

  const queries = [
    Query.equal("status", status),
    Query.orderDesc("$createdAt"),
    Query.limit(limit),
  ];
  if (cursor) {
    queries.push(Query.cursorAfter(cursor));
  }

  try {
    const { tables } = await createAdminClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_REPORTS,
      queries,
    });

    const reports: { report: Report; $createdAt: string | null }[] = [];
    for (const row of result.rows) {
      const record = row as unknown as Record<string, unknown>;
      const report = asReport(record);
      if (report) {
        reports.push({ report, $createdAt: asCreatedAt(record) });
      }
    }

    const productIds = [
      ...new Set(reports.map((item) => item.report.productId)),
    ];
    const productEntries = await Promise.all(
      productIds.map(async (id) => {
        const product = await loadProduct(id);
        return [id, product] as const;
      }),
    );
    const productById = new Map(productEntries);

    const sellerIds = [
      ...new Set(
        [...productById.values()]
          .map((product) => product?.sellerId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    const shopEntries = await Promise.all(
      sellerIds.map(async (id) => {
        const shopName = await loadShopNameBySellerId(id);
        return [id, shopName] as const;
      }),
    );
    const shopBySellerId = new Map(shopEntries);

    return reports.map(({ report, $createdAt }) => {
      const product = productById.get(report.productId) ?? null;
      const shopName = product?.sellerId
        ? (shopBySellerId.get(product.sellerId) ?? null)
        : null;
      return toAdminView(report, $createdAt, product, shopName);
    });
  } catch {
    return [];
  }
}

/**
 * open → reviewing.
 * Idempotent: already-reviewing is a safe no-op (no audit).
 */
export async function startReviewCore(
  adminUserId: string,
  reportId: string,
): Promise<ReportTriageResult> {
  await assertAdminUser(adminUserId);
  const loaded = await loadReport(reportId);
  if (!loaded) {
    return { ok: false, error: "Report not found." };
  }

  const { report } = loaded;

  if (report.status === REVIEWING_STATUS) {
    return { ok: true, message: "Report is already in review." };
  }

  if (report.status !== OPEN_STATUS) {
    return {
      ok: false,
      error: `Report is ${report.status}. Only open reports can start review.`,
    };
  }

  const { tables } = await createAdminClient();
  try {
    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_REPORTS,
      rowId: report.$id,
      data: { status: REVIEWING_STATUS },
    });
  } catch {
    return { ok: false, error: "Failed to start review." };
  }

  try {
    await writeAuditLog({
      actorId: adminUserId,
      event: "report.reviewing",
      resourceType: "report",
      resourceId: report.$id,
      meta: auditMeta(report),
    });
  } catch {
    return {
      ok: false,
      error:
        "Report moved to reviewing but audit log failed. Please notify an operator.",
    };
  }

  return { ok: true, message: "Report moved to reviewing." };
}

/**
 * open | reviewing → resolved.
 * Note stored in audit_logs.meta only (no reports.note column).
 * Idempotent: already-resolved is a safe no-op (no audit).
 */
export async function resolveReportCore(
  adminUserId: string,
  reportId: string,
  note: string,
): Promise<ReportTriageResult> {
  await assertAdminUser(adminUserId);
  const parsedNote = parseNote(note);
  if (typeof parsedNote !== "string") return parsedNote;

  const loaded = await loadReport(reportId);
  if (!loaded) {
    return { ok: false, error: "Report not found." };
  }

  const { report } = loaded;

  if (report.status === RESOLVED_STATUS) {
    return { ok: true, message: "Report is already resolved." };
  }

  if (report.status !== OPEN_STATUS && report.status !== REVIEWING_STATUS) {
    return {
      ok: false,
      error: `Report is ${report.status}. Only open or reviewing reports can be resolved.`,
    };
  }

  const { tables } = await createAdminClient();
  try {
    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_REPORTS,
      rowId: report.$id,
      data: { status: RESOLVED_STATUS },
    });
  } catch {
    return { ok: false, error: "Failed to resolve report." };
  }

  try {
    await writeAuditLog({
      actorId: adminUserId,
      event: "report.resolved",
      resourceType: "report",
      resourceId: report.$id,
      meta: auditMeta(report, { note: parsedNote }),
    });
  } catch {
    return {
      ok: false,
      error: "Report resolved but audit log failed. Please notify an operator.",
    };
  }

  await notifyUserEvent(report.reporterId, {
    type: "report.resolved",
    title: "Report resolved",
    body: "An admin resolved the listing report you submitted. Thank you for helping keep the marketplace safe.",
    link: `/products/${report.productId}`,
  });

  return { ok: true, message: "Report resolved." };
}

/**
 * open | reviewing → dismissed.
 * Note stored in audit_logs.meta only (no reports.note column).
 * Idempotent: already-dismissed is a safe no-op (no audit).
 */
export async function dismissReportCore(
  adminUserId: string,
  reportId: string,
  note: string,
): Promise<ReportTriageResult> {
  await assertAdminUser(adminUserId);
  const parsedNote = parseNote(note);
  if (typeof parsedNote !== "string") return parsedNote;

  const loaded = await loadReport(reportId);
  if (!loaded) {
    return { ok: false, error: "Report not found." };
  }

  const { report } = loaded;

  if (report.status === DISMISSED_STATUS) {
    return { ok: true, message: "Report is already dismissed." };
  }

  if (report.status !== OPEN_STATUS && report.status !== REVIEWING_STATUS) {
    return {
      ok: false,
      error: `Report is ${report.status}. Only open or reviewing reports can be dismissed.`,
    };
  }

  const { tables } = await createAdminClient();
  try {
    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_REPORTS,
      rowId: report.$id,
      data: { status: DISMISSED_STATUS },
    });
  } catch {
    return { ok: false, error: "Failed to dismiss report." };
  }

  try {
    await writeAuditLog({
      actorId: adminUserId,
      event: "report.dismissed",
      resourceType: "report",
      resourceId: report.$id,
      meta: auditMeta(report, { note: parsedNote }),
    });
  } catch {
    return {
      ok: false,
      error:
        "Report dismissed but audit log failed. Please notify an operator.",
    };
  }

  await notifyUserEvent(report.reporterId, {
    type: "report.dismissed",
    title: "Report dismissed",
    body: "An admin reviewed the listing report you submitted and dismissed it.",
    link: `/products/${report.productId}`,
  });

  return { ok: true, message: "Report dismissed." };
}

/**
 * Archive the reported listing (active → archived), then resolve the report.
 * Already-archived listings continue to resolve. Non-active, non-archived fail.
 */
export async function takeDownListingFromReportCore(
  adminUserId: string,
  reportId: string,
  note: string,
): Promise<ReportTriageResult> {
  await assertAdminUser(adminUserId);
  const parsedNote = parseNote(note);
  if (typeof parsedNote !== "string") return parsedNote;

  const loaded = await loadReport(reportId);
  if (!loaded) {
    return { ok: false, error: "Report not found." };
  }

  const { report } = loaded;
  if (report.status !== OPEN_STATUS && report.status !== REVIEWING_STATUS) {
    return {
      ok: false,
      error: `Report is ${report.status}. Only open or reviewing reports can be actioned.`,
    };
  }

  const product = await loadProduct(report.productId);
  if (!product) {
    return { ok: false, error: "Reported listing was not found." };
  }

  if (
    product.status !== ACTIVE_PRODUCT_STATUS &&
    product.status !== ARCHIVED_PRODUCT_STATUS
  ) {
    return {
      ok: false,
      error: `Listing is ${product.status}. Only active listings can be taken down.`,
    };
  }

  if (product.status === ACTIVE_PRODUCT_STATUS) {
    const removed = await removeListingCore(
      adminUserId,
      product.$id,
      parsedNote,
    );
    if (!removed.ok) return removed;
  }

  return resolveReportCore(adminUserId, report.$id, parsedNote);
}

/**
 * Ban the reported listing's seller: suspend account, archive active listings,
 * mark approved seller profile as banned, then resolve the report.
 */
export async function banShopFromReportCore(
  adminUserId: string,
  reportId: string,
  note: string,
): Promise<ReportTriageResult> {
  await assertAdminUser(adminUserId);
  const parsedNote = parseNote(note);
  if (typeof parsedNote !== "string") return parsedNote;

  const loaded = await loadReport(reportId);
  if (!loaded) {
    return { ok: false, error: "Report not found." };
  }

  const { report } = loaded;
  if (report.status !== OPEN_STATUS && report.status !== REVIEWING_STATUS) {
    return {
      ok: false,
      error: `Report is ${report.status}. Only open or reviewing reports can be actioned.`,
    };
  }

  const product = await loadProduct(report.productId);
  if (!product?.sellerId) {
    return { ok: false, error: "Reported listing or seller was not found." };
  }

  const sellerId = product.sellerId;
  if (sellerId === adminUserId) {
    return { ok: false, error: "You cannot ban your own shop." };
  }

  const suspended = await suspendUserCore(adminUserId, sellerId, parsedNote);
  if (!suspended.ok) return suspended;

  let archivedCount = 0;
  try {
    const activeIds = await listActiveProductIdsForSeller(sellerId);
    const { tables } = await createAdminClient();
    for (const productId of activeIds) {
      await tables.updateRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_PRODUCTS,
        rowId: productId,
        data: {
          status: ARCHIVED_PRODUCT_STATUS,
          featured: false,
          hiddenByShopBan: true,
        },
      });
      archivedCount += 1;
    }
  } catch {
    return {
      ok: false,
      error:
        "Seller suspended but listing archive failed. Contact an operator.",
    };
  }

  const profile = await loadSellerProfileByUserId(sellerId);
  if (profile?.status === "approved") {
    const { tables } = await createAdminClient();
    try {
      await tables.updateRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_SELLER_PROFILES,
        rowId: profile.$id,
        data: {
          status: "banned",
          rejectionReason: parsedNote.slice(0, 500),
        },
      });
    } catch {
      return {
        ok: false,
        error:
          "Seller suspended and listings archived, but shop profile could not be marked banned. Contact an operator.",
      };
    }
  }

  try {
    await writeAuditLog({
      actorId: adminUserId,
      event: "shop.banned",
      resourceType: "seller_profile",
      resourceId: profile?.$id ?? sellerId,
      meta: {
        sellerId,
        shopName: profile?.shopName ?? "",
        reportId: report.$id,
        productId: report.productId,
        archivedCount: String(archivedCount),
        note: parsedNote,
      },
    });
  } catch {
    return {
      ok: false,
      error: "Shop banned but audit log failed. Please notify an operator.",
    };
  }

  return resolveReportCore(adminUserId, report.$id, parsedNote);
}
