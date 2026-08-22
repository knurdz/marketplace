"use server";

import { cookies } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";
import { AppwriteException, ID, Query } from "node-appwrite";
import {
  assertRateLimit,
  assertRateLimits,
  getClientIp,
  normalizeEmailKey,
  RATE_LIMIT_MESSAGE,
  RATE_LIMITS,
} from "@/lib/security/rate-limit";
import { DATABASE_ID, SESSION_COOKIE, TABLE_PROFILES, TABLE_SELLER_PROFILES, getAppUrl } from "./config";
import { createProfileForUser } from "./profiles";
import { resolveHomePath, resolvePostLoginPath } from "./home-path";
import { ROLE_LABELS } from "./roles";
import { createAdminClient, createSessionClient } from "./server";
import { getLoggedInUser } from "./session";
import {
  createPendingSellerProfileForUser,
  parseSellerApplicationInput,
} from "@/lib/services/seller-application";
import { logError } from "@/lib/observability/log-error";

async function rollbackSignup(userId: string) {
  try {
    const { users, tables } = await createAdminClient();
    try {
      const shops = await tables.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLE_SELLER_PROFILES,
        queries: [Query.equal("userId", userId), Query.limit(10)],
      });
      for (const row of shops.rows) {
        const rowId = typeof row.$id === "string" ? row.$id : "";
        if (!rowId) continue;
        try {
          await tables.deleteRow({
            databaseId: DATABASE_ID,
            tableId: TABLE_SELLER_PROFILES,
            rowId,
          });
        } catch {
          // Best-effort cleanup.
        }
      }
    } catch {
      // Shop row may not exist yet.
    }
    try {
      await tables.deleteRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_PROFILES,
        rowId: userId,
      });
    } catch {
      // Profile may not exist yet.
    }
    await users.delete({ userId });
  } catch {
    // Best-effort cleanup.
  }
}

export type AuthActionState = {
  error?: string;
};

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function mapAuthError(error: unknown): string {
  if (error instanceof AppwriteException) {
    if (error.code === 409) {
      return "An account with this email already exists.";
    }
    if (error.code === 401) {
      return "Invalid email or password.";
    }
    if (error.code === 400) {
      return "Check your email and password (password must be at least 8 characters).";
    }
    return "Authentication failed. Please try again.";
  }
  if (error instanceof Error) {
    if (error.message.includes("APPWRITE_API_KEY")) {
      return "Server auth is not configured. Ask an admin to set APPWRITE_API_KEY.";
    }
    if (error.message.includes("NEXT_PUBLIC_APPWRITE")) {
      return "Appwrite is not configured. Check your environment variables.";
    }
    const cause =
      error.cause instanceof Error
        ? error.cause.message
        : String(error.cause ?? "");
    if (
      error.message.includes("fetch failed") ||
      cause.includes("Connect Timeout") ||
      cause.includes("UND_ERR_CONNECT_TIMEOUT")
    ) {
      return "Could not reach Appwrite. Check your network and try again.";
    }
  }
  return "Something went wrong. Please try again.";
}

async function setSessionCookie(secret: string, expire: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, secret, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(expire),
  });
}

export async function signUpWithEmail(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readString(formData, "email");
  const password = readString(formData, "password");
  const name = readString(formData, "name");
  const phone = readString(formData, "phone");
  const accountType = readString(formData, "accountType");

  if (accountType !== "buyer" && accountType !== "seller") {
    return { error: "Choose Buyer or Seller." };
  }
  if (!email || !password) {
    return { error: "Email and password are required." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (phone.length > 32) {
    return { error: "Phone number is too long." };
  }

  const sellerInput =
    accountType === "seller"
      ? parseSellerApplicationInput({
          shopName: readString(formData, "shopName"),
          slug: readString(formData, "slug") || undefined,
          bio: readString(formData, "bio") || undefined,
        })
      : null;
  if (sellerInput && !sellerInput.ok) {
    return { error: sellerInput.error };
  }

  const ip = await getClientIp();
  const registerLimit = assertRateLimit({
    bucket: "auth.register",
    key: `ip:${ip}`,
    ...RATE_LIMITS.register,
  });
  if (!registerLimit.ok) {
    return { error: RATE_LIMIT_MESSAGE };
  }

  let createdUserId: string | null = null;

  try {
    const { account, users } = await createAdminClient();
    const user = await account.create({
      userId: ID.unique(),
      email,
      password,
      name: name || undefined,
    });
    createdUserId = user.$id;

    if (accountType === "buyer") {
      await users.updateLabels({
        userId: user.$id,
        labels: [ROLE_LABELS.buyer],
      });
    }

    try {
      await createProfileForUser({
        userId: user.$id,
        email,
        name: name || undefined,
        phone: phone || undefined,
      });
    } catch (profileError) {
      await rollbackSignup(user.$id);
      createdUserId = null;
      throw profileError;
    }

    if (accountType === "seller" && sellerInput?.ok) {
      const shop = await createPendingSellerProfileForUser(user.$id, {
        shopName: sellerInput.shopName,
        slug: sellerInput.slug,
        bio: sellerInput.bio ?? undefined,
      });
      if (!shop.ok) {
        await rollbackSignup(user.$id);
        createdUserId = null;
        return { error: shop.error };
      }
    }

    const session = await account.createEmailPasswordSession({
      email,
      password,
    });
    await setSessionCookie(session.secret, session.expire);

    try {
      const { account: sessionAccount } = await createSessionClient();
      await sessionAccount.createVerification({
        url: `${getAppUrl()}/verify-email`,
      });
    } catch (verifyError) {
      unstable_rethrow(verifyError);
      logError("auth.signup.verify", verifyError, { userId: user.$id });
    }
  } catch (error) {
    unstable_rethrow(error);
    if (createdUserId) {
      await rollbackSignup(createdUserId);
    }
    return { error: mapAuthError(error) };
  }

  const sessionUser = await getLoggedInUser();
  redirect(sessionUser ? await resolveHomePath(sessionUser) : "/market");
}

export async function signInWithEmail(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readString(formData, "email");
  const password = readString(formData, "password");
  const nextRaw = readString(formData, "next");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const ip = await getClientIp();
  const emailKey = normalizeEmailKey(email);
  const loginLimit = assertRateLimits([
    {
      bucket: "auth.login",
      key: `email:${emailKey}`,
      ...RATE_LIMITS.login,
    },
    {
      bucket: "auth.login",
      key: `ip:${ip}`,
      ...RATE_LIMITS.login,
    },
  ]);
  if (!loginLimit.ok) {
    return { error: RATE_LIMIT_MESSAGE };
  }

  let destination = "/market";

  try {
    const { account, users } = await createAdminClient();
    const session = await account.createEmailPasswordSession({
      email,
      password,
    });
    await setSessionCookie(session.secret, session.expire);
    try {
      const user = await users.get({ userId: session.userId });
      destination = await resolvePostLoginPath(user, nextRaw);
    } catch {
      const sessionUser = await getLoggedInUser();
      destination = sessionUser
        ? await resolvePostLoginPath(sessionUser, nextRaw)
        : "/market";
    }
  } catch (error) {
    unstable_rethrow(error);
    return { error: mapAuthError(error) };
  }

  redirect(destination);
}

export async function signOut() {
  try {
    const { account } = await createSessionClient();
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE);
    await account.deleteSession({ sessionId: "current" });
  } catch (error) {
    unstable_rethrow(error);
    // Always clear local session cookie even if Appwrite session delete fails
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE);
  }

  redirect("/login");
}
