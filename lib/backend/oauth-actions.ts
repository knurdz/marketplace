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
  isOAuthProviderConfigured,
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
    redirect(
      oauthFailureUrl(from, guard.reason === "too_fast" ? "try_again" : "oauth", origin),
    );
  }
  const provider = parseOAuthProvider(readString(formData, "provider"));
  if (!provider) {
    redirect(failUrl);
    return;
  }
  if (!isOAuthProviderConfigured(provider)) {
    logError("auth.oauth.start", new Error("OAuth provider is not configured."), {
      provider,
    });
    redirect(oauthFailureUrl(from, "oauth_unavailable", origin));
  }

  const ip = await getClientIp();
  let limit: { ok: true } | { ok: false };
  try {
    limit = await assertRateLimits([
      {
        bucket: "auth.oauth",
        key: `ip:${ip}`,
        ...RATE_LIMITS.oauth,
      },
    ]);
  } catch (error) {
    logError("auth.oauth.start", error, { provider, stage: "rate-limit" });
    redirect(failUrl);
  }
  if (!limit.ok) {
    redirect(oauthFailureUrl(from, "rate_limited", origin));
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
      // No preset ?error= so Better Auth can append the real code.
      failure: `${origin}${from === "register" ? "/register" : "/login"}`,
    });
    redirect(redirectUrl);
  } catch (error) {
    unstable_rethrow(error);
    logError("auth.oauth.start", error, { provider });
    redirect(failUrl);
  }
}
