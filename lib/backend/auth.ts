"use server";

import { headers } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { DbException } from "@/lib/db/compat";
import { authUser } from "@/lib/db/schema";
import {
  getClientIp,
  normalizeEmailKey,
  RATE_LIMIT_MESSAGE,
  RATE_LIMITS,
  assertRateLimits,
} from "@/lib/security/rate-limit";
import { assertDurableRateLimit } from "@/lib/security/durable-rate-limit";
import { DATABASE_ID, TABLE_PROFILES, TABLE_SELLER_PROFILES } from "./config";
import { getRequestOrigin } from "./server-origin";
import { createProfileForUser } from "./profiles";
import { resolvePostLoginPath } from "./home-path";
import { ROLE_LABELS } from "./roles";
import { createAdminClient } from "./server";
import { getActiveUserById } from "./session";
import {
  createPendingSellerProfileForUser,
  parseSellerApplicationInput,
} from "@/lib/services/seller-application";
import { sellerApplicationFieldErrors } from "@/lib/backend/seller-field-errors";
import { logError } from "@/lib/observability/log-error";
import { Query } from "@/lib/db/query";
import { verifyFormGuard } from "@/lib/security/bot-guard";
import { isValidPhone } from "@/lib/security/contact";
import {
  isPasswordBreached,
  MAX_PASSWORD_LENGTH,
} from "@/lib/security/password";
import {
  recordTurnstileFailure,
  TURNSTILE_ACTIONS,
  verifyTurnstileIfRequired,
} from "@/lib/security/turnstile";

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

export type RegisterFormValues = {
  accountType: "buyer" | "seller";
  name: string;
  email: string;
  phone: string;
  shopName: string;
  slug: string;
  bio: string;
};

export type RegisterFieldKey =
  | "accountType"
  | "name"
  | "email"
  | "phone"
  | "shopName"
  | "slug"
  | "bio"
  | "password"
  | "confirm";

export type RegisterFieldErrors = Partial<Record<RegisterFieldKey, string>>;

export type AuthActionState = {
  error?: string;
  requireCaptcha?: boolean;
  fieldErrors?: RegisterFieldErrors;
  /** Echoed on validation / server errors so the register form can repopulate. */
  values?: RegisterFormValues;
};

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readRegisterFormValues(formData: FormData): RegisterFormValues {
  const accountTypeRaw = readString(formData, "accountType");
  return {
    accountType: accountTypeRaw === "seller" ? "seller" : "buyer",
    name: readString(formData, "name"),
    email: readString(formData, "email"),
    phone: readString(formData, "phone"),
    shopName: readString(formData, "shopName"),
    slug: readString(formData, "slug"),
    bio: readString(formData, "bio"),
  };
}

function registerFail(
  error: string,
  values: RegisterFormValues,
  options?: { requireCaptcha?: boolean; fieldErrors?: RegisterFieldErrors },
): AuthActionState {
  return {
    error,
    values,
    requireCaptcha: options?.requireCaptcha ?? false,
    fieldErrors: options?.fieldErrors,
  };
}

function mapAuthErrorToFields(message: string): RegisterFieldErrors | undefined {
  if (message.includes("already exists")) {
    return { email: message };
  }
  return undefined;
}

function mapAuthError(error: unknown): string {
  if (error instanceof DbException) {
    if (error.code === 409) {
      return "An account with this email already exists.";
    }
    if (error.code === 401) {
      return "Invalid email or password.";
    }
  }
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (
      message.includes("email not verified") ||
      message.includes("email_not_verified") ||
      message.includes("verify your email")
    ) {
      return "Verify your email before signing in. We sent another link to your inbox.";
    }
    if (message.includes("already exists")) {
      return "An account with this email already exists.";
    }
    if (message.includes("invalid")) {
      return "Invalid email or password.";
    }
  }
  return "Something went wrong. Please try again.";
}

