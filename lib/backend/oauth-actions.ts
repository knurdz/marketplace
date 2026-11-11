"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import {
  assertRateLimits,
  getClientIp,
  RATE_LIMITS,
} from "@/lib/security/rate-limit";
import { logError } from "@/lib/observability/log-error";
import {
  clearOAuthSellerIntentCookie,
  setOAuthSellerIntentCookie,
} from "./oauth-seller-intent";
import { getRequestOrigin } from "./server-origin";
import {
  buildOAuthSuccessUrl,
  createOAuthRedirectUrl,
  oauthFailureUrl,
  parseOAuthProvider,
} from "./oauth";
import { verifyFormGuard } from "@/lib/security/bot-guard";

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function oauthFrom(raw: string): "login" | "register" {
  return raw === "register" ? "register" : "login";
}

/**
 * Begin Google / GitHub OAuth via Better Auth social sign-in.
 * Provider secrets stay in server env: never in client code.
 */
export async function startOAuth(formData: FormData): Promise<void> {
  const origin = await getRequestOrigin();
  const from = oauthFrom(readString(formData, "from"));
  const failUrl = oauthFailureUrl(from, "oauth", origin);
  const guard = await verifyFormGuard(formData, "auth.oauth.start");
  if (!guard.ok) {
    redirect(failUrl);
  }
  const provider = parseOAuthProvider(readString(formData, "provider"));
  if (!provider) {
    redirect(failUrl);
    return;
  }

  const ip = await getClientIp();
  const limit = await assertRateLimits([
    {
      bucket: "auth.login",
      key: `ip:${ip}`,
      ...RATE_LIMITS.login,
    },
    {
      bucket: "auth.login",
      key: `oauth:${ip}`,
      ...RATE_LIMITS.login,
    },
  ]);
  if (!limit.ok) {
    redirect(failUrl);
  }

  const intentRaw = readString(formData, "intent");
  const intent = intentRaw === "seller" ? "seller" : null;
  const next = readString(formData, "next") || null;

  if (intent === "seller") {
    await setOAuthSellerIntentCookie();
  } else {
    await clearOAuthSellerIntentCookie();
  }

  try {
    const redirectUrl = await createOAuthRedirectUrl({
      provider,
      success: buildOAuthSuccessUrl({ next, intent, origin }),
      failure: failUrl,
      origin,
    });
    redirect(redirectUrl);
  } catch (error) {
    unstable_rethrow(error);
    logError("auth.oauth.start", error, { provider });
    redirect(failUrl);
  }
}
