"use server";

import { headers } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";
import { DbException } from "@/lib/db/compat";
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
import { verifyFormGuard } from "@/lib/security/bot-guard";
import {
  recordTurnstileFailure,
  TURNSTILE_ACTIONS,
  verifyTurnstileIfRequired,
} from "@/lib/security/turnstile";
import {
  isPasswordBreached,
  MAX_PASSWORD_LENGTH,
} from "@/lib/security/password";
import { maskEmailAddress } from "@/lib/email/smtp";
import { logInfo } from "@/lib/observability/log-error";

export type RecoveryActionState = {
  error?: string;
  success?: string;
  requireCaptcha?: boolean;
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
  if (error instanceof DbException) {
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

function logRecoverySkipped(
  reason: string,
  extra?: Record<string, string | number | boolean | null>,
): void {
  logInfo("auth.recovery.skipped", { reason, ...extra });
}

function isBetterAuthRateLimitError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  if (message.includes("too many requests")) return true;
  const status = (error as { status?: unknown }).status;
  return status === 429 || status === "429";
}

function isBetterAuthClientError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const status = (error as { status?: unknown }).status;
  if (typeof status === "number" && status >= 400 && status < 500) return true;
  if (typeof status === "string" && /^4\d\d$/.test(status)) return true;
  const message = error.message.toLowerCase();
  return (
    message.includes("invalid redirect") ||
    message.includes("invalid callback") ||
    message.includes("forbidden")
  );
}

export async function requestPasswordRecovery(
  _prev: RecoveryActionState,
  formData: FormData,
): Promise<RecoveryActionState> {
  const email = readString(formData, "email");
  const maskedRecipient = email ? maskEmailAddress(email) : "[no-email]";
  const guard = await verifyFormGuard(
    formData,
    "auth.password-recovery.request",
  );
  if (!guard.ok) {
    logRecoverySkipped("form_guard", { recipient: maskedRecipient });
    return { success: RECOVERY_SUCCESS };
  }
  const turnstile = await verifyTurnstileIfRequired({
    formData,
    action: TURNSTILE_ACTIONS.recoveryRequest,
    email,
  });
  if (!turnstile.ok) {
    return { error: turnstile.error, requireCaptcha: true };
  }
  if (!email) {
    return {
      error: "Email is required.",
      requireCaptcha: turnstile.required,
    };
  }

  const ip = await getClientIp();
  const emailKey = normalizeEmailKey(email);
  const emailLimit = await assertDurableRateLimit({
    bucket: "auth.recovery",
    key: `email:${emailKey}`,
    ...RATE_LIMITS.recovery,
  });
  if (!emailLimit.ok) {
    logRecoverySkipped("rate_limit_email", {
      recipient: maskedRecipient,
      retryAfterSec: emailLimit.retryAfterSec,
    });
    return {
      error: RATE_LIMIT_MESSAGE,
      requireCaptcha: turnstile.required,
    };
  }
  const ipLimit = await assertDurableRateLimit({
    bucket: "auth.recovery",
    key: `ip:${ip}`,
    ...RATE_LIMITS.recovery,
  });
  if (!ipLimit.ok) {
    logRecoverySkipped("rate_limit_ip", {
      recipient: maskedRecipient,
      retryAfterSec: ipLimit.retryAfterSec,
    });
    return {
      error: RATE_LIMIT_MESSAGE,
      requireCaptcha: turnstile.required,
    };
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
      const requireCaptcha = await recordTurnstileFailure({
        action: TURNSTILE_ACTIONS.recoveryRequest,
        email,
      });
      return { error: mapRecoveryError(error), requireCaptcha };
    }

    if (isBetterAuthRateLimitError(error)) {
      logRecoverySkipped("better_auth_rate_limit", {
        recipient: maskedRecipient,
      });
      return {
        error: RATE_LIMIT_MESSAGE,
        requireCaptcha: turnstile.required,
      };
    }

    if (isBetterAuthClientError(error)) {
      const detail =
        error instanceof Error ? error.message.slice(0, 200) : "unknown";
      logRecoverySkipped("better_auth_request", {
        recipient: maskedRecipient,
        detail,
      });
      const requireCaptcha = await recordTurnstileFailure({
        action: TURNSTILE_ACTIONS.recoveryRequest,
        email,
      });
      return { error: mapRecoveryError(error), requireCaptcha };
    }
  }

  return { success: RECOVERY_SUCCESS, requireCaptcha: turnstile.required };
}

