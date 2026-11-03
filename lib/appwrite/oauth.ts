import { getAppUrl } from "./config";
import { createProfileForUser } from "./profiles";
import { postLoginPath, safeNextPath } from "./roles";
import { getLoggedInUser } from "./session";
import { logError } from "@/lib/observability/log-error";
import type { OAuthErrorCode } from "./oauth-errors";
import { type OAuthProviderId } from "./oauth-providers";

export type { OAuthProviderId } from "./oauth-providers";
export { parseOAuthProvider } from "./oauth-providers";

export type OAuthCompleteOk = {
  ok: true;
  sessionSecret: string;
  expire: string;
  destination: string;
};

export type OAuthCompleteFail = {
  ok: false;
  error: OAuthErrorCode;
  failPath: "/login" | "/register";
};

export type OAuthCompleteResult = OAuthCompleteOk | OAuthCompleteFail;

export function oauthFailPath(
  intent: string | null | undefined,
): "/login" | "/register" {
  return intent === "seller" ? "/register" : "/login";
}

export function oauthFailureUrl(
  from: "login" | "register",
  error: OAuthErrorCode = "oauth",
  origin?: string,
): string {
  const path = from === "register" ? "/register" : "/login";
  const base = (origin || getAppUrl()).replace(/\/$/, "");
  return `${base}${path}?error=${error}`;
}

export function buildOAuthSuccessUrl(params: {
  next?: string | null;
  intent?: string | null;
  origin?: string;
}): string {
  const base = (params.origin || getAppUrl()).replace(/\/$/, "");
  const success = new URL(`${base}/oauth/callback`);
  const next = safeNextPath(params.next ?? undefined);
  if (next) success.searchParams.set("next", next);
  if (params.intent === "seller") success.searchParams.set("intent", "seller");
  return success.toString();
}

/** Redirect to Better Auth social sign-in. */
export async function createOAuthRedirectUrl(params: {
  provider: OAuthProviderId;
  success: string;
  failure: string;
}): Promise<string> {
  const base = getAppUrl().replace(/\/$/, "");
  const callback = new URL(params.success);
  const url = new URL(`${base}/api/auth/sign-in/social`);
  url.searchParams.set("provider", params.provider);
  url.searchParams.set("callbackURL", callback.toString());
  url.searchParams.set("errorCallbackURL", params.failure);
  return url.toString();
}

/** After Better Auth OAuth, ensure profile exists and resolve destination. */
export async function completeOAuthLogin(params: {
  intent?: string | null;
  next?: string | null;
}): Promise<OAuthCompleteResult> {
  const user = await getLoggedInUser();
  if (!user) {
    return {
      ok: false,
      error: "oauth",
      failPath: oauthFailPath(params.intent),
    };
  }

  try {
    await createProfileForUser({
      userId: user.$id,
      email: user.email,
      name: user.name || undefined,
    });
  } catch (error) {
    logError("oauth.profile", error, { userId: user.$id });
  }

  const destination = postLoginPath(user, params.next ?? undefined);
  return {
    ok: true,
    sessionSecret: "",
    expire: new Date(Date.now() + 86_400_000).toISOString(),
    destination,
  };
}
