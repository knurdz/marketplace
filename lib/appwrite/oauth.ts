import { AppwriteException, OAuthProvider, Query } from "node-appwrite";
import {
  DATABASE_ID,
  TABLE_PROFILES,
  TABLE_SELLER_PROFILES,
  getAppUrl,
} from "./config";
import { createProfileForUser } from "./profiles";
import { ROLE_LABELS, postLoginPath, safeNextPath } from "./roles";
import { createAdminClient } from "./server";
import { logError } from "@/lib/observability/log-error";
import type { OAuthErrorCode } from "./oauth-errors";
import {
  type OAuthProviderId,
} from "./oauth-providers";
import { isSellerStatus, type SellerStatus } from "@/lib/types/status";

export type { OAuthProviderId } from "./oauth-providers";
export { parseOAuthProvider } from "./oauth-providers";

const PROVIDER_ENUM: Record<OAuthProviderId, OAuthProvider> = {
  google: OAuthProvider.Google,
  apple: OAuthProvider.Apple,
  facebook: OAuthProvider.Facebook,
};

function isAppwriteUserId(value: string): boolean {
  return /^[a-zA-Z0-9._-]{1,36}$/.test(value);
}

function isOAuthTokenSecret(value: string): boolean {
  return value.length >= 8 && value.length <= 2048 && !/\s/.test(value);
}

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

export function oauthFailPath(intent: string | null | undefined): "/login" | "/register" {
  return intent === "seller" ? "/register" : "/login";
}

export function oauthFailureUrl(
  from: "login" | "register",
  error: OAuthErrorCode = "oauth",
): string {
  const path = from === "register" ? "/register" : "/login";
  return `${getAppUrl()}${path}?error=${error}`;
}

export function buildOAuthSuccessUrl(params: {
  next?: string | null;
  intent?: string | null;
}): string {
  const success = new URL(`${getAppUrl()}/oauth/callback`);
  const next = safeNextPath(params.next ?? undefined);
  if (next) success.searchParams.set("next", next);
  if (params.intent === "seller") success.searchParams.set("intent", "seller");
  return success.toString();
}

export async function createOAuthRedirectUrl(params: {
  provider: OAuthProviderId;
  success: string;
  failure: string;
}): Promise<string> {
  const { account } = await createAdminClient();
  return account.createOAuth2Token({
    provider: PROVIDER_ENUM[params.provider],
    success: params.success,
    failure: params.failure,
  });
}

async function profileRowExists(userId: string): Promise<boolean> {
  try {
    const { tables } = await createAdminClient();
    await tables.getRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PROFILES,
      rowId: userId,
    });
    return true;
  } catch (error) {
    if (error instanceof AppwriteException && error.code === 404) {
      return false;
    }
    throw error;
  }
}

async function getSellerStatusForUser(userId: string): Promise<SellerStatus | null> {
  const { tables } = await createAdminClient();
  const result = await tables.listRows({
    databaseId: DATABASE_ID,
    tableId: TABLE_SELLER_PROFILES,
    queries: [Query.equal("userId", userId), Query.limit(1)],
  });
  const status = result.rows[0]?.status;
  return isSellerStatus(status) ? status : null;
}

async function provisionOAuthUser(user: {
  $id: string;
  email?: string;
  name?: string;
  labels?: string[];
}): Promise<void> {
  const labels = Array.isArray(user.labels) ? user.labels : [];
  if (labels.length === 0) {
    const { users } = await createAdminClient();
    await users.updateLabels({
      userId: user.$id,
      labels: [ROLE_LABELS.buyer],
    });
  }

  const hasProfile = await profileRowExists(user.$id);
  if (hasProfile) return;

  try {
    await createProfileForUser({
      userId: user.$id,
      email: user.email ?? "",
      name: user.name || undefined,
    });
  } catch (error) {
    if (error instanceof AppwriteException && error.code === 409) {
      return;
    }
    throw error;
  }
}

/**
 * Exchange the OAuth token for an Appwrite session and provision profile/labels.
 * Does not set cookies — the route handler attaches Set-Cookie on the redirect.
 * Never logs `secret` / sessionSecret.
 */
export async function completeOAuthLogin(params: {
  userId: string;
  secret: string;
  next?: string | null;
  intent?: string | null;
}): Promise<OAuthCompleteResult> {
  const failPath = oauthFailPath(params.intent);
  const userId = params.userId.trim();
  const secret = params.secret.trim();

  if (!isAppwriteUserId(userId) || !isOAuthTokenSecret(secret)) {
    return { ok: false, error: "oauth", failPath };
  }

  try {
    const { account, users } = await createAdminClient();
    const session = await account.createSession({ userId, secret });
    const user = await users.get({ userId: session.userId });

    if (user.status === false) {
      try {
        await users.deleteSession({ userId: session.userId, sessionId: session.$id });
      } catch (deleteError) {
        logError("auth.oauth.disabled-session", deleteError, {
          userId: session.userId,
        });
      }
      return { ok: false, error: "oauth_disabled", failPath };
    }

    try {
      await provisionOAuthUser(user);
    } catch (provisionError) {
      logError("auth.oauth.provision", provisionError, { userId: user.$id });
    }

    const sellerStatus = await getSellerStatusForUser(user.$id);

    if (params.intent === "seller" && !sellerStatus) {
      return {
        ok: true,
        sessionSecret: session.secret,
        expire: session.expire,
        destination: "/register/shop",
      };
    }

    const destination = postLoginPath(user, params.next, sellerStatus);
    return {
      ok: true,
      sessionSecret: session.secret,
      expire: session.expire,
      destination,
    };
  } catch (error) {
    if (error instanceof AppwriteException && error.code === 409) {
      return { ok: false, error: "oauth_exists", failPath };
    }
    logError("auth.oauth.complete", error);
    return { ok: false, error: "oauth", failPath };
  }
}