export async function signUpWithEmail(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const values = readRegisterFormValues(formData);
  const guard = await verifyFormGuard(formData, "auth.register");
  if (!guard.ok) {
    return registerFail("Something went wrong. Please try again.", values);
  }
  const accountTypeRaw = readString(formData, "accountType");
  const { accountType, name, email, phone } = values;
  const password = readString(formData, "password");
  const confirm = readString(formData, "confirm");
  const turnstile = await verifyTurnstileIfRequired({
    formData,
    action: TURNSTILE_ACTIONS.register,
    email,
  });
  if (!turnstile.ok) {
    return registerFail(turnstile.error, values, { requireCaptcha: true });
  }
  const fail = (error: string, fieldErrors?: RegisterFieldErrors) =>
    registerFail(error, values, {
      requireCaptcha: turnstile.required,
      fieldErrors,
    });

  if (accountTypeRaw !== "buyer" && accountTypeRaw !== "seller") {
    return fail("Choose Buyer or Seller.", {
      accountType: "Choose Buyer or Seller.",
    });
  }
  if (!email) {
    return fail("Email is required.", { email: "Email is required." });
  }
  if (!password) {
    return fail("Password is required.", { password: "Password is required." });
  }
  if (password.length < 8) {
    return fail("Password must be at least 8 characters.", {
      password: "Password must be at least 8 characters.",
    });
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    const msg = `Password must be at most ${MAX_PASSWORD_LENGTH} characters.`;
    return fail(msg, { password: msg });
  }
  if (!confirm) {
    return fail("Please confirm your password.", {
      confirm: "Please confirm your password.",
    });
  }
  if (password !== confirm) {
    return fail("Passwords do not match.", {
      password: "Passwords do not match.",
      confirm: "Passwords do not match.",
    });
  }
  if (!phone) {
    return fail("Phone number is required.", {
      phone: "Phone number is required.",
    });
  }
  if (phone.length > 32) {
    return fail("Phone number is too long.", {
      phone: "Phone number is too long.",
    });
  }
  if (!isValidPhone(phone)) {
    const msg =
      "Enter a valid phone number (at least 8 digits; + and spaces allowed).";
    return fail(msg, { phone: msg });
  }

  const sellerInput =
    accountType === "seller"
      ? parseSellerApplicationInput({
          shopName: values.shopName,
          slug: values.slug || undefined,
          bio: values.bio || undefined,
        })
      : null;
  if (sellerInput && !sellerInput.ok) {
    return fail(sellerInput.error, sellerApplicationFieldErrors(sellerInput.error));
  }

  if (await isPasswordBreached(password)) {
    const msg =
      "This password appears in a known breach. Choose a different password.";
    return fail(msg, { password: msg });
  }

  const ip = await getClientIp();
  const registerChecks = [
    {
      bucket: "auth.register",
      key: `email:${normalizeEmailKey(email)}`,
      ...RATE_LIMITS.register,
    },
  ];
  // Local dev has no edge IP header, so every signup shared `ip:unknown`
  // and five attempts anywhere locked registration for the hour.
  if (ip !== "unknown" || process.env.NODE_ENV === "production") {
    registerChecks.unshift({
      bucket: "auth.register",
      key: `ip:${ip}`,
      ...RATE_LIMITS.register,
    });
  }
  const registerLimit = await assertRateLimits(registerChecks);
  if (!registerLimit.ok) {
    return fail(RATE_LIMIT_MESSAGE);
  }

  let createdUserId: string | null = null;

  try {
    const hdrs = await headers();
    const origin = await getRequestOrigin();
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: name || email.split("@")[0] || "User",
        callbackURL: `${origin}/verify-email?verified=1`,
      },
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
        registrationComplete: true,
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
        const requireCaptcha = await recordTurnstileFailure({
          action: TURNSTILE_ACTIONS.register,
          email,
        });
        return registerFail(shop.error, values, {
          requireCaptcha,
          fieldErrors: sellerApplicationFieldErrors(shop.error),
        });
      }
    }

    // Better Auth sends the verification email when requireEmailVerification /
    // emailVerification.sendOnSignUp is enabled (see lib/auth/index.ts).
  } catch (error) {
    unstable_rethrow(error);
    if (createdUserId) {
      await rollbackSignup(createdUserId);
    }
    const requireCaptcha = await recordTurnstileFailure({
      action: TURNSTILE_ACTIONS.register,
      email,
    });
    const authMessage = mapAuthError(error);
    return registerFail(authMessage, values, {
      requireCaptcha,
      fieldErrors: mapAuthErrorToFields(authMessage),
    });
  }

  redirect("/login?registered=1");
}

export async function signInWithEmail(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const guard = await verifyFormGuard(formData, "auth.login");
  if (!guard.ok) {
    return { error: "Invalid email or password." };
  }
  const email = readString(formData, "email");
  const password = readString(formData, "password");
  const nextRaw = readString(formData, "next");
  const turnstile = await verifyTurnstileIfRequired({
    formData,
    action: TURNSTILE_ACTIONS.login,
    email,
  });
  if (!turnstile.ok) {
    return { error: turnstile.error, requireCaptcha: true };
  }

  if (!email || !password) {
    return {
      error: "Email and password are required.",
      requireCaptcha: turnstile.required,
    };
  }

  const ip = await getClientIp();
  const emailKey = normalizeEmailKey(email);
  const emailLimit = await assertDurableRateLimit({
    bucket: "auth.login",
    key: `email:${emailKey}`,
    ...RATE_LIMITS.login,
  });
  if (!emailLimit.ok) {
    return { error: RATE_LIMIT_MESSAGE, requireCaptcha: turnstile.required };
  }
  const ipLimit = await assertDurableRateLimit({
    bucket: "auth.login",
    key: `ip:${ip}`,
    ...RATE_LIMITS.login,
  });
  if (!ipLimit.ok) {
    return { error: RATE_LIMIT_MESSAGE, requireCaptcha: turnstile.required };
  }

  let destination = "/";

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
      const requireCaptcha = await recordTurnstileFailure({
        action: TURNSTILE_ACTIONS.login,
        email,
      });
      return { error: "Invalid email or password.", requireCaptcha };
    }
    destination = await resolvePostLoginPath(signedIn, nextRaw);
  } catch (error) {
    unstable_rethrow(error);
    const requireCaptcha = await recordTurnstileFailure({
      action: TURNSTILE_ACTIONS.login,
      email,
    });
    return { error: mapAuthError(error), requireCaptcha };
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
