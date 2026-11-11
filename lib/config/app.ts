const DEFAULT_LOCAL_APP_URL = "http://localhost:3000";
const DEFAULT_PRODUCTION_APP_URL = "https://marketplace.knurdz.org";

function normalizeOrigin(raw: string): string | null {
  const trimmed = raw.trim().replace(/\/$/, "");
  if (!trimmed) return null;
  try {
    const withScheme = trimmed.includes("://") ? trimmed : `https://${trimmed}`;
    return new URL(withScheme).origin;
  } catch {
    return null;
  }
}

function addOrigins(target: Set<string>, raw?: string | null) {
  if (!raw) return;
  for (const part of raw.split(",")) {
    const origin = normalizeOrigin(part);
    if (origin) target.add(origin);
  }
}

function isLoopbackOrigin(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host === "localhost" || host === "127.0.0.1" || host === "::1";
  } catch {
    return false;
  }
}

function httpsOrigin(host: string): string {
  return `https://${host.trim().replace(/\/$/, "")}`;
}

/** Public app origin for redirects and Better Auth. */
export function getAppUrl(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  const onVercel = Boolean(process.env.VERCEL);
  // Next inlines NEXT_PUBLIC_* at build. A localhost value on Vercel makes
  // canonical URLs and auth links point at the dev machine.
  if (appUrl && !(onVercel && isLoopbackOrigin(appUrl))) {
    return appUrl;
  }

  if (onVercel && process.env.VERCEL_ENV === "production") {
    const production = process.env.AUTH_PRODUCTION_APP_URL?.trim().replace(
      /\/$/,
      "",
    );
    if (production && !isLoopbackOrigin(production)) return production;
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
      return httpsOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL);
    }
    return DEFAULT_PRODUCTION_APP_URL;
  }

  if (process.env.VERCEL_URL) {
    return httpsOrigin(process.env.VERCEL_URL);
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return httpsOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  }
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return httpsOrigin(process.env.NEXT_PUBLIC_VERCEL_URL);
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "NEXT_PUBLIC_APP_URL must be set in production.",
    );
  }
  return DEFAULT_LOCAL_APP_URL;
}

/**
 * Origins allowed for OAuth redirects / Better Auth (local + production).
 * Reads NEXT_PUBLIC_APP_URL, AUTH_LOCAL_APP_URL, AUTH_PRODUCTION_APP_URL,
 * AUTH_TRUSTED_ORIGINS, and BETTER_AUTH_TRUSTED_ORIGINS.
 */
export function getAuthAppOrigins(): string[] {
  const origins = new Set<string>();
  addOrigins(origins, process.env.NEXT_PUBLIC_APP_URL);
  addOrigins(origins, process.env.AUTH_LOCAL_APP_URL);
  addOrigins(origins, process.env.AUTH_PRODUCTION_APP_URL);
  addOrigins(origins, process.env.AUTH_TRUSTED_ORIGINS);
  addOrigins(origins, process.env.BETTER_AUTH_TRUSTED_ORIGINS);
  addOrigins(origins, DEFAULT_LOCAL_APP_URL);
  addOrigins(origins, DEFAULT_PRODUCTION_APP_URL);
  if (origins.size === 0) {
    origins.add(getAppUrl());
  }
  return [...origins];
}

/** Host[:port] allowlist for Better Auth dynamic baseURL. */
export function getAuthAllowedHosts(): string[] {
  const hosts = new Set<string>();
  for (const origin of getAuthAppOrigins()) {
    try {
      hosts.add(new URL(origin).host);
    } catch {
      /* skip */
    }
  }
  hosts.add("localhost:3000");
  hosts.add("127.0.0.1:3000");
  hosts.add("marketplace.knurdz.org");
  for (const vercelHost of [
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
    process.env.VERCEL_BRANCH_URL,
  ]) {
    const origin = vercelHost ? normalizeOrigin(vercelHost) : null;
    if (origin) hosts.add(new URL(origin).host);
  }
  return [...hosts];
}

export function hasDatabaseConfig(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}
