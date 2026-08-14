import { ID, Query } from "node-appwrite";
import {
  DATABASE_ID,
  TABLE_AUDIT_LOGS,
  TABLE_PRODUCTS,
  TABLE_REPORTS,
  hasAppwritePublicConfig,
} from "@/lib/appwrite/config";
import { requireLabel } from "@/lib/appwrite/roles";
import { createAdminClient } from "@/lib/appwrite/server";
import type { Product, ProductStatus, Report, ReportStatus } from "@/lib/types";
import { isReportStatus } from "@/lib/types";
import { asProduct } from "./products";
import { asReport } from "./reports";

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
};

async function writeAuditLog(params: {
  actorId: string;
  event: string;
  resourceType: string;
  resourceId: string;
  meta: Record<string, string>;
}): Promise<void> {
  const { tables } = await createAdminClient();
  await tables.createRow({
    databaseId: DATABASE_ID,
    tableId: TABLE_AUDIT_LOGS,
    rowId: ID.unique(),
    data: {
      actorId: params.actorId,
      event: params.event.slice(0, 128),
      resourceType: params.resourceType.slice(0, 64),
      resourceId: params.resourceId,
      meta: JSON.stringify(params.meta).slice(0, 4000),
    },
    permissions: [],
  });
}

function adminSdkAvailable(): boolean {
  return (
    hasAppwritePublicConfig() && Boolean(process.env.APPWRITE_API_KEY?.trim())
  );
}

function asCreatedAt(row: Record<string, unknown>): string | null {
  const value = row.$createdAt;
  return typeof value === "string" && value.length > 0 ? value : null;
}

function toAdminView(
  report: Report,
  createdAt: string | null,
  product: Product | null,
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
  };
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
  await requireLabel("admin");

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

    return reports.map(({ report, $createdAt }) =>
      toAdminView(
        report,
        $createdAt,
        productById.get(report.productId) ?? null,
      ),
    );
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

  return { ok: true, message: "Report dismissed." };
}
