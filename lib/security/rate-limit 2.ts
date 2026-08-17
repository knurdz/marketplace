import { headers } from "next/headers";

/**
 * In-process sliding-window rate limiter for server actions.
 *
 * Suitable for single-instance `next start` / local MVP. Multi-instance
 * hosts need a shared store (Redis, etc.) — limits are per process only.
 */

export const RATE_LIMIT_MESSAGE =
  "Too many attempts. Please try again later." as const;

const MS_MINUTE = 60_000;
const MS_HOUR = 60 * MS_MINUTE;

/** Named presets — single source of truth for auth/upload abuse guards. */
export const RATE_LIMITS = {
  login: { limit: 5, windowMs: 15 * MS_MINUTE },
  register: { limit: 5, windowMs: MS_HOUR },
  recovery: { limit: 3, windowMs: MS_HOUR },
  verifyResend: { limit: 5, windowMs: MS_HOUR },
  recoveryComplete: { limit: 10, windowMs: 15 * MS_MINUTE },
  verifyComplete: { limit: 10, windowMs: 15 * MS_MINUTE },
  upload: { limit: 20, windowMs: MS_HOUR },
  cart: { limit: 60, windowMs: MS_MINUTE },
  wishlist: { limit: 60, windowMs: MS_MINUTE },
  reviews: { limit: 20, windowMs: MS_MINUTE },
  reports: { limit: 10, windowMs: MS_MINUTE },
  checkout: { limit: 10, windowMs: MS_MINUTE },
  listings: { limit: 20, windowMs: MS_HOUR },
  fulfillment: { limit: 30, windowMs: MS_MINUTE },
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

/**
 * Record a hit and return whether the request is allowed.
 * Counts the current attempt; if over `limit` within `windowMs`, blocks.
 */
export function assertRateLimit(params: {
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
export function assertRateLimits(
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
    const result = assertRateLimit(check);
    if (!result.ok) return result;
  }
  return { ok: true };
}

/** Read-only check — does not record a hit. */
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

/**
 * Client IP from proxy headers. First `x-forwarded-for` hop, then `x-real-ip`.
 * Falls back to `"unknown"` (still rate-limited as one shared bucket).
 */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  const realIp = h.get("x-real-ip")?.trim();
  if (realIp) return realIp.slice(0, 64);
  return "unknown";
}

export function normalizeEmailKey(email: string): string {
  return email.trim().toLowerCase().slice(0, 256);
}

/** Test helper — clears all buckets (dev/tests only). */
export function __resetRateLimitStoreForTests() {
  store.clear();
  lastPruneAt = 0;
}
