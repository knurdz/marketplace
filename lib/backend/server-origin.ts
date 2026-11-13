import { headers } from "next/headers";
import { getAuthAllowedHosts, getAppUrl } from "@/lib/config/app";

/** Checks if a host is in the allowed domain list (local + production auth origins). */
function isAllowedHost(host: string): boolean {
  const raw = host.toLowerCase();
  const hostname = raw.split(":")[0] ?? "";
  const allowed = getAuthAllowedHosts().map((h) => h.toLowerCase());
  if (allowed.includes(raw) || allowed.includes(hostname)) return true;
  // Host-only patterns without port (e.g. marketplace.knurdz.org)
  if (
    allowed.some((entry) => {
      const entryHost = entry.split(":")[0] ?? "";
      return entryHost === hostname;
    })
  ) {
    return true;
  }
  // Local development
  if (hostname === "localhost" || hostname === "127.0.0.1") return true;
  return false;
}

/**
 * Resolves the public app origin from incoming request headers on the server,
 * falling back to getAppUrl() if headers are missing, not in a request context,
 * or the host is not in the allowlist.
 *
 * Validates `x-forwarded-host` against known domains to prevent Host Header Injection.
 */
export async function getRequestOrigin(): Promise<string> {
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") || h.get("host");
    if (host && isAllowedHost(host)) {
      const proto =
        h.get("x-forwarded-proto") ||
        (host.startsWith("localhost") || host.startsWith("127.0.0.1")
          ? "http"
          : "https");
      return `${proto}://${host}`.replace(/\/$/, "");
    }
  } catch {
    // Outside of request context (e.g. static builds, tests, or scripts)
  }
  return getAppUrl();
}
