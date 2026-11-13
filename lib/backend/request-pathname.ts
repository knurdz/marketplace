import { headers } from "next/headers";

function pathnameFromUrlHeader(raw: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const path = trimmed.startsWith("/")
      ? trimmed
      : new URL(trimmed).pathname;
    return path.split("?")[0]?.split("#")[0] ?? null;
  } catch {
    if (trimmed.startsWith("/")) {
      return trimmed.split("?")[0]?.split("#")[0] ?? null;
    }
    return null;
  }
}

/**
 * Current request pathname for server layouts (set by `proxy.ts` when the proxy runs).
 */
export async function getRequestPathname(): Promise<string> {
  const headerList = await headers();
  const candidates = [
    headerList.get("x-knurdz-pathname"),
    headerList.get("x-pathname"),
    pathnameFromUrlHeader(headerList.get("x-url")),
    pathnameFromUrlHeader(headerList.get("x-middleware-request-url")),
    pathnameFromUrlHeader(headerList.get("next-url")),
  ];
  for (const value of candidates) {
    const pathname = pathnameFromUrlHeader(value);
    if (pathname) {
      return pathname;
    }
  }
  return "";
}

export function pathIsSellerPendingRoute(pathname: string): boolean {
  return pathname === "/seller/pending";
}
