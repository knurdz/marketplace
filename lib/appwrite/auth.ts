"use server";

import { headers } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { AppwriteException } from "@/lib/db/appwrite-shim";
import { authUser } from "@/lib/db/schema";
import {
  getClientIp,
  normalizeEmailKey,
  RATE_LIMIT_MESSAGE,
  RATE_LIMITS,
} from "@/lib/security/rate-limit";
import { assertDurableRateLimit } from "@/lib/security/durable-rate-limit";
import {
  DATABASE_ID,
  TABLE_PROFILES,
  TABLE_SELLER_PROFILES,
} from "./config";
import { getRequestOrigin } from "./server-origin";
import { createProfileForUser } from "./profiles";
import { resolveHomePath, resolvePostLoginPath } from "./home-path";
import { ROLE_LABELS } from "./roles";
import { createAdminClient } from "./server";
import { getActiveUserById } from "./session";
import {
  createPendingSellerProfileForUser,
  parseSellerApplicationInput,
} from "@/lib/services/seller-application";
import { logError } from "@/lib/observability/log-error";
import { Query } from "@/lib/db/query";

async function rollbackSignup(userId: string) {
  try {
    const { tables, users } = await createAdminClient();
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
  }
  if (error instanceof Error) {
    if (error.message.toLowerCase().includes("already exists")) {
      return "An account with this email already exists.";
    }
    if (error.message.toLowerCase().includes("invalid")) {
      return "Invalid email or password.";
    }
    if (error.message.includes("DATABASE_URL")) {
      return "Server is not configured. Ask an admin to set DATABASE_URL.";
    }
  }
  return "Something went wrong. Please try again.";
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
  const registerLimit = await assertDurableRateLimit({
    bucket: "auth.register",
    key: `ip:${ip}`,
    ...RATE_LIMITS.register,
  });
  if (!registerLimit.ok) {
    return { error: RATE_LIMIT_MESSAGE };
  }

  let createdUserId: string | null = null;

  try {
    const hdrs = await headers();
    const result = await auth.api.signUpEmail({
      body: { email, password, name: name || email.split("@")[0] || "User" },
      headers: hdrs,
    });
    const userId = result.user.id;
    createdUserId = userId;

    const db = getDb();
    await db
      .update(authUser)
      .set({ role: ROLE_LABELS.buyer })
      .where(eq(authUser.id, userId));

    try {
      await createProfileForUser({
        userId,
        email,
        name: name || undefined,
        phone: phone || undefined,
      });
    } catch (profileError) {
      await rollbackSignup(userId);
      createdUserId = null;
      throw profileError;
    }

    if (accountType === "seller" && sellerInput?.ok) {
      const shop = await createPendingSellerProfileForUser(userId, {
        shopName: sellerInput.shopName,
        slug: sellerInput.slug,
        bio: sellerInput.bio ?? undefined,
      });
      if (!shop.ok) {
        await rollbackSignup(userId);
        createdUserId = null;
        return { error: shop.error };
      }
    }

    try {
      const origin = await getRequestOrigin();
      await auth.api.sendVerificationEmail({
        body: { email, callbackURL: `${origin}/verify-email` },
        headers: hdrs,
      });
    } catch (verifyError) {
      unstable_rethrow(verifyError);
      logError("auth.signup.verify", verifyError, { userId: createdUserId });
    }
  } catch (error) {
    unstable_rethrow(error);
    if (createdUserId) {
      await rollbackSignup(createdUserId);
    }
    return { error: mapAuthError(error) };
  }

  const sessionUser = createdUserId
    ? await getActiveUserById(createdUserId)
    : null;
  redirect(sessionUser ? await resolveHomePath(sessionUser) : "/login");
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
  const emailLimit = await assertDurableRateLimit({
    bucket: "auth.login",
    key: `email:${emailKey}`,
    ...RATE_LIMITS.login,
  });
  if (!emailLimit.ok) {
    return { error: RATE_LIMIT_MESSAGE };
  }
  const ipLimit = await assertDurableRateLimit({
    bucket: "auth.login",
    key: `ip:${ip}`,
    ...RATE_LIMITS.login,
  });
  if (!ipLimit.ok) {
    return { error: RATE_LIMIT_MESSAGE };
  }

  let destination = "/market";

  try {
    const hdrs = await headers();
    const result = await auth.api.signInEmail({
      body: { email, password },
      headers: hdrs,
    });
    // The new session cookie is not on this request yet, so use the returned user id.
    const signedIn = await getActiveUserById(result.user.id);
    if (!signedIn) {
      await revokeSessionsFor(result.user.id);
      return { error: "Invalid email or password." };
    }
    destination = await resolvePostLoginPath(signedIn, nextRaw);
  } catch (error) {
    unstable_rethrow(error);
    return { error: mapAuthError(error) };
  }

  redirect(destination);
}

/** Suspended accounts must not keep a session even though the password was correct. */
async function revokeSessionsFor(userId: string) {
  try {
    const { users } = await createAdminClient();
    await users.deleteSessions({ userId });
  } catch (error) {
    logError("auth.signin.revoke", error, { userId });
  }
}

export async function signOut() {
  try {
    await auth.api.signOut({ headers: await headers() });
  } catch (error) {
    unstable_rethrow(error);
  }

  redirect("/login");
}
