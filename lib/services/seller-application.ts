import { AppwriteException, ID, Permission, Query, Role } from "node-appwrite";
import {
  DATABASE_ID,
  TABLE_SELLER_PROFILES,
  hasAppwritePublicConfig,
} from "@/lib/appwrite/config";
import { ROLE_LABELS, userHasLabel } from "@/lib/appwrite/roles";
import { createAdminClient, createSessionClient } from "@/lib/appwrite/server";
import { getLoggedInUser } from "@/lib/appwrite/session";
import type { SellerProfile } from "@/lib/types";
import { generateSlug } from "./categories";
import { asSellerProfile } from "./seller-approvals";

const PENDING_STATUS = "pending" as const;
const MAX_SHOP_NAME_LENGTH = 128;
const MAX_SLUG_LENGTH = 128;
const MAX_BIO_LENGTH = 2000;

export type SubmitSellerApplicationInput = {
  shopName: string;
  slug?: string;
  bio?: string;
};

export type SellerApplicationResult =
  | { ok: true; message: string; profileId: string }
  | { ok: false; error: string };

export type ParsedSellerApplicationInput =
  | { ok: true; shopName: string; slug: string; bio: string | null }
  | { ok: false; error: string };

/** Validate apply form fields (no I/O). */
export function parseSellerApplicationInput(
  input: SubmitSellerApplicationInput,
): ParsedSellerApplicationInput {
  const shopName = input.shopName.trim();
  if (!shopName) {
    return { ok: false, error: "Shop name is required." };
  }
  if (shopName.length > MAX_SHOP_NAME_LENGTH) {
    return {
      ok: false,
      error: `Shop name must be at most ${MAX_SHOP_NAME_LENGTH} characters.`,
    };
  }

  const bioRaw = input.bio?.trim() ?? "";
  if (bioRaw.length > MAX_BIO_LENGTH) {
    return {
      ok: false,
      error: `Bio must be at most ${MAX_BIO_LENGTH} characters.`,
    };
  }

  const slugSource = input.slug?.trim() ? input.slug : shopName;
  const slug = normalizeShopSlug(slugSource);
  if (!slug) {
    return {
      ok: false,
      error: "Shop URL slug must contain letters or numbers.",
    };
  }
  if (slug.length > MAX_SLUG_LENGTH) {
    return {
      ok: false,
      error: `Shop URL slug must be at most ${MAX_SLUG_LENGTH} characters.`,
    };
  }

  return {
    ok: true,
    shopName,
    slug,
    bio: bioRaw.length > 0 ? bioRaw : null,
  };
}

/** Lowercase hyphenated slug for seller shop URLs. */
export function normalizeShopSlug(value: string): string {
  return generateSlug(value);
}

function sellerProfilePermissions(userId: string): string[] {
  return [
    Permission.read(Role.user(userId)),
    Permission.update(Role.user(userId)),
    Permission.read(Role.label("admin")),
    Permission.update(Role.label("admin")),
    Permission.delete(Role.label("admin")),
  ];
}

async function slugTaken(slug: string): Promise<boolean> {
  if (!process.env.APPWRITE_API_KEY?.trim()) return false;

  try {
    const { tables } = await createAdminClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_SELLER_PROFILES,
      queries: [Query.equal("slug", slug), Query.limit(1)],
    });
    return result.rows.length > 0;
  } catch {
    return false;
  }
}

/** Pick first slug in base, base-2, base-3, … not already used. */
export async function resolveUniqueShopSlug(baseSlug: string): Promise<string> {
  const root = baseSlug.slice(0, MAX_SLUG_LENGTH);
  if (!(await slugTaken(root))) return root;

  for (let n = 2; n <= 99; n += 1) {
    const suffix = `-${n}`;
    const candidate = `${root.slice(0, MAX_SLUG_LENGTH - suffix.length)}${suffix}`;
    if (!(await slugTaken(candidate))) return candidate;
  }

  return `${root.slice(0, MAX_SLUG_LENGTH - 9)}-${ID.unique().slice(0, 8)}`;
}

/** Load the signed-in user's seller profile, if any. */
export async function getOwnSellerProfile(): Promise<SellerProfile | null> {
  const user = await getLoggedInUser();
  if (!user) return null;

  try {
    const { tables } = await createSessionClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_SELLER_PROFILES,
      queries: [Query.equal("userId", user.$id), Query.limit(1)],
    });

    const row = result.rows[0];
    if (!row) return null;

    const profile = asSellerProfile(row as unknown as Record<string, unknown>);
    if (!profile || profile.userId !== user.$id) return null;
    return profile;
  } catch {
    return null;
  }
}

function existingApplicationMessage(profile: SellerProfile): string {
  switch (profile.status) {
    case "pending":
      return "You already have a seller application under review.";
    case "approved":
      return "You are already an approved seller.";
    case "rejected":
      return profile.rejectionReason
        ? `Your previous application was rejected: ${profile.rejectionReason}`
        : "Your previous seller application was rejected.";
    default:
      return "You already have a seller profile.";
  }
}

/**
 * Create seller_profiles row with status=pending for the signed-in user.
 * One application per userId (userId_unique). Does not grant seller label.
 */
export async function submitSellerApplicationCore(
  input: SubmitSellerApplicationInput,
): Promise<SellerApplicationResult> {
  if (!hasAppwritePublicConfig()) {
    return { ok: false, error: "Marketplace is not configured." };
  }

  const user = await getLoggedInUser();
  if (!user) {
    return { ok: false, error: "You must be signed in to apply." };
  }

  if (userHasLabel(user, ROLE_LABELS.seller)) {
    return {
      ok: false,
      error: "You already have seller access. Open the seller portal.",
    };
  }

  const parsed = parseSellerApplicationInput(input);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }

  const existing = await getOwnSellerProfile();
  if (existing) {
    return { ok: false, error: existingApplicationMessage(existing) };
  }

  const slug = await resolveUniqueShopSlug(parsed.slug);

  try {
    const { tables } = await createSessionClient();
    const row = await tables.createRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_SELLER_PROFILES,
      rowId: ID.unique(),
      data: {
        userId: user.$id,
        shopName: parsed.shopName,
        slug,
        bio: parsed.bio,
        status: PENDING_STATUS,
        bannerFileId: null,
        bankAccountName: null,
        bankAccountNumber: null,
        bankName: null,
        rejectionReason: null,
      },
      permissions: sellerProfilePermissions(user.$id),
    });

    const profile = asSellerProfile(row as unknown as Record<string, unknown>);
    if (!profile || profile.userId !== user.$id) {
      return { ok: false, error: "Application was created but could not be verified." };
    }

    return {
      ok: true,
      message: "Application submitted. An admin will review your shop details.",
      profileId: profile.$id,
    };
  } catch (error) {
    if (error instanceof AppwriteException) {
      if (error.code === 409) {
        return {
          ok: false,
          error: "You already have a seller application or this shop URL is taken.",
        };
      }
      if (error.code === 401) {
        return { ok: false, error: "You must be signed in to apply." };
      }
    }
    return { ok: false, error: "Could not submit application. Please try again." };
  }
}
