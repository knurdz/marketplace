import { NextResponse } from "next/server";
import { completeOAuthLogin } from "@/lib/backend/oauth";
import { getAppUrl, getAuthAllowedHosts } from "@/lib/config/app";

function isAllowedHost(host: string): boolean {
  const normalized = host.trim().toLowerCase();
  if (!normalized || /[/\\@,\s]/.test(normalized)) return false;
  // Exact allowlist only; never trust arbitrary Host values.
  return getAuthAllowedHosts().some(
    (allowed) => allowed.toLowerCase() === normalized,
  );
}

function redirectTo(request: Request, path: string): NextResponse {
  const host =
    request.headers.get("x-forwarded-host") || request.headers.get("host");
  const validHost = host && isAllowedHost(host) ? host : null;
  if (validHost) {
    const isLocal =
      validHost.startsWith("localhost:") ||
      validHost.startsWith("127.0.0.1:");
    const proto = isLocal ? "http" : "https";
    return NextResponse.redirect(new URL(path, `${proto}://${validHost}`));
  }
  return NextResponse.redirect(new URL(path, getAppUrl()));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next");
  const intent = url.searchParams.get("intent");

  const result = await completeOAuthLogin({ next, intent });

  if (!result.ok) {
    if (result.failPath === "/account-suspended") {
      return redirectTo(request, result.failPath);
    }
    const query = result.error ? `?error=${result.error}` : "";
    return redirectTo(request, `${result.failPath}${query}`);
  }

  const destination =
    result.destination.startsWith("/") && !result.destination.startsWith("//")
      ? result.destination
      : "/";
  return redirectTo(request, destination);
}
