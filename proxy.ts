import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/appwrite/config";

/**
 * Cookie gate for role portals. Authoritative label checks live in
 * app/seller/layout.tsx and app/admin/layout.tsx.
 * Also forwards the pathname so storefront layouts can allow FAQ/legal.
 */
export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-knurdz-pathname", request.nextUrl.pathname);

  const { pathname } = request.nextUrl;
  const isPortal =
    pathname === "/seller" ||
    pathname.startsWith("/seller/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  if (isPortal) {
    const session = request.cookies.get(SESSION_COOKIE)?.value;
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
