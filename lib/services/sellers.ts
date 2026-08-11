import { Query } from "node-appwrite";
import {
  DATABASE_ID,
  TABLE_SELLER_PROFILES,
} from "@/lib/appwrite/config";
import { createAdminClient } from "@/lib/appwrite/server";
import { isSellerStatus } from "@/lib/types";

/** Public storefront seller card — never includes bank or rejection fields. */
export type PublicSellerInfo = {
  shopName: string;
  slug: string;
  bio: string | null;
};

function asNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return value.length > 0 ? value : null;
}

/**
 * Approved seller profile for storefront display.
 * Uses admin client (seller_profiles is admin-read only); returns null when
 * missing, non-approved, or on error — never exposes bank account fields.
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

    const record = row as unknown as Record<string, unknown>;
    const statusRaw = record.status;
    if (!isSellerStatus(statusRaw) || statusRaw !== "approved") {
      return null;
    }

    const shopName = asNullableString(record.shopName);
    const slug = asNullableString(record.slug);
    if (!shopName || !slug) return null;

    return {
      shopName,
      slug,
      bio: asNullableString(record.bio),
    };
  } catch {
    return null;
  }
}
