/**
 * TablesDB-backed fixed-window limiter for money paths.
 * Survives process restarts; falls back to in-memory if admin SDK is unavailable.
 */

import { AppwriteException, ID, Query } from "node-appwrite";
import {
  DATABASE_ID,
  TABLE_RATE_LIMITS,
  hasAppwritePublicConfig,
} from "@/lib/appwrite/config";
import { createAdminClient } from "@/lib/appwrite/server";
import { logError } from "@/lib/observability/log-error";
import {
  assertRateLimit,
  type RateLimitResult,
} from "./rate-limit";

function adminSdkAvailable(): boolean {
  return (
    hasAppwritePublicConfig() && Boolean(process.env.APPWRITE_API_KEY?.trim())
  );
}

function isConflict(error: unknown): boolean {
  if (error instanceof AppwriteException) {
    return error.code === 409 || String(error.type).includes("already_exists");
  }
  return false;
}

async function hitDurableWindow(params: {
  bucket: string;
  key: string;
  limit: number;
  windowMs: number;
}): Promise<RateLimitResult> {
  const { bucket, key, limit, windowMs } = params;
  const now = Date.now();
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const limitKey = key.slice(0, 256);
  const { tables } = await createAdminClient();

  const existing = await tables.listRows({
    databaseId: DATABASE_ID,
    tableId: TABLE_RATE_LIMITS,
    queries: [
      Query.equal("bucket", bucket),
      Query.equal("limitKey", limitKey),
      Query.limit(1),
    ],
  });

  const row = existing.rows[0] as
    | { $id: string; windowStart?: number; count?: number }
    | undefined;

  if (!row) {
    try {
      await tables.createRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_RATE_LIMITS,
        rowId: ID.unique(),
        data: {
          bucket,
          limitKey,
          windowStart,
          count: 1,
        },
        permissions: [],
      });
      return { ok: true };
    } catch (error) {
      if (!isConflict(error)) throw error;
    }
  }

  const fresh = row
    ? row
    : ((
        await tables.listRows({
          databaseId: DATABASE_ID,
          tableId: TABLE_RATE_LIMITS,
          queries: [
            Query.equal("bucket", bucket),
            Query.equal("limitKey", limitKey),
            Query.limit(1),
          ],
        })
      ).rows[0] as
        | { $id: string; windowStart?: number; count?: number }
        | undefined);

  if (!fresh) {
    return { ok: true };
  }

  const rowWindow = Number(fresh.windowStart) || 0;
  const rowCount = Math.max(0, Math.floor(Number(fresh.count) || 0));

  if (rowWindow !== windowStart) {
    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_RATE_LIMITS,
      rowId: fresh.$id,
      data: { windowStart, count: 1 },
    });
    return { ok: true };
  }

  if (rowCount >= limit) {
    const retryAfterSec = Math.max(
      1,
      Math.ceil((windowStart + windowMs - now) / 1000),
    );
    return { ok: false, retryAfterSec };
  }

  try {
    await tables.incrementRowColumn({
      databaseId: DATABASE_ID,
      tableId: TABLE_RATE_LIMITS,
      rowId: fresh.$id,
      column: "count",
      value: 1,
      max: limit,
    });
  } catch (error) {
    if (error instanceof AppwriteException) {
      const retryAfterSec = Math.max(
        1,
        Math.ceil((windowStart + windowMs - now) / 1000),
      );
      return { ok: false, retryAfterSec };
    }
    throw error;
  }
  return { ok: true };
}

/**
 * Record a hit against a durable (TablesDB) bucket. Falls back to in-memory
 * if the admin SDK or rate_limits table is unavailable.
 */
export async function assertDurableRateLimit(params: {
  bucket: string;
  key: string;
  limit: number;
  windowMs: number;
}): Promise<RateLimitResult> {
  if (!adminSdkAvailable()) {
    return assertRateLimit(params);
  }

  try {
    return await hitDurableWindow(params);
  } catch (error) {
    logError("rate-limit.durable", error, { bucket: params.bucket });
    return assertRateLimit(params);
  }
}
