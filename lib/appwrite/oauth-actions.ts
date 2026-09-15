"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import {
  getClientIp,
  RATE_LIMITS,
} from "@/lib/security/rate-limit";
import { assertDurableRateLimit } from "@/lib/security/durable-rate-limit";
import { logError } from "@/lib/observability/log-error";
import { getRequestOrigin } from "./server-origin";
import {
  buildOAuthSuccessUrl,
  createOAuthRedirectUrl,
  oauthFailureUrl,
  parseOAuthProvider,
} from "./oauth";

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function oauthFrom(raw: string): "login" | "register" {
  return raw === "register" ? "register" : "login";
}

/**
 * Begin Google / Apple / Facebook OAuth (Appwrite createOAuth2Token).
 * Provider secrets stay in Appwrite Console — never in Next.js env.
 */
export async function startOAuth(formData: FormData): Promise<void> {
  const origin = await getRequestOrigin();
  const from = oauthFrom(readString(formData, "from"));
  const failUrl = oauthFailureUrl(from, "oauth", origin);
  const provider = parseOAuthProvider(readString(formData, "provider"));
  if (!provider) {
    redirect(failUrl);
    return;
  }

  const ip = await getClientIp();
  const limit = await assertDurableRateLimit({
    bucket: "auth.login",
    key: `oauth:${ip}`,
    ...RATE_LIMITS.login,
  });
  if (!limit.ok) {
    redirect(failUrl);
  }

  const intentRaw = readString(formData, "intent");
  const intent = intentRaw === "seller" ? "seller" : null;
  const next = readString(formData, "next") || null;

  try {
    const redirectUrl = await createOAuthRedirectUrl({
      provider,
      success: buildOAuthSuccessUrl({ next, intent, origin }),
      failure: failUrl,
    });
    redirect(redirectUrl);
  } catch (error) {
    unstable_rethrow(error);
    logError("auth.oauth.start", error, { provider });
    redirect(failUrl);
  }
}
