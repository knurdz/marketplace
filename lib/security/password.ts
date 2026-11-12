import { createHash } from "node:crypto";

export const MAX_PASSWORD_LENGTH = 128;

const HIBP_TIMEOUT_MS = 3_000;
const HIBP_RANGE_URL = "https://api.pwnedpasswords.com/range";

/** Reject only widely exposed passwords; rare HIBP hits are allowed. */
export const HIBP_MIN_BREACH_COUNT = 100;

/**
 * HIBP range check. Only the first five SHA-1 characters leave the server.
 * A match counts as breached when its exposure count is at least
 * {@link HIBP_MIN_BREACH_COUNT}. Availability failures intentionally fail open
 * so auth remains usable.
 */
export async function isPasswordBreached(password: string): Promise<boolean> {
  const hash = createHash("sha1")
    .update(password, "utf8")
    .digest("hex")
    .toUpperCase();
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);

  try {
    const response = await fetch(`${HIBP_RANGE_URL}/${prefix}`, {
      headers: {
        "Add-Padding": "true",
        "User-Agent": "Knurdz-Marketplace-Password-Check",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(HIBP_TIMEOUT_MS),
    });
    if (!response.ok) return false;

    const body = await response.text();
    return body.split(/\r?\n/).some((line) => {
      const separator = line.indexOf(":");
      if (separator <= 0 || line.slice(0, separator).toUpperCase() !== suffix) {
        return false;
      }
      const count = Number(line.slice(separator + 1));
      return (
        Number.isSafeInteger(count) && count >= HIBP_MIN_BREACH_COUNT
      );
    });
  } catch {
    return false;
  }
}
