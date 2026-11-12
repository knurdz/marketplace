import { getAppUrl } from "@/lib/config/app";
import { getRequestOrigin } from "@/lib/backend/server-origin";

/** Where Better Auth redirects after the user opens the verify link in email. */
export function buildEmailVerificationCallbackUrl(origin: string): string {
  const base = origin.replace(/\/$/, "");
  return `${base}/verify-email?verified=1`;
}

export async function resolveEmailVerificationCallbackUrl(): Promise<string> {
  return buildEmailVerificationCallbackUrl(await getRequestOrigin());
}

/** Better Auth error query values appended to callbackURL on failed verification. */
const VERIFY_LINK_ERROR_MESSAGES: Record<string, string> = {
  invalid_token: "This verification link is invalid or has expired.",
  token_expired: "This verification link has expired. Request a new one from your account page.",
  user_not_found: "We could not find an account for this link.",
};

export function verifyLinkErrorMessage(code: string | undefined): string {
  if (!code?.trim()) {
    return "This verification link is invalid or has expired.";
  }
  const normalized = code.trim().toLowerCase();
  return (
    VERIFY_LINK_ERROR_MESSAGES[normalized] ??
    VERIFY_LINK_ERROR_MESSAGES[code.trim()] ??
    "This verification link is invalid or has expired."
  );
}

/**
 * Ensure verification links in outgoing email always return to the feedback page,
 * even when an upstream call omitted callbackURL (defaults to `/`).
 */
export function ensureVerificationEmailLinkCallback(linkUrl: string): string {
  try {
    const parsed = new URL(linkUrl);
    const rawCallback = parsed.searchParams.get("callbackURL");
    let decoded: string | null = null;
    if (rawCallback) {
      try {
        decoded = decodeURIComponent(rawCallback);
      } catch {
        decoded = rawCallback;
      }
    }
    const appOrigin = getAppUrl().replace(/\/$/, "");
    const desired = `${appOrigin}/verify-email?verified=1`;
    const rootish =
      !decoded ||
      decoded === "/" ||
      decoded === appOrigin ||
      decoded === `${appOrigin}/`;
    if (rootish) {
      parsed.searchParams.set("callbackURL", encodeURIComponent(desired));
      return parsed.toString();
    }
  } catch {
    // Keep the original link if parsing fails.
  }
  return linkUrl;
}
