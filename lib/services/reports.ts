import { AppwriteException, ID, Permission, Query, Role } from "node-appwrite";
import {
  DATABASE_ID,
  TABLE_REPORTS,
  hasAppwritePublicConfig,
} from "@/lib/appwrite/config";
import { createSessionClient } from "@/lib/appwrite/server";
import { getLoggedInUser } from "@/lib/appwrite/session";
import {
  assertRateLimit,
  getClientIp,
  RATE_LIMIT_MESSAGE,
  RATE_LIMITS,
} from "@/lib/security/rate-limit";
import type { Report } from "@/lib/types";
import { isReportStatus } from "@/lib/types";
import { getProduct } from "./products";
import {
  REPORT_ERROR_CODES,
  type ReportActionState,
  type ReportErrorCode,
} from "./report-errors";

export {
  REPORT_ERROR_CODES,
  type ReportActionState,
  type ReportErrorCode,
} from "./report-errors";

export type CreateProductReportInput = {
  productId: string;
  reason: string;
  details?: string | null;
};

function asNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return value.length > 0 ? value : null;
}

/** Map a TablesDB row to Report; returns null if required fields invalid. */
export function asReport(row: Record<string, unknown>): Report | null {
  const $id = asNullableString(row.$id);
  const reporterId = asNullableString(row.reporterId);
  const productId = asNullableString(row.productId);
  const reason = asNullableString(row.reason);
  const statusRaw = row.status;
  if (
    !$id ||
    !reporterId ||
    !productId ||
    !reason ||
    !isReportStatus(statusRaw)
  ) {
    return null;
  }

  const detailsRaw = row.details;
  const details =
    detailsRaw == null
      ? null
      : typeof detailsRaw === "string"
        ? detailsRaw.trim().slice(0, 2000) || null
        : null;

  return {
    $id,
    reporterId,
    productId,
    reason: reason.slice(0, 200),
    details,
    status: statusRaw,
  };
}

function reportRowPermissions(reporterId: string): string[] {
  return [
    Permission.read(Role.user(reporterId)),
    Permission.read(Role.label("admin")),
    Permission.update(Role.label("admin")),
    Permission.delete(Role.label("admin")),
  ];
}

async function assertReportMutationRateLimit(userId: string): Promise<void> {
  const ip = await getClientIp();
  const result = assertRateLimit({
    bucket: "reports",
    key: `${userId}:${ip}`,
    ...RATE_LIMITS.reports,
  });
  if (!result.ok) {
    const err = new Error(RATE_LIMIT_MESSAGE);
    (err as Error & { code: ReportErrorCode }).code =
      REPORT_ERROR_CODES.RATE_LIMITED;
    throw err;
  }
}

async function requireUser() {
  const user = await getLoggedInUser();
  if (!user) {
    const err = new Error("You must be signed in.");
    (err as Error & { code: ReportErrorCode }).code =
      REPORT_ERROR_CODES.NOT_AUTHENTICATED;
    throw err;
  }
  return user;
}

function notConfiguredState(): ReportActionState {
  return {
    error: "Reporting is not available right now.",
    errorCode: REPORT_ERROR_CODES.NOT_CONFIGURED,
  };
}

function mapReportError(err: unknown): ReportActionState {
  const code = (err as Error & { code?: ReportErrorCode }).code;
  if (code === REPORT_ERROR_CODES.NOT_AUTHENTICATED) {
    return {
      error: "Sign in to report a listing.",
      errorCode: code,
    };
  }
  if (code === REPORT_ERROR_CODES.RATE_LIMITED) {
    return {
      error: RATE_LIMIT_MESSAGE,
      errorCode: code,
    };
  }
  return {
    error: "Could not submit your report.",
    errorCode: REPORT_ERROR_CODES.NOT_ALLOWED,
  };
}

/** Create a report record for admin moderation (status forced to open). */
export async function createProductReport(
  input: CreateProductReportInput,
): Promise<ReportActionState> {
  if (!hasAppwritePublicConfig()) return notConfiguredState();

  try {
    const user = await requireUser();
    await assertReportMutationRateLimit(user.$id);

    const trimmedProductId = input.productId?.trim();
    if (!trimmedProductId) {
      return {
        error: "Product id is required.",
        errorCode: REPORT_ERROR_CODES.INVALID_INPUT,
      };
    }

    const reason = String(input.reason ?? "").trim().slice(0, 200);
    if (!reason) {
      return {
        error: "Please provide a reason for your report.",
        errorCode: REPORT_ERROR_CODES.INVALID_INPUT,
      };
    }

    const details =
      input.details == null
        ? null
        : String(input.details).trim().slice(0, 2000) || null;

    const product = await getProduct(trimmedProductId);
    if (!product) {
      return {
        error: "This product is not available.",
        errorCode: REPORT_ERROR_CODES.PRODUCT_UNAVAILABLE,
      };
    }

    const { tables } = await createSessionClient();
    const row = await tables.createRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_REPORTS,
      rowId: ID.unique(),
      data: {
        reporterId: user.$id,
        productId: trimmedProductId,
        reason,
        details,
        status: "open" as const,
      },
      permissions: reportRowPermissions(user.$id),
    });

    const created = asReport(row as unknown as Record<string, unknown>);
    if (!created || created.reporterId !== user.$id) {
      return {
        error: "Could not submit your report.",
        errorCode: REPORT_ERROR_CODES.NOT_ALLOWED,
      };
    }

    return {
      success: "Report submitted. Our team will review it.",
    };
  } catch (err) {
    if (err instanceof AppwriteException) {
      if (err.code === 401) {
        return {
          error: "Sign in to report a listing.",
          errorCode: REPORT_ERROR_CODES.NOT_AUTHENTICATED,
        };
      }
    }
    return mapReportError(err);
  }
}
