import { Query } from "@/lib/db/appwrite-shim";
import {
  DATABASE_ID,
  TABLE_SELLER_PROFILES,
} from "@/lib/appwrite/config";
import { createAdminClient } from "@/lib/appwrite/server";
import { isSellerStatus } from "@/lib/types";

/** Public storefront seller card: never includes rejection-only fields. */
export type PublicSellerInfo = {
  userId: string;
  shopName: string;
  slug: string;
  bio: string | null;
  bannerFileId: string | null;
  returnPolicy: string | null;
  shippingPolicy: string | null;
  /** Profile creation time for “Selling since” on the public shop. */
  $createdAt: string | null;
};

function asNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return value.length > 0 ? value : null;
}

/** Whether a seller_profiles status is safe to expose on the public storefront. */
export function isApprovedPublicSellerStatus(status: unknown): boolean {
  return isSellerStatus(status) && status === "approved";
}

export function toPublicSellerInfo(
  record: Record<string, unknown>,
): PublicSellerInfo | null {
  if (!isApprovedPublicSellerStatus(record.status)) return null;

  const userId = asNullableString(record.userId);
  const shopName = asNullableString(record.shopName);
  const slug = asNullableString(record.slug);
  if (!userId || !shopName || !slug) return null;

  return {
    userId,
    shopName,
    slug,
    bio: asNullableString(record.bio),
    bannerFileId: asNullableString(record.bannerFileId),
    returnPolicy: asNullableString(record.returnPolicy),
    shippingPolicy: asNullableString(record.shippingPolicy),
    $createdAt:
      typeof record.$createdAt === "string" ? record.$createdAt : null,
  };
}

/**
 * Approved seller profile for storefront display.
 * Uses admin client (seller_profiles is admin-read only); returns null when
 * missing, non-approved, or on error.
 */
export async function getPublicSellerByUserId(
  userId: string,
): Promise<PublicSellerInfo | null> {
  const trimmed = userId?.trim();
  if (!trimmed) return null;

  try {
    const { tables } = await createAdminClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_SELLER_PROFILES,
      queries: [Query.equal("userId", trimmed), Query.limit(1)],
    });

    const row = result.rows[0];
    if (!row) return null;

    return toPublicSellerInfo(row as unknown as Record<string, unknown>);
  } catch {
    return null;
  }
}

/**
 * Approved seller profile by shop slug for `/shop/[slug]`.
 * Returns null for missing, pending, rejected, or invalid slug: same 404 UX.
 */
export async function getPublicSellerBySlug(
  slug: string,
): Promise<PublicSellerInfo | null> {
  const trimmed = slug?.trim();
  if (!trimmed) return null;

  try {
    const { tables } = await createAdminClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_SELLER_PROFILES,
      queries: [Query.equal("slug", trimmed), Query.limit(1)],
    });

    const row = result.rows[0];
    if (!row) return null;

    return toPublicSellerInfo(row as unknown as Record<string, unknown>);
  } catch {
    return null;
  }
}