export async function completePasswordRecovery(
  _prev: RecoveryActionState,
  formData: FormData,
): Promise<RecoveryActionState> {
  const guard = await verifyFormGuard(
    formData,
    "auth.password-recovery.complete",
  );
  if (!guard.ok) {
    return { error: "Something went wrong. Please try again." };
  }
  const token = readString(formData, "token") || readString(formData, "secret");
  const password = readString(formData, "password");
  const confirm = readString(formData, "confirm");
  const turnstile = await verifyTurnstileIfRequired({
    formData,
    action: TURNSTILE_ACTIONS.recoveryComplete,
  });
  if (!turnstile.ok) {
    return { error: turnstile.error, requireCaptcha: true };
  }

  if (!token) {
    return {
      error:
        "This reset link is missing required parameters. Request a new one.",
      requireCaptcha: turnstile.required,
    };
  }
  if (!password || password.length < 8) {
    return {
      error: "Password must be at least 8 characters.",
      requireCaptcha: turnstile.required,
    };
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return {
      error: `Password must be at most ${MAX_PASSWORD_LENGTH} characters.`,
      requireCaptcha: turnstile.required,
    };
  }
  if (password !== confirm) {
    return {
      error: "Passwords do not match.",
      requireCaptcha: turnstile.required,
    };
  }

  const ip = await getClientIp();
  const completeLimit = await assertDurableRateLimit({
    bucket: "auth.recovery_complete",
    key: `ip:${ip}`,
    ...RATE_LIMITS.recoveryComplete,
  });
  if (!completeLimit.ok) {
    return { error: RATE_LIMIT_MESSAGE, requireCaptcha: turnstile.required };
  }
  if (await isPasswordBreached(password)) {
    return {
      error:
        "This password appears in a known breach. Choose a different password.",
      requireCaptcha: turnstile.required,
    };
  }

  try {
    await authApi().resetPassword({
      body: { newPassword: password, token },
      headers: await headers(),
    });
  } catch (error) {
    unstable_rethrow(error);
    const requireCaptcha = await recordTurnstileFailure({
      action: TURNSTILE_ACTIONS.recoveryComplete,
    });
    return { error: mapRecoveryError(error), requireCaptcha };
  }

  redirect("/login?reset=1");
}

export async function requestEmailVerification(
  prev: RecoveryActionState,
  formData: FormData,
): Promise<RecoveryActionState> {
  void prev;
  const guard = await verifyFormGuard(
    formData,
    "auth.email-verification.resend",
  );
  if (!guard.ok) {
    return {
      error: "Could not submit this form. Please refresh and try again.",
    };
  }

  const user = await getLoggedInUser();
  if (!user) {
    return { error: "You must be signed in to verify your email." };
  }
  const turnstile = await verifyTurnstileIfRequired({
    formData,
    action: TURNSTILE_ACTIONS.verificationResend,
    email: user.email,
  });
  if (!turnstile.ok) {
    return { error: turnstile.error, requireCaptcha: true };
  }

  const verifyLimit = await assertDurableRateLimit({
    bucket: "auth.verify_resend",
    key: `user:${user.$id}`,
    ...RATE_LIMITS.verifyResend,
  });
  if (!verifyLimit.ok) {
    return { error: RATE_LIMIT_MESSAGE, requireCaptcha: turnstile.required };
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
    const requireCaptcha = await recordTurnstileFailure({
      action: TURNSTILE_ACTIONS.verificationResend,
      email: user.email,
    });
    return { error: mapRecoveryError(error), requireCaptcha };
  }

  return {
    success: "Verification email sent. Check your inbox.",
    requireCaptcha: turnstile.required,
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
