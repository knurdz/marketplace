import { createHash } from "node:crypto";
import { getAuthAllowedHosts } from "@/lib/config/app";
import {
  getClientIp,
  getRateLimitCount,
  normalizeEmailKey,
  recordRateLimitHits,
  type RateLimitBucket,
} from "@/lib/security/rate-limit";

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const FAILURE_THRESHOLD = 3;
const FAILURE_WINDOW_MS = 15 * 60_000;

export const TURNSTILE_ACTIONS = {
  login: "auth_login",
  register: "auth_register",
  recoveryRequest: "auth_recovery_request",
  recoveryComplete: "auth_recovery_complete",
  verificationResend: "auth_verification_resend",
} as const;

export type TurnstileAction =
  (typeof TURNSTILE_ACTIONS)[keyof typeof TURNSTILE_ACTIONS];

export const TURNSTILE_ERROR_MESSAGE =
  "Please complete the security check and try again." as const;

function hashEmail(email: string): string {
  return createHash("sha256")
    .update(normalizeEmailKey(email))
    .digest("base64url");
}

function failureBuckets(
  action: TurnstileAction,
  ip: string,
  email?: string,
): RateLimitBucket[] {
  const bucket = `turnstile.${action}`;
  const buckets: RateLimitBucket[] = [
    {
      bucket,
      key: `ip:${ip}`,
      windowMs: FAILURE_WINDOW_MS,
    },
  ];
  if (email?.trim()) {
    buckets.push({
      bucket,
      key: `email-sha256:${hashEmail(email)}`,
      windowMs: FAILURE_WINDOW_MS,
    });
  }
  return buckets;
}

function normalizeHostname(value: string): string {
  return value.trim().toLowerCase().replace(/\.$/, "");
}

function allowedHostnames(): Set<string> {
  const hostnames = new Set<string>();
  for (const host of getAuthAllowedHosts()) {
    try {
      hostnames.add(normalizeHostname(new URL(`http://${host}`).hostname));
    } catch {
      // Invalid configured hosts are ignored; an empty/mismatched set fails.
    }
  }
  return hostnames;
}

export async function isTurnstileRequired(params: {
  action: TurnstileAction;
  email?: string;
}): Promise<boolean> {
  const ip = await getClientIp();
  const counts = await Promise.all(
    failureBuckets(params.action, ip, params.email).map(getRateLimitCount),
  );
  return counts.some((count) => count >= FAILURE_THRESHOLD);
}

export async function recordTurnstileFailure(params: {
  action: TurnstileAction;
  email?: string;
}): Promise<boolean> {
  const ip = await getClientIp();
  await recordRateLimitHits(failureBuckets(params.action, ip, params.email));
  return isTurnstileRequired(params);
}

export type TurnstileVerification =
  | { ok: true; required: boolean }
  | { ok: false; required: true; error: string };

/**
 * Checks failure status without incrementing it, and verifies a token only
 * after the failure threshold has been reached.
 */
export async function verifyTurnstileIfRequired(params: {
  formData: FormData;
  action: TurnstileAction;
  email?: string;
}): Promise<TurnstileVerification> {
  const required = await isTurnstileRequired(params);
  if (!required) return { ok: true, required: false };

  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  if (!secret || !siteKey) {
    if (process.env.NODE_ENV !== "production") {
      return { ok: true, required: false };
    }
    return {
      ok: false,
      required: true,
      error: TURNSTILE_ERROR_MESSAGE,
    };
  }

  const token = params.formData.get("cf-turnstile-response");
  if (typeof token !== "string" || !token.trim() || token.length > 4_096) {
    return {
      ok: false,
      required: true,
      error: TURNSTILE_ERROR_MESSAGE,
    };
  }

  const ip = await getClientIp();
  const body = new URLSearchParams({
    secret,
    response: token,
    remoteip: ip,
  });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      body,
      headers: { "content-type": "application/x-www-form-urlencoded" },
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) {
      return {
        ok: false,
        required: true,
        error: TURNSTILE_ERROR_MESSAGE,
      };
    }

    const result = (await response.json()) as {
      success?: boolean;
      action?: string;
      hostname?: string;
    };
    const hostname = normalizeHostname(result.hostname ?? "");
    if (
      result.success !== true ||
      result.action !== params.action ||
      !hostname ||
      !allowedHostnames().has(hostname)
    ) {
      return {
        ok: false,
        required: true,
        error: TURNSTILE_ERROR_MESSAGE,
      };
    }
    return { ok: true, required: true };
  } catch {
    return {
      ok: false,
      required: true,
      error: TURNSTILE_ERROR_MESSAGE,
    };
  } finally {
    clearTimeout(timeout);
  }
}
