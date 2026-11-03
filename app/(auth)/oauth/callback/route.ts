import { NextResponse } from "next/server";
import { completeOAuthLogin } from "@/lib/appwrite/oauth";

function isAllowedHost(host: string): boolean {
  const lower = host.toLowerCase().split(":")[0] ?? "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (appUrl) {
    try {
      if (lower === new URL(appUrl).hostname) return true;
    } catch {
      /* skip */
    }
  }
  if (lower.endsWith(".vercel.app")) return true;
  if (lower === "localhost" || lower === "127.0.0.1") return true;
  return false;
}

function redirectTo(request: Request, path: string): NextResponse {
  const host =
    request.headers.get("x-forwarded-host") || request.headers.get("host");
  const validHost = host && isAllowedHost(host) ? host : null;
  if (validHost) {
    const proto =
      request.headers.get("x-forwarded-proto") ||
      (validHost.includes("localhost") || validHost.includes("127.0.0.1")
        ? "http"
        : "https");
    return NextResponse.redirect(new URL(path, `${proto}://${validHost}`));
  }
  return NextResponse.redirect(new URL(path, request.url));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next");
  const intent = url.searchParams.get("intent");

  const result = await completeOAuthLogin({ next, intent });

  if (!result.ok) {
    return redirectTo(request, `${result.failPath}?error=${result.error}`);
  }

  const destination =
    result.destination.startsWith("/") && !result.destination.startsWith("//")
      ? result.destination
      : "/market";
  return redirectTo(request, destination);
}
