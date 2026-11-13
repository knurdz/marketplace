import { and, eq, inArray, ne } from "drizzle-orm";
import { ID } from "@/lib/db/compat";
import { getDb } from "@/lib/db/client";
import { sellerProfiles } from "@/lib/db/schema";
import type { SellerStatus } from "@/lib/types";

const MAX_SLUG_LENGTH = 128;

/** Statuses that reserve a public `/shop/{slug}` url. */
export const SELLER_SLUG_HOLDING_STATUSES = [
  "pending",
  "approved",
  "banned",
] as const satisfies readonly SellerStatus[];

export type SellerSlugHoldingStatus =
  (typeof SELLER_SLUG_HOLDING_STATUSES)[number];

export function sellerProfileStatusClaimsSlug(status: SellerStatus): boolean {
  return (SELLER_SLUG_HOLDING_STATUSES as readonly string[]).includes(status);
}

/** Internal slug after reject so the public slug can be claimed by others. */
export function rejectedSellerPlaceholderSlug(profileId: string): string {
  const id = profileId.trim();
  return `rejected-${id}`.slice(0, MAX_SLUG_LENGTH);
}

/**
 * True when another profile with a slug-holding status already uses this slug.
 */
export async function isSellerShopSlugClaimed(
  slug: string,
  exceptProfileId?: string,
): Promise<boolean> {
  if (!process.env.DATABASE_URL?.trim()) return false;

  try {
    const conditions = [
      eq(sellerProfiles.slug, slug),
      inArray(sellerProfiles.status, [...SELLER_SLUG_HOLDING_STATUSES]),
    ];
    if (exceptProfileId?.trim()) {
      conditions.push(ne(sellerProfiles.id, exceptProfileId.trim()));
    }
    const rows = await getDb()
      .select({ id: sellerProfiles.id })
      .from(sellerProfiles)
      .where(and(...conditions))
      .limit(1);
    return rows.length > 0;
  } catch {
    return false;
  }
}

/** Pick first slug in base, base-2, base-3, … not claimed by a holding status. */
export async function resolveUniqueShopSlug(
  baseSlug: string,
  exceptProfileId?: string,
): Promise<string> {
  const root = baseSlug.slice(0, MAX_SLUG_LENGTH);
  if (!(await isSellerShopSlugClaimed(root, exceptProfileId))) return root;

  for (let n = 2; n <= 99; n += 1) {
    const suffix = `-${n}`;
    const candidate = `${root.slice(0, MAX_SLUG_LENGTH - suffix.length)}${suffix}`;
    if (!(await isSellerShopSlugClaimed(candidate, exceptProfileId))) {
      return candidate;
    }
  }

  return `${root.slice(0, MAX_SLUG_LENGTH - 9)}-${ID.unique().slice(0, 8)}`;
}
