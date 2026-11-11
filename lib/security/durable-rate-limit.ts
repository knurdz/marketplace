import {
  assertRateLimit,
  type RateLimitResult,
} from "./rate-limit";

/** Backward-compatible name for the shared MariaDB-backed limiter. */
export async function assertDurableRateLimit(params: {
  bucket: string;
  key: string;
  limit: number;
  windowMs: number;
}): Promise<RateLimitResult> {
  return assertRateLimit(params);
}
