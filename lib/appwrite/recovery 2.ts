"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { AppwriteException } from "node-appwrite";
import {
  assertRateLimit,
  assertRateLimits,
  getClientIp,
  normalizeEmailKey,
  RATE_LIMIT_MESSAGE,
  RATE_LIMITS,
} from "@/lib/security/rate-limit";
import { getAppUrl } from "./config";
import { createPublicClient, createSessionClient } from "./server";
import { getLoggedInUser } from "./session";

export type RecoveryActionState = {
  error?: string;
  success?: string;
};

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function mapRecoveryError(error: unknown): string {
  if (error instanceof AppwriteException) {
    if (error.code === 400 || error.code === 401) {
      return "This reset link is invalid or has expired. Request a new one.";
    }
    return "Could not reset password. Please try again.";
  }
  if (error instanceof Error) {
    if (error.message.includes("NEXT_PUBLIC_APP_URL")) {
      return "App URL is not configured. Set NEXT_PUBLIC_APP_URL in .env.local.";
    }
    if (error.message.includes("NEXT_PUBLIC_APPWRITE")) {
      return "Appwrite is not configured. Check your environment variables.";
    }
  }
  return "Something went wrong. Please try again.";
}

const RECOVERY_SUCCESS =
  "If an account exists for that email, a reset link has been sent. Check your inbox.";

/**
 * Always returns a generic success message so we do not leak whether the email exists.
 * Rate-limited responses use the same success shape (anti-enumeration).
 */
export async function requestPasswordRecovery(
  _prev: RecoveryActionState,
  formData: FormData,
): Promise<RecoveryActionState> {
  const email = readString(formData, "email");
  if (!email) {
    return { error: "Email is required." };
  }

  const ip = await getClientIp();
  const emailKey = normalizeEmailKey(email);
  const recoveryLimit = assertRateLimits([
    {
      bucket: "auth.recovery",
      key: `email:${emailKey}`,
      ...RATE_LIMITS.recovery,
    },
    {
      bucket: "auth.recovery",
      key: `ip:${ip}`,
      ...RATE_LIMITS.recovery,
    },
  ]);
  if (!recoveryLimit.ok) {
    return { success: RECOVERY_SUCCESS };
  }

  try {
    const { account } = await createPublicClient();
    await account.createRecovery({
      email,
      url: `${getAppUrl()}/reset-password`,
    });
  } catch (error) {
    unstable_rethrow(error);
    if (
      error instanceof Error &&
      (error.message.includes("NEXT_PUBLIC_APP_URL") ||
        error.message.includes("NEXT_PUBLIC_APPWRITE"))
    ) {
      return { error: mapRecoveryError(error) };
    }
  }

  return { success: RECOVERY_SUCCESS };
}

export async function completePasswordRecovery(
  _prev: RecoveryActionState,
  formData: FormData,
): Promise<RecoveryActionState> {
  const userId = readString(formData, "userId");
  const secret = readString(formData, "secret");
  const password = readString(formData, "password");
  const confirm = readString(formData, "confirm");

  if (!userId || !secret) {
    return {
      error:
        "This reset link is missing required parameters. Request a new one.",
    };
  }
  if (!password || password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirm) {
    return { error: "Passwords do not match." };
  }

  const ip = await getClientIp();
  const completeLimit = assertRateLimit({
    bucket: "auth.recovery_complete",
    key: `ip:${ip}`,
    ...RATE_LIMITS.recoveryComplete,
  });
  if (!completeLimit.ok) {
    return { error: RATE_LIMIT_MESSAGE };
  }

  try {
    const { account } = await createPublicClient();
    await account.updateRecovery({
      userId,
      secret,
      password,
    });
  } catch (error) {
    unstable_rethrow(error);
    return { error: mapRecoveryError(error) };
  }

  redirect("/login");
}

export async function requestEmailVerification(
  prev: RecoveryActionState,
  formData: FormData,
): Promise<RecoveryActionState> {
  void prev;
  void formData;

  const user = await getLoggedInUser();
  if (!user) {
    return { error: "You must be signed in to verify your email." };
  }

  const verifyLimit = assertRateLimit({
    bucket: "auth.verify_resend",
    key: `user:${user.$id}`,
    ...RATE_LIMITS.verifyResend,
  });
  if (!verifyLimit.ok) {
    return { error: RATE_LIMIT_MESSAGE };
  }

  try {
    const { account } = await createSessionClient();
    await account.createVerification({
      url: `${getAppUrl()}/verify-email`,
    });
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof Error && error.message === "No session") {
      return { error: "You must be signed in to verify your email." };
    }
    return { error: mapRecoveryError(error) };
  }

  return {
    success: "Verification email sent. Check your inbox.",
  };
}

export async function completeEmailVerification(
  userId: string,
  secret: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!userId || !secret) {
    return {
      ok: false,
      error: "This verification link is missing required parameters.",
    };
  }

  const ip = await getClientIp();
  const verifyLimit = assertRateLimit({
    bucket: "auth.verify_complete",
    key: `ip:${ip}`,
    ...RATE_LIMITS.verifyComplete,
  });
  if (!verifyLimit.ok) {
    return { ok: false, error: RATE_LIMIT_MESSAGE };
  }

  try {
    const { account } = await createPublicClient();
    await account.updateVerification({ userId, secret });
    return { ok: true };
  } catch (error) {
    if (error instanceof AppwriteException) {
      return {
        ok: false,
        error: "This verification link is invalid or has expired.",
      };
    }
    return { ok: false, error: mapRecoveryError(error) };
  }
}
