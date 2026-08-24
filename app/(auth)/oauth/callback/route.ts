import { NextResponse } from "next/server";
import { SESSION_COOKIE, getAppUrl } from "@/lib/appwrite/config";
import { completeOAuthLogin } from "@/lib/appwrite/oauth";
import { sessionCookieOptions } from "@/lib/appwrite/session-cookie";

function redirectTo(path: string): NextResponse {
  return NextResponse.redirect(new URL(path, `${getAppUrl()}/`));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId") ?? "";
  const secret = url.searchParams.get("secret") ?? "";
  const next = url.searchParams.get("next");
  const intent = url.searchParams.get("intent");

  const result = await completeOAuthLogin({
    userId,
    secret,
    next,
    intent,
  });

  if (!result.ok) {
    return redirectTo(`${result.failPath}?error=${result.error}`);
  }

  const destination =
    result.destination.startsWith("/") && !result.destination.startsWith("//")
      ? result.destination
      : "/market";
  const response = redirectTo(destination);
  response.cookies.set(
    SESSION_COOKIE,
    result.sessionSecret,
    sessionCookieOptions(result.expire),
  );
  return response;
}
