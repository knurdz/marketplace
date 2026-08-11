/**
 * Public Appwrite config (safe for client + server).
 * Secrets (APPWRITE_API_KEY) are read only in server.ts — never here as exports for the browser.
 */

export const SESSION_COOKIE = "knurdz_session";

export function getAppwriteEndpoint(): string {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.trim();
  if (!endpoint) {
    throw new Error(
      "Missing NEXT_PUBLIC_APPWRITE_ENDPOINT. Copy .env.example to .env.local and set your Appwrite endpoint (e.g. https://sgp.cloud.appwrite.io/v1).",
    );
  }
  return endpoint;
}

export function getAppwriteProjectId(): string {
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID?.trim();
  if (!projectId) {
    throw new Error(
      "Missing NEXT_PUBLIC_APPWRITE_PROJECT_ID. Copy .env.example to .env.local and set your Appwrite project id.",
    );
  }
  return projectId;
}

/** True when public Appwrite env is present (does not check API key). */
export function hasAppwritePublicConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.trim() &&
    process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID?.trim(),
  );
}
