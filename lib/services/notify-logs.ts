import { AppwriteException, Query } from "node-appwrite";
import { hasAppwritePublicConfig } from "@/lib/appwrite/config";
import { requireLabel } from "@/lib/appwrite/roles";
import { createAdminClient } from "@/lib/appwrite/server";
import { FUNCTION_PAYHERE_NOTIFY } from "@/lib/types/payhere";
import {
  isNotifyLogIssue,
  parseNotifyLogText,
  redactNotifyLogText,
  type NotifyLogOutcome,
} from "./notify-log-redact";

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

export type NotifyLogSource =
  | "ready"
  | "empty"
  | "not_configured"
  | "not_deployed"
  | "unavailable";

export type NotifyLogView = "all" | "issues";

export type NotifyLogEntry = {
  $id: string;
  $createdAt: string;
  executionStatus: string;
  responseStatusCode: number;
  duration: number;
  trigger: string;
  requestMethod: string;
  outcome: NotifyLogOutcome;
  orderId: string | null;
  reason: string | null;
  statusCode: string | null;
  logs: string;
  errors: string;
  isIssue: boolean;
};

export type ListNotifyLogsResult = {
  source: NotifyLogSource;
  entries: NotifyLogEntry[];
  nextCursor: string | null;
};

function adminSdkAvailable(): boolean {
  return (
    hasAppwritePublicConfig() && Boolean(process.env.APPWRITE_API_KEY?.trim())
  );
}

function clampLimit(raw?: number): number {
  return Math.min(Math.max(raw ?? DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);
}

function appwriteCode(err: unknown): number | null {
  if (err instanceof AppwriteException) return err.code;
  return null;
}

function asNotifyLogEntry(execution: {
  $id: string;
  $createdAt: string;
  status: string;
  responseStatusCode: number;
  duration: number;
  trigger: string;
  requestMethod: string;
  logs: string;
  errors: string;
}): NotifyLogEntry {
  const logs = redactNotifyLogText(execution.logs ?? "");
  const errors = redactNotifyLogText(execution.errors ?? "");
  const parsed = parseNotifyLogText(`${logs}\n${errors}`);
  const isIssue = isNotifyLogIssue(
    parsed.outcome,
    execution.status,
    execution.responseStatusCode,
  );

  return {
    $id: execution.$id,
    $createdAt: execution.$createdAt,
    executionStatus: execution.status,
    responseStatusCode: execution.responseStatusCode,
    duration: execution.duration,
    trigger: execution.trigger,
    requestMethod: execution.requestMethod,
    outcome: parsed.outcome,
    orderId: parsed.orderId,
    reason: parsed.reason,
    statusCode: parsed.statusCode,
    logs,
    errors,
    isIssue,
  };
}

export function parseNotifyLogView(raw: unknown): NotifyLogView {
  return raw === "issues" ? "issues" : "all";
}

export function parseNotifyLogCursor(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Admin-only read of `payhere-notify` Function execution logs.
 * Member 1 step 1.26 has not persisted a dedicated table yet — this uses
 * Function stdout/stderr (order_id, status_code, ignore/reject reason).
 * Request bodies, headers, md5sig, merchant secret, and card fields are never returned.
 */
export async function listNotifyLogs(opts?: {
  view?: NotifyLogView;
  limit?: number;
  cursor?: string;
}): Promise<ListNotifyLogsResult> {
  await requireLabel("admin");

  if (!adminSdkAvailable()) {
    return { source: "not_configured", entries: [], nextCursor: null };
  }

  const limit = clampLimit(opts?.limit);
  const cursor = opts?.cursor?.trim() || undefined;
  const view: NotifyLogView = opts?.view === "issues" ? "issues" : "all";

  try {
    const { functions } = await createAdminClient();
    const queries = [Query.orderDesc("$createdAt"), Query.limit(limit)];
    if (cursor) {
      queries.push(Query.cursorAfter(cursor));
    }

    const result = await functions.listExecutions({
      functionId: FUNCTION_PAYHERE_NOTIFY,
      queries,
      total: false,
    });

    const mapped = result.executions.map((execution) =>
      asNotifyLogEntry(execution),
    );
    const entries = view === "issues" ? mapped.filter((row) => row.isIssue) : mapped;
    const last = mapped.at(-1);
    const nextCursor =
      result.executions.length === limit && last ? last.$id : null;

    return {
      source: mapped.length === 0 && !cursor ? "empty" : "ready",
      entries,
      nextCursor,
    };
  } catch (err) {
    const code = appwriteCode(err);
    if (code === 404) {
      return { source: "not_deployed", entries: [], nextCursor: null };
    }
    return { source: "unavailable", entries: [], nextCursor: null };
  }
}
