/**
 * Public Appwrite config (safe for client + server).
 * Secrets (APPWRITE_API_KEY) are read only in server.ts — never here as exports for the browser.
 *
 * Database / table IDs are code constants that must match the Appwrite console
 * (see docs/agent/SCHEMA.md after step 1.7).
 */

export const SESSION_COOKIE = "knurdz_session";

/** TablesDB database id (console: Marketplace). */
export const DATABASE_ID = "marketplace";

/** Table IDs — must match Appwrite console / docs/agent/SCHEMA.md. */
export const TABLE_PROFILES = "profiles";
export const TABLE_SELLER_PROFILES = "seller_profiles";
export const TABLE_CATEGORIES = "categories";
export const TABLE_PRODUCTS = "products";
export const TABLE_PRODUCT_IMAGES = "product_images";
export const TABLE_CARTS = "carts";
export const TABLE_CART_ITEMS = "cart_items";
export const TABLE_WISHLIST_ITEMS = "wishlist_items";
export const TABLE_ORDERS = "orders";
export const TABLE_ORDER_ITEMS = "order_items";
export const TABLE_PAYMENTS = "payments";
export const TABLE_BANK_SLIPS = "bank_slips";
export const TABLE_REVIEWS = "reviews";
export const TABLE_REPORTS = "reports";
export const TABLE_NOTIFICATIONS = "notifications";
export const TABLE_PLATFORM_SETTINGS = "platform_settings";
export const TABLE_AUDIT_LOGS = "audit_logs";
export const TABLE_PAYHERE_NOTIFY_LOGS = "payhere_notify_logs";
export const TABLE_COUPONS = "coupons";
export const TABLE_COUPON_REDEMPTIONS = "coupon_redemptions";
export const TABLE_THREADS = "threads";
export const TABLE_MESSAGES = "messages";

/** All MVP table ids (for docs / sanity checks). */
export const ALL_TABLE_IDS = [
  TABLE_PROFILES,
  TABLE_SELLER_PROFILES,
  TABLE_CATEGORIES,
  TABLE_PRODUCTS,
  TABLE_PRODUCT_IMAGES,
  TABLE_CARTS,
  TABLE_CART_ITEMS,
  TABLE_WISHLIST_ITEMS,
  TABLE_ORDERS,
  TABLE_ORDER_ITEMS,
  TABLE_PAYMENTS,
  TABLE_BANK_SLIPS,
  TABLE_REVIEWS,
  TABLE_REPORTS,
  TABLE_NOTIFICATIONS,
  TABLE_PLATFORM_SETTINGS,
  TABLE_AUDIT_LOGS,
  TABLE_PAYHERE_NOTIFY_LOGS,
  TABLE_COUPONS,
  TABLE_COUPON_REDEMPTIONS,
  TABLE_THREADS,
  TABLE_MESSAGES,
] as const;

/** Storage bucket IDs — must match Appwrite console / docs/agent/SCHEMA.md. */
export const BUCKET_AVATARS = "avatars";
export const BUCKET_PRODUCT_IMAGES = "product-images";
export const BUCKET_BANK_SLIPS = "bank-slips";

export const ALL_BUCKET_IDS = [
  BUCKET_AVATARS,
  BUCKET_PRODUCT_IMAGES,
  BUCKET_BANK_SLIPS,
] as const;

/** Re-export PayHere Function IDs (canonical values in lib/types/payhere.ts). */
export {
  FUNCTION_PAYHERE_CHECKOUT_HASH,
  FUNCTION_PAYHERE_NOTIFY,
  PAYHERE_FUNCTION_IDS as ALL_PAYHERE_FUNCTION_IDS,
} from "@/lib/types/payhere";

/** Max upload sizes (bytes) — mirror bucket settings. */
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024; // 2MB
export const PRODUCT_IMAGE_MAX_BYTES = 5 * 1024 * 1024; // 5MB
export const BANK_SLIP_MAX_BYTES = 5 * 1024 * 1024; // 5MB

export const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"] as const;

export const BANK_SLIP_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export const BANK_SLIP_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "pdf",
] as const;

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
export function getAppUrl(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (!appUrl) {
    throw new Error(
      "Missing NEXT_PUBLIC_APP_URL. Set it in .env.local (e.g. http://localhost:3000).",
    );
  }
  return appUrl;
}

/** True when public Appwrite env is present (does not check API key). */
export function hasAppwritePublicConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.trim() &&
    process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID?.trim(),
  );
}
