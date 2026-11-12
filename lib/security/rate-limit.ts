import { headers } from "next/headers";
import { and, eq, lt } from "drizzle-orm";
import { getDb, hasDatabaseConfig, newId } from "@/lib/db/client";
import { isDuplicateKeyError } from "@/lib/db/errors";
import { rateLimits } from "@/lib/db/schema";

/** MariaDB-backed rate limiter with a development-only memory fallback. */

export const RATE_LIMIT_MESSAGE =
  "Too many attempts. Please try again later." as const;

const MS_MINUTE = 60_000;
const MS_HOUR = 60 * MS_MINUTE;

/** Named presets: single source of truth for auth/upload abuse guards. */
export const RATE_LIMITS = {
  login: { limit: 5, windowMs: 15 * MS_MINUTE },
  // Own bucket: OAuth must not spend the password-login IP allowance.
  oauth: { limit: 10, windowMs: 15 * MS_MINUTE },
  register: { limit: 5, windowMs: MS_HOUR },
  recovery: { limit: 3, windowMs: MS_HOUR },
  verifyResend: { limit: 5, windowMs: MS_HOUR },
  recoveryComplete: { limit: 10, windowMs: 15 * MS_MINUTE },
  verifyComplete: { limit: 10, windowMs: 15 * MS_MINUTE },
  upload: { limit: 20, windowMs: MS_HOUR },
  wishlist: { limit: 60, windowMs: MS_MINUTE },
  reviews: { limit: 20, windowMs: MS_MINUTE },
  reports: { limit: 10, windowMs: MS_MINUTE },
  purchaseRequests: { limit: 20, windowMs: MS_MINUTE },
  purchaseRequestsDaily: { limit: 50, windowMs: 24 * MS_HOUR },
  listings: { limit: 20, windowMs: MS_HOUR },
  accountMutations: { limit: 30, windowMs: MS_HOUR },
  adminMutations: { limit: 120, windowMs: MS_HOUR },
  publicReads: { limit: 120, windowMs: MS_MINUTE },
  eventEmail: { limit: 20, windowMs: MS_HOUR },
  views: { limit: 1, windowMs: 24 * MS_HOUR },
} as const;

type BucketHits = number[];

const store = new Map<string, BucketHits>();

let lastPruneAt = 0;
const PRUNE_INTERVAL_MS = 60_000;
/** Drop keys whose newest hit is older than this (safety for idle keys). */
const MAX_IDLE_MS = 2 * MS_HOUR;

function pruneIfNeeded(now: number) {
  if (now - lastPruneAt < PRUNE_INTERVAL_MS) return;
  lastPruneAt = now;
  for (const [key, hits] of store) {
    const newest = hits[hits.length - 1] ?? 0;
    if (hits.length === 0 || now - newest > MAX_IDLE_MS) {
      store.delete(key);
    }
  }
}

export type RateLimitOk = { ok: true };
export type RateLimitBlocked = { ok: false; retryAfterSec: number };
export type RateLimitResult = RateLimitOk | RateLimitBlocked;
export type RateLimitBucket = {
  bucket: string;
  key: string;
  windowMs: number;
};

/**
 * Record a hit and return whether the request is allowed.
 * Counts the current attempt; if over `limit` within `windowMs`, blocks.
 */
function assertMemoryRateLimit(params: {
  bucket: string;
  key: string;
  limit: number;
  windowMs: number;
}): RateLimitResult {
  const { bucket, key, limit, windowMs } = params;
  const now = Date.now();
  pruneIfNeeded(now);

  const storeKey = `${bucket}:${key}`;
  const windowStart = now - windowMs;
  const prev = store.get(storeKey) ?? [];
  const recent = prev.filter((t) => t > windowStart);

  if (recent.length >= limit) {
    const oldestInWindow = recent[0] ?? now;
    const retryAfterSec = Math.max(
      1,
      Math.ceil((oldestInWindow + windowMs - now) / 1000),
    );
    store.set(storeKey, recent);
    return { ok: false, retryAfterSec };
  }

  recent.push(now);
  store.set(storeKey, recent);
  return { ok: true };
}

/**
 * Apply several keys; any key already at limit fails the whole check.
 * Only records hits when every key is under limit (avoids burning sibling quotas on a blocked request).
 */
function assertMemoryRateLimits(
  checks: Array<{
    bucket: string;
    key: string;
    limit: number;
    windowMs: number;
  }>,
): RateLimitResult {
  let worst: RateLimitBlocked | null = null;
  for (const check of checks) {
    const peek = peekRateLimit(check);
    if (!peek.ok) {
      if (!worst || peek.retryAfterSec > worst.retryAfterSec) {
        worst = peek;
      }
    }
  }
  if (worst) return worst;
  for (const check of checks) {
    const result = assertMemoryRateLimit(check);
    if (!result.ok) return result;
  }
  return { ok: true };
}

