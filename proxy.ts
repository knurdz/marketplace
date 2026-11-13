import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/backend/config";

/** First hop of a proxy IP list. Rejects empty or non-IP values. */
function firstIp(value: string | null): string | null {
  const ip = value?.split(",")[0]?.trim() ?? "";
  if (!ip || ip.length > 64 || !/^[0-9A-Fa-f:.]+$/.test(ip)) return null;
  return ip;
}

/**
 * IP for rate limits. Prefer headers the reverse proxy overwrites (Hostinger
 * X-Real-IP) so a browser cannot spoof the bucket key.
 */
function resolveClientIp(request: NextRequest): string | null {
  return (
    firstIp(request.headers.get("x-real-ip")) ??
    firstIp(request.headers.get("x-forwarded-for"))
  );
}

/**
 * Cookie gate for role portals. Authoritative label checks live in
 * app/seller/layout.tsx and app/admin/layout.tsx.
 * Also forwards the pathname so storefront layouts can allow FAQ/legal,
 * and stamps a server-derived client IP for rate limits.
 */
export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-knurdz-pathname", request.nextUrl.pathname);
  requestHeaders.delete("x-knurdz-client-ip");
  const clientIp = resolveClientIp(request);
  if (clientIp) requestHeaders.set("x-knurdz-client-ip", clientIp);

  const { pathname } = request.nextUrl;
  const isPortal =
    pathname === "/seller" ||
    pathname.startsWith("/seller/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  if (isPortal) {
    // Better Auth adds the __Secure- prefix when served over HTTPS.
    const session =
      request.cookies.get(SESSION_COOKIE)?.value ??
      request.cookies.get(`__Secure-${SESSION_COOKIE}`)?.value;
    if (!session) {
      const login = new URL("/login", request.url);
      login.searchParams.set(
        "next",
        `${pathname}${request.nextUrl.search}`,
      );
      return NextResponse.redirect(login);
    }
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
