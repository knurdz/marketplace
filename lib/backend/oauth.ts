import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { logError } from "@/lib/observability/log-error";
import { getAppUrl } from "./config";
import type { OAuthErrorCode } from "./oauth-errors";
import { type OAuthProviderId } from "./oauth-providers";
import { createProfileForUser, getOwnProfile } from "./profiles";
import { registrationCompletePath } from "./registration-complete";
import { postLoginPath, safeNextPath } from "./roles";
import { getLoggedInUser } from "./session";

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

const PROVIDER_AUTHORIZE_HOSTS: Record<OAuthProviderId, string> = {
  google: "accounts.google.com",
  github: "github.com",
};

function isProviderAuthorizationUrl(
  provider: OAuthProviderId,
  raw: string,
): boolean {
  try {
    const url = new URL(raw);
    return (
      url.protocol === "https:" &&
      url.hostname === PROVIDER_AUTHORIZE_HOSTS[provider]
    );
  } catch {
    return false;
  }
}

/**
 * Better Auth social sign-in is POST-only. A browser navigation to
 * `/api/auth/sign-in/social` is a 404 (Firefox shows its error page).
 * Call the API here, then send the browser to the provider.
 */
export async function createOAuthRedirectUrl(params: {
  provider: OAuthProviderId;
  success: string;
  failure: string;
}): Promise<string> {
  const result = await getAuth().api.signInSocial({
    body: {
      provider: params.provider,
      callbackURL: params.success,
      errorCallbackURL: params.failure,
      disableRedirect: true,
    },
    headers: await headers(),
  });
  const url = typeof result?.url === "string" ? result.url : "";
  if (!isProviderAuthorizationUrl(params.provider, url)) {
    throw new Error("OAuth provider did not return an authorization URL.");
  }
  return url;
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
      registrationComplete: false,
    });
  } catch (error) {
    // Existing profile (returning user) is expected; other failures are logged.
    logError("oauth.profile", error, { userId: user.$id });
  }

  const profile = await getOwnProfile();
  const next = params.next ?? undefined;
  const destination =
    profile?.registrationComplete === true
      ? postLoginPath(user, next)
      : registrationCompletePath(next);

  return {
    ok: true,
    sessionSecret: "",
    expire: new Date(Date.now() + 86_400_000).toISOString(),
    destination,
  };
}
