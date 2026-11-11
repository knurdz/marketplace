/**
 * Public Appwrite config (safe for client + server).
 * Secrets (DATABASE_URL, BETTER_AUTH_SECRET) are read only on the server: never here as exports for the browser.
 *
 * Database / table IDs are code constants that must match the Appwrite console
 * (see docs/agent/SCHEMA.md after step 1.7).
 */

/** Better Auth session cookie (cookiePrefix `knurdz`). */
export const SESSION_COOKIE = "knurdz.session_token";

/** TablesDB database id (console: Marketplace). */
export const DATABASE_ID = "marketplace";

/** Table IDs: must match docs/agent/SCHEMA.md. */
export const TABLE_PROFILES = "profiles";
export const TABLE_SELLER_PROFILES = "seller_profiles";
export const TABLE_CATEGORIES = "categories";
export const TABLE_PRODUCTS = "products";
export const TABLE_PRODUCT_IMAGES = "product_images";
export const TABLE_WISHLIST_ITEMS = "wishlist_items";
export const TABLE_PURCHASE_REQUESTS = "purchase_requests";
export const TABLE_REVIEWS = "reviews";
export const TABLE_REPORTS = "reports";
export const TABLE_NOTIFICATIONS = "notifications";
export const TABLE_PLATFORM_SETTINGS = "platform_settings";
export const TABLE_AUDIT_LOGS = "audit_logs";
export const TABLE_VIEW_STATS = "view_stats";
export const TABLE_RATE_LIMITS = "rate_limits";

/** All MVP table ids (for docs / sanity checks). */
export const ALL_TABLE_IDS = [
  TABLE_PROFILES,
  TABLE_SELLER_PROFILES,
  TABLE_CATEGORIES,
  TABLE_PRODUCTS,
  TABLE_PRODUCT_IMAGES,
  TABLE_WISHLIST_ITEMS,
  TABLE_PURCHASE_REQUESTS,
  TABLE_REVIEWS,
  TABLE_REPORTS,
  TABLE_NOTIFICATIONS,
  TABLE_PLATFORM_SETTINGS,
  TABLE_AUDIT_LOGS,
  TABLE_VIEW_STATS,
  TABLE_RATE_LIMITS,
] as const;

/** Storage bucket IDs: must match docs/agent/SCHEMA.md. */
export const BUCKET_AVATARS = "avatars";
export const BUCKET_PRODUCT_IMAGES = "product-images";

export const ALL_BUCKET_IDS = [
  BUCKET_AVATARS,
  BUCKET_PRODUCT_IMAGES,
] as const;

/** Max upload sizes (bytes): mirror bucket settings. */
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024; // 2MB
export const PRODUCT_IMAGE_MAX_BYTES = 5 * 1024 * 1024; // 5MB

export const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"] as const;

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

/** Public app origin for recovery/verify redirect URLs (must match a Web platform hostname). */
export { getAppUrl, hasDatabaseConfig } from "@/lib/config/app";

/** @deprecated Use hasDatabaseConfig() */
export function hasAppwritePublicConfig(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}