let lastDurablePruneAt = 0;
const DURABLE_PRUNE_INTERVAL_MS = 5 * MS_MINUTE;
const DURABLE_RETENTION_MS = 48 * MS_HOUR;
const RATE_LIMIT_TX_ISOLATION = {
  isolationLevel: "read committed" as const,
};
const LOCK_RETRY_MAX = 3;
const PRUNE_BATCH_LIMIT = 200;

type RateLimitTx = Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0];

type LockedRateLimitRow = {
  id: string;
  count: number;
  windowStart: number;
};

function isRetryableLockError(error: unknown): boolean {
  let current: unknown = error;
  for (let depth = 0; depth < 4 && current; depth++) {
    if (typeof current === "object") {
      const record = current as { code?: unknown; errno?: unknown };
      if (record.code === "ER_LOCK_DEADLOCK" || record.errno === 1213) {
        return true;
      }
      if (record.code === "ER_LOCK_WAIT_TIMEOUT" || record.errno === 1205) {
        return true;
      }
    }
    current = (current as { cause?: unknown }).cause;
  }
  return false;
}

function lockRetryJitterMs(): number {
  return 5 + Math.floor(Math.random() * 20);
}

async function withLockRetry<T>(run: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < LOCK_RETRY_MAX; attempt++) {
    try {
      return await run();
    } catch (error) {
      lastError = error;
      if (!isRetryableLockError(error) || attempt === LOCK_RETRY_MAX - 1) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, lockRetryJitterMs()));
    }
  }
  throw lastError;
}

async function selectRateLimitRowForUpdate(
  tx: RateLimitTx,
  bucket: string,
  limitKey: string,
): Promise<LockedRateLimitRow | null> {
  const [row] = await tx
    .select({
      id: rateLimits.id,
      count: rateLimits.count,
      windowStart: rateLimits.windowStart,
    })
    .from(rateLimits)
    .where(and(eq(rateLimits.bucket, bucket), eq(rateLimits.limitKey, limitKey)))
    .limit(1)
    .for("update");
  return row ?? null;
}

async function lockRateLimitRowForUpdate(
  tx: RateLimitTx,
  bucket: string,
  key: string,
  now: number,
): Promise<LockedRateLimitRow> {
  const limitKey = key.slice(0, 256);
  let row = await selectRateLimitRowForUpdate(tx, bucket, limitKey);
  if (row) return row;

  try {
    await tx.insert(rateLimits).values({
      id: newId(),
      bucket,
      limitKey,
      windowStart: now,
      count: 0,
    });
  } catch (error) {
    if (!isDuplicateKeyError(error)) throw error;
  }

  row = await selectRateLimitRowForUpdate(tx, bucket, limitKey);
  if (!row) throw new Error("Could not lock rate-limit row.");
  return row;
}

/**
 * Apply one rate-limit hit using MariaDB row locks. The unique bucket/key row
 * and deterministic lock order make checks atomic across Vercel instances.
 */
export async function assertRateLimit(params: {
  bucket: string;
  key: string;
  limit: number;
  windowMs: number;
}): Promise<RateLimitResult> {
  return assertRateLimits([params]);
}

export async function assertRateLimits(
  checks: Array<{
    bucket: string;
    key: string;
    limit: number;
    windowMs: number;
  }>,
): Promise<RateLimitResult> {
  if (!hasDatabaseConfig()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("DATABASE_URL is required for production rate limiting.");
    }
    return assertMemoryRateLimits(checks);
  }

  const ordered = [...checks].sort((a, b) =>
    `${a.bucket}:${a.key}`.localeCompare(`${b.bucket}:${b.key}`),
  );
  const now = Date.now();
  const result = await withLockRetry(() =>
    getDb().transaction(async (tx) => {
      const states: Array<{
        check: (typeof ordered)[number];
        id: string;
        count: number;
        windowStart: number;
      }> = [];

      for (const check of ordered) {
        const row = await lockRateLimitRowForUpdate(
          tx,
          check.bucket,
          check.key,
          now,
        );
        const activeWindow = now - row.windowStart < check.windowMs;
        const count = activeWindow ? row.count : 0;
        const windowStart = activeWindow ? row.windowStart : now;
        if (count >= check.limit) {
          return {
            ok: false as const,
            retryAfterSec: Math.max(
              1,
              Math.ceil((windowStart + check.windowMs - now) / 1000),
            ),
          };
        }
        states.push({ check, id: row.id, count, windowStart });
      }

      for (const state of states) {
        await tx
          .update(rateLimits)
          .set({
            count: state.count + 1,
            windowStart: state.windowStart,
          })
          .where(eq(rateLimits.id, state.id));
      }
      return { ok: true as const };
    }, RATE_LIMIT_TX_ISOLATION),
  );

  if (now - lastDurablePruneAt >= DURABLE_PRUNE_INTERVAL_MS) {
    lastDurablePruneAt = now;
    try {
      await getDb()
        .delete(rateLimits)
        .where(lt(rateLimits.updatedAt, new Date(now - DURABLE_RETENTION_MS)))
        .limit(PRUNE_BATCH_LIMIT);
    } catch {
      // Pruning is best effort; enforcement has already completed atomically.
    }
  }
  return result;
}

