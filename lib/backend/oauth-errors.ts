/** Safe query values for `?error=` after OAuth or email-link failure. Never include secrets. */
export const OAUTH_ERROR_MESSAGES = {
  oauth:
    "Social sign-in was cancelled or failed. Try again, or use email.",
  try_again: "Wait a moment, then try again.",
  rate_limited: "Too many attempts. Please try again later.",
  oauth_unavailable: "This sign-in option is not available right now.",
  oauth_disabled: "This account is disabled.",
  oauth_exists:
    "An account with this email already exists. Sign in with email and password.",
  account_not_linked:
    "An account with this email already exists. Sign in with your password.",
  unable_to_link_account:
    "An account with this email already exists. Sign in with your password.",
  email_not_verified:
    "Confirm your email before signing in. Check your inbox.",
  state_mismatch: "That sign-in expired. Try again.",
  state_not_found: "That sign-in expired. Try again.",
  access_denied: "Social sign-in was cancelled.",
  internal_server_error: "Sign-in could not be completed. Try again.",
} as const;

export type OAuthErrorCode = keyof typeof OAUTH_ERROR_MESSAGES;

export function isOAuthErrorCode(value: string | undefined): value is OAuthErrorCode {
  return Boolean(value && value in OAUTH_ERROR_MESSAGES);
}

export function oauthErrorMessage(code: string | undefined): string | undefined {
  if (!isOAuthErrorCode(code)) return undefined;
  return OAUTH_ERROR_MESSAGES[code];
}
