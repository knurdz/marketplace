import { headers } from "next/headers";
import { getAppUrl } from "./config";

/**
 * Checks if a host is in the allowed domain list.
 * Accepts the production domain and Vercel preview domains.
 */
function isAllowedHost(host: string): boolean {
  const lower = host.toLowerCase().split(":")[0] ?? "";
  // Production domain
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (appUrl) {
    try {
      const configuredHost = new URL(appUrl).hostname;
      if (lower === configuredHost) return true;
    } catch {
      // Invalid URL in env — skip
    }
  }
  // Vercel preview deployments
  if (lower.endsWith(".vercel.app")) return true;
  // Local development
  if (lower === "localhost" || lower === "127.0.0.1") return true;
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
