export const OAUTH_PROVIDERS = ["google", "apple", "facebook"] as const;
export type OAuthProviderId = (typeof OAUTH_PROVIDERS)[number];

export function parseOAuthProvider(raw: string): OAuthProviderId | null {
  return OAUTH_PROVIDERS.includes(raw as OAuthProviderId)
    ? (raw as OAuthProviderId)
    : null;
}
