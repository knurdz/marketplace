"use server";

import { headers } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";
import { AppwriteException } from "@/lib/db/appwrite-shim";
import { getAuth } from "@/lib/auth";

function authApi() {
  return getAuth().api;
}
import {
  getClientIp,
  normalizeEmailKey,
  RATE_LIMIT_MESSAGE,
  RATE_LIMITS,
} from "@/lib/security/rate-limit";
import { assertDurableRateLimit } from "@/lib/security/durable-rate-limit";
import { getRequestOrigin } from "./server-origin";
import { getLoggedInUser } from "./session";

export type RecoveryActionState = {
  error?: string;
  success?: string;
};

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function isSmtpOrMailSendError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes("smtp") ||
    message.includes("nodemailer") ||
    message.includes("econnrefused") ||
    message.includes("authentication failed") ||
    message.includes("invalid login") ||
    message.includes("envelope") ||
    // Generic "mail" only when paired with send/transport wording.
    (message.includes("mail") &&
      (message.includes("send") || message.includes("transport")))
  );
}

function mapRecoveryError(error: unknown): string {
  if (error instanceof AppwriteException) {
    return "This reset link is invalid or has expired. Request a new one.";
  }
  if (error instanceof Error) {
    if (error.message.includes("NEXT_PUBLIC_APP_URL")) {
      return "App URL is not configured. Set NEXT_PUBLIC_APP_URL in .env.local.";
    }
    if (isSmtpOrMailSendError(error)) {
      return "Could not send email. Ask an admin to check SMTP settings.";
    }
  }
  return "Something went wrong. Please try again.";
}

const RECOVERY_SUCCESS =
  "If an account exists for that email, a reset link has been sent. Check your inbox.";

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
  const emailLimit = await assertDurableRateLimit({
    bucket: "auth.recovery",
    key: `email:${emailKey}`,
    ...RATE_LIMITS.recovery,
  });
  if (!emailLimit.ok) {
    return { success: RECOVERY_SUCCESS };
  }
  const ipLimit = await assertDurableRateLimit({
    bucket: "auth.recovery",
    key: `ip:${ip}`,
    ...RATE_LIMITS.recovery,
  });
  if (!ipLimit.ok) {
    return { success: RECOVERY_SUCCESS };
  }

  try {
    const origin = await getRequestOrigin();
    await authApi().requestPasswordReset({
      body: {
        email,
        redirectTo: `${origin}/reset-password`,
      },
      headers: await headers(),
    });
  } catch (error) {
    unstable_rethrow(error);
    // Unknown emails are handled inside Better Auth without throwing.
    // SMTP / config failures should surface so the user can retry.
    if (
      (error instanceof Error &&
        error.message.includes("NEXT_PUBLIC_APP_URL")) ||
      isSmtpOrMailSendError(error)
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
  const token = readString(formData, "token") || readString(formData, "secret");
  const password = readString(formData, "password");
  const confirm = readString(formData, "confirm");

  if (!token) {
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
  const completeLimit = await assertDurableRateLimit({
    bucket: "auth.recovery_complete",
    key: `ip:${ip}`,
    ...RATE_LIMITS.recoveryComplete,
  });
  if (!completeLimit.ok) {
    return { error: RATE_LIMIT_MESSAGE };
  }

  try {
    await authApi().resetPassword({
      body: { newPassword: password, token },
      headers: await headers(),
    });
  } catch (error) {
    unstable_rethrow(error);
    return { error: mapRecoveryError(error) };
  }

  redirect("/login?reset=1");
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

  const verifyLimit = await assertDurableRateLimit({
    bucket: "auth.verify_resend",
    key: `user:${user.$id}`,
    ...RATE_LIMITS.verifyResend,
  });
  if (!verifyLimit.ok) {
    return { error: RATE_LIMIT_MESSAGE };
  }

  try {
    const origin = await getRequestOrigin();
    await authApi().sendVerificationEmail({
      body: {
        email: user.email,
        callbackURL: `${origin}/verify-email?verified=1`,
      },
      headers: await headers(),
    });
  } catch (error) {
    unstable_rethrow(error);
    return { error: mapRecoveryError(error) };
  }

  return {
    success: "Verification email sent. Check your inbox.",
  };
}

export async function completeEmailVerification(
  _userId: string,
  token: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!token) {
    return {
      ok: false,
      error: "This verification link is missing required parameters.",
    };
  }

  const ip = await getClientIp();
  const verifyLimit = await assertDurableRateLimit({
    bucket: "auth.verify_complete",
    key: `ip:${ip}`,
    ...RATE_LIMITS.verifyComplete,
  });
  if (!verifyLimit.ok) {
    return { ok: false, error: RATE_LIMIT_MESSAGE };
  }

  try {
    await authApi().verifyEmail({
      query: { token },
      headers: await headers(),
    });
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "This verification link is invalid or has expired.",
    };
  }
}
