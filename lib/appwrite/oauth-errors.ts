/** Safe query values for `?error=` after OAuth cancel/failure. Never include secrets. */
export const OAUTH_ERROR_MESSAGES = {
  oauth:
    "Social sign-in was cancelled or failed. Try again, or use email.",
  oauth_disabled: "This account is disabled.",
  oauth_exists:
    "An account with this email already exists. Sign in with email and password.",
} as const;

export type OAuthErrorCode = keyof typeof OAUTH_ERROR_MESSAGES;

export function isOAuthErrorCode(value: string | undefined): value is OAuthErrorCode {
  return Boolean(value && value in OAUTH_ERROR_MESSAGES);
}

export function oauthErrorMessage(code: string | undefined): string | undefined {
  if (!isOAuthErrorCode(code)) return undefined;
  return OAUTH_ERROR_MESSAGES[code];
}
