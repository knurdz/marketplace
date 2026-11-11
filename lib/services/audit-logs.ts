import { ID, Query } from "@/lib/db/compat";
import {
  DATABASE_ID,
  TABLE_AUDIT_LOGS,
  hasDatabaseConfig,
} from "@/lib/backend/config";
import { requireLabel } from "@/lib/backend/roles";
import { createAdminClient } from "@/lib/backend/server";
import { getClientIp } from "@/lib/security/rate-limit";
import type { AuditLogEntry } from "@/lib/types";

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;
const MAX_RESOURCE_HISTORY = 100;

export type WriteAuditLogParams = {
  actorId: string;
  event: string;
  resourceType: string;
  resourceId: string;
  meta?: Record<string, string>;
};

/**
 * Append one audit_logs row with client IP (server-only; admin SDK).
 * Used by admin mutation services so the audit page can show IP.
 */
async function resolveClientIp(): Promise<string> {
  try {
    return await getClientIp();
  } catch {
    return "unknown";
  }
}

export async function writeAuditLog(
  params: WriteAuditLogParams,
): Promise<void> {
  const ip = await resolveClientIp();
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
      meta: JSON.stringify(params.meta ?? {}).slice(0, 4000),
      ip: ip.slice(0, 64),
    },
    permissions: [],
  });
}

export type ListAuditLogsResult = {
  entries: AuditLogEntry[];
  nextCursor: string | null;
};

function asNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return value.length > 0 ? value : null;
}

function adminSdkAvailable(): boolean {
  return hasDatabaseConfig();
}

function clampLimit(raw?: number): number {
  return Math.min(Math.max(raw ?? DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);
}

/** Map a TablesDB row to AuditLogEntry; returns null if required fields missing. */
export function asAuditLogEntry(
  row: Record<string, unknown>,
): AuditLogEntry | null {
  const $id = asNullableString(row.$id);
  const event = asNullableString(row.event);
  const resourceType = asNullableString(row.resourceType);
  const $createdAt = asNullableString(row.$createdAt);
  if (!$id || !event || !resourceType || !$createdAt) {
    return null;
  }

  return {
    $id,
    actorId: asNullableString(row.actorId),
    event,
    resourceType,
    resourceId: asNullableString(row.resourceId),
    meta: asNullableString(row.meta),
    ip: asNullableString(row.ip),
    $createdAt,
  };
}

function buildListQueries(opts: {
  limit: number;
  cursor?: string;
  actorId?: string;
  event?: string;
  resourceType?: string;
  resourceId?: string;
}): string[] {
  const queries = [
    Query.orderDesc("$createdAt"),
    Query.limit(opts.limit),
  ];
  if (opts.actorId) {
    queries.push(Query.equal("actorId", opts.actorId));
  }
  if (opts.event) {
    queries.push(Query.equal("event", opts.event));
  }
  if (opts.resourceType) {
    queries.push(Query.equal("resourceType", opts.resourceType));
  }
  if (opts.resourceId) {
    queries.push(Query.equal("resourceId", opts.resourceId));
  }
  if (opts.cursor) {
    queries.push(Query.cursorAfter(opts.cursor));
  }
  return queries;
}

/**
 * Admin-scoped, paginated audit log list (server-only; admin SDK + label gate).
 * Reads use API-key client only: audit_logs has table permissions: none.
 */
export async function listAuditLogs(opts?: {
  actorId?: string;
  event?: string;
  resourceType?: string;
  resourceId?: string;
  limit?: number;
  cursor?: string;
}): Promise<ListAuditLogsResult> {
  await requireLabel("admin");

  if (!adminSdkAvailable()) {
    return { entries: [], nextCursor: null };
  }

  const limit = clampLimit(opts?.limit);
  const actorId = opts?.actorId?.trim() || undefined;
  const event = opts?.event?.trim() || undefined;
  const resourceType = opts?.resourceType?.trim() || undefined;
  const resourceId = opts?.resourceId?.trim() || undefined;
  const cursor = opts?.cursor?.trim() || undefined;

  try {
    const { tables } = await createAdminClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_AUDIT_LOGS,
      queries: buildListQueries({
        limit,
        cursor,
        actorId,
        event,
        resourceType,
        resourceId,
      }),
    });

    const entries: AuditLogEntry[] = [];
    for (const row of result.rows) {
      const entry = asAuditLogEntry(row as unknown as Record<string, unknown>);
      if (entry) entries.push(entry);
    }

    const last = entries.at(-1);
    const nextCursor =
      result.rows.length === limit && last ? last.$id : null;

    return { entries, nextCursor };
  } catch {
    return { entries: [], nextCursor: null };
  }
}

/**
 * Full history for a specific resource (admin SDK + label gate).
 * Capped at MAX_RESOURCE_HISTORY for future drill-in widgets.
 */
export async function getAuditLogsForResource(
  resourceType: string,
  resourceId: string,
): Promise<AuditLogEntry[]> {
  await requireLabel("admin");

  const type = resourceType.trim();
  const id = resourceId.trim();
  if (!type || !id || !adminSdkAvailable()) {
    return [];
  }

  try {
    const { tables } = await createAdminClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_AUDIT_LOGS,
      queries: [
        Query.equal("resourceType", type),
        Query.equal("resourceId", id),
        Query.orderDesc("$createdAt"),
        Query.limit(MAX_RESOURCE_HISTORY),
      ],
    });

    const entries: AuditLogEntry[] = [];
    for (const row of result.rows) {
      const entry = asAuditLogEntry(row as unknown as Record<string, unknown>);
      if (entry) entries.push(entry);
    }
    return entries;
  } catch {
    return [];
  }
}

/** Parse URL search param for audit log filters (non-empty string or undefined). */
export function parseAuditLogFilter(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