export async function assertAdminMutationRateLimit(
  userId: string,
): Promise<RateLimitResult> {
  return assertRateLimit({
    bucket: "admin.mutations",
    key: `user:${userId}`,
    ...RATE_LIMITS.adminMutations,
  });
}

/** Read-only check: does not record a hit. */
function peekRateLimit(params: {
  bucket: string;
  key: string;
  limit: number;
  windowMs: number;
}): RateLimitResult {
  const { bucket, key, limit, windowMs } = params;
  const now = Date.now();
  pruneIfNeeded(now);
  const storeKey = `${bucket}:${key}`;
  const windowStart = now - windowMs;
  const recent = (store.get(storeKey) ?? []).filter((t) => t > windowStart);
  if (recent.length >= limit) {
    const oldestInWindow = recent[0] ?? now;
    const retryAfterSec = Math.max(
      1,
      Math.ceil((oldestInWindow + windowMs - now) / 1000),
    );
    return { ok: false, retryAfterSec };
  }
  return { ok: true };
}

/** Read the active hit count without consuming quota. */
export async function getRateLimitCount(
  params: RateLimitBucket,
): Promise<number> {
  const key = params.key.slice(0, 256);
  const now = Date.now();
  if (!hasDatabaseConfig()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("DATABASE_URL is required for production rate limiting.");
    }
    pruneIfNeeded(now);
    return (store.get(`${params.bucket}:${key}`) ?? []).filter(
      (hit) => hit > now - params.windowMs,
    ).length;
  }

  const [row] = await getDb()
    .select({
      count: rateLimits.count,
      windowStart: rateLimits.windowStart,
    })
    .from(rateLimits)
    .where(
      and(eq(rateLimits.bucket, params.bucket), eq(rateLimits.limitKey, key)),
    )
    .limit(1);
  if (!row || now - row.windowStart >= params.windowMs) return 0;
  return row.count;
}

/**
 * Record failure-only hits. MariaDB row locks keep a group of bucket updates
 * atomic across server instances.
 */
export async function recordRateLimitHits(
  hits: RateLimitBucket[],
): Promise<void> {
  const unique = new Map<string, RateLimitBucket>();
  for (const hit of hits) {
    const key = hit.key.slice(0, 256);
    unique.set(`${hit.bucket}:${key}`, { ...hit, key });
  }
  const ordered = [...unique.values()].sort((a, b) =>
    `${a.bucket}:${a.key}`.localeCompare(`${b.bucket}:${b.key}`),
  );
  if (ordered.length === 0) return;

  const now = Date.now();
  if (!hasDatabaseConfig()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("DATABASE_URL is required for production rate limiting.");
    }
    pruneIfNeeded(now);
    for (const hit of ordered) {
      const storeKey = `${hit.bucket}:${hit.key}`;
      const recent = (store.get(storeKey) ?? []).filter(
        (timestamp) => timestamp > now - hit.windowMs,
      );
      recent.push(now);
      store.set(storeKey, recent);
    }
    return;
  }

  await withLockRetry(() =>
    getDb().transaction(async (tx) => {
      for (const hit of ordered) {
        const row = await lockRateLimitRowForUpdate(
          tx,
          hit.bucket,
          hit.key,
          now,
        );

        const activeWindow = now - row.windowStart < hit.windowMs;
        await tx
          .update(rateLimits)
          .set({
            count: (activeWindow ? row.count : 0) + 1,
            windowStart: activeWindow ? row.windowStart : now,
          })
          .where(eq(rateLimits.id, row.id));
      }
    }, RATE_LIMIT_TX_ISOLATION),
  );
}

function isIpToken(value: string): boolean {
  return value.length > 0 && value.length <= 64 && /^[0-9A-Fa-f:.]+$/.test(value);
}

/**
 * Client IP set by proxy.ts from edge headers (Vercel, X-Real-IP, X-Forwarded-For).
 * Falls back to `"unknown"` when none of those headers are present.
 */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const trusted = h.get("x-knurdz-client-ip")?.trim() ?? "";
  if (isIpToken(trusted)) return trusted;
  const vercel = h.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ?? "";
  if (isIpToken(vercel)) return vercel;
  return "unknown";
}

export function normalizeEmailKey(email: string): string {
  return email.trim().toLowerCase().slice(0, 256);
}

/** Test helper: clears all buckets (dev/tests only). */
export function __resetRateLimitStoreForTests() {
  store.clear();
  lastPruneAt = 0;
}
