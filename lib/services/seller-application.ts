import {
  DbException,
  ID,
  Permission,
  Query,
  Role,
} from "@/lib/db/compat";
import {
  BUCKET_AVATARS,
  DATABASE_ID,
  TABLE_SELLER_PROFILES,
  hasDatabaseConfig,
} from "@/lib/backend/config";
import { ROLE_LABELS, userHasLabel } from "@/lib/backend/roles";
import { createAdminClient, createSessionClient } from "@/lib/backend/server";
import { deleteFile, uploadAvatar } from "@/lib/backend/storage";
import { getLoggedInUser } from "@/lib/backend/session";
import { notifyAdminsEvent, notifyUserEvent } from "@/lib/email/events";
import type { SellerProfile } from "@/lib/types";
import { generateSlug } from "./categories";
import { asSellerProfile } from "./seller-approvals";

const PENDING_STATUS = "pending" as const;
const MAX_SHOP_NAME_LENGTH = 128;
const MAX_SLUG_LENGTH = 128;
const MAX_BIO_LENGTH = 2000;

export type BlockedSellerPortalDestination = "/seller/pending" | "/" | null;

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

export type UpdateShopProfileInput = {
  shopName: string;
  bio?: string;
};

export type ShopProfileUpdateResult =
  { ok: true; message: string; slug: string } | { ok: false; error: string };

export type ShopBannerUpdateResult =
  { ok: true; message: string; slug: string } | { ok: false; error: string };

export type UpdateShopPoliciesInput = {
  returnPolicy?: string;
  shippingPolicy?: string;
};

export type ParsedShopPoliciesInput =
  | { ok: true; returnPolicy: string | null; shippingPolicy: string | null }
  | { ok: false; error: string };

/**
 * Where to send a signed-in user who hits /seller without approved portal access.
 * null = allow portal; pending/rejected → status UX; else home.
 */
export function blockedSellerPortalDestination(
  hasSellerLabel: boolean,
  profile: SellerProfile | null,
): BlockedSellerPortalDestination {
  if (profile?.status === "pending" || profile?.status === "rejected") {
    return "/seller/pending";
  }
  if (hasSellerLabel) return null;
  return "/";
}

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

/** Validate shop policy text fields (no I/O). Empty clears; max length enforced. */
export function parseShopPolicyInput(
  input: UpdateShopPoliciesInput,
): ParsedShopPoliciesInput {
  const returnRaw = input.returnPolicy?.trim() ?? "";
  const shippingRaw = input.shippingPolicy?.trim() ?? "";

  if (returnRaw.length > MAX_BIO_LENGTH) {
    return {
      ok: false,
      error: `Return policy must be at most ${MAX_BIO_LENGTH} characters.`,
    };
  }
  if (shippingRaw.length > MAX_BIO_LENGTH) {
    return {
      ok: false,
      error: `Shipping policy must be at most ${MAX_BIO_LENGTH} characters.`,
    };
  }

  return {
    ok: true,
    returnPolicy: returnRaw.length > 0 ? returnRaw : null,
    shippingPolicy: shippingRaw.length > 0 ? shippingRaw : null,
  };
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
  if (!process.env.DATABASE_URL?.trim()) return false;

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
  if (!hasDatabaseConfig()) {
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
        rejectionReason: null,
      },
      permissions: sellerProfilePermissions(user.$id),
    });

    const profile = asSellerProfile(row as unknown as Record<string, unknown>);
    if (!profile || profile.userId !== user.$id) {
      return {
        ok: false,
        error: "Application was created but could not be verified.",
      };
    }

    await Promise.all([
      notifyUserEvent(user.$id, {
        type: "seller.application.submitted",
        title: "Seller application submitted",
        body: `Your application for "${profile.shopName}" was submitted. An admin will review your shop details.`,
        link: "/seller/pending",
      }),
      notifyAdminsEvent({
        type: "seller.application.submitted.admin",
        title: "New seller application",
        body: `"${profile.shopName}" applied to become a seller.`,
        link: "/admin/sellers",
        detailLines: [
          `Profile: ${profile.$id}`,
          `Applicant: ${user.$id}`,
          `Slug: ${profile.slug}`,
        ],
      }),
    ]);

    return {
      ok: true,
      message: "Application submitted. An admin will review your shop details.",
      profileId: profile.$id,
    };
  } catch (error) {
    if (error instanceof DbException) {
      if (error.code === 409) {
        return {
          ok: false,
          error:
            "You already have a seller application or this shop URL is taken.",
        };
      }
      if (error.code === 401) {
        return { ok: false, error: "You must be signed in to apply." };
      }
    }
    return {
      ok: false,
      error: "Could not submit application. Please try again.",
    };
  }
}

/**
 * Create a pending seller_profiles row for a newly registered user (admin SDK).
 * Does not grant the seller label: admin approval does that.
 */
export async function createPendingSellerProfileForUser(
  userId: string,
  input: SubmitSellerApplicationInput,
): Promise<SellerApplicationResult> {
  if (!hasDatabaseConfig()) {
    return { ok: false, error: "Marketplace is not configured." };
  }

  const trimmedUserId = userId.trim();
  if (!trimmedUserId) {
    return { ok: false, error: "Account could not be created." };
  }

  const parsed = parseSellerApplicationInput(input);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }

  const slug = await resolveUniqueShopSlug(parsed.slug);

  try {
    const { tables } = await createAdminClient();
    const existing = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_SELLER_PROFILES,
      queries: [Query.equal("userId", trimmedUserId), Query.limit(1)],
    });
    if (existing.rows.length > 0) {
      return {
        ok: false,
        error: "You already have a seller application under review.",
      };
    }

    const row = await tables.createRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_SELLER_PROFILES,
      rowId: ID.unique(),
      data: {
        userId: trimmedUserId,
        shopName: parsed.shopName,
        slug,
        bio: parsed.bio,
        status: PENDING_STATUS,
        bannerFileId: null,
        rejectionReason: null,
      },
      permissions: sellerProfilePermissions(trimmedUserId),
    });

    const profile = asSellerProfile(row as unknown as Record<string, unknown>);
    if (!profile || profile.userId !== trimmedUserId) {
      return {
        ok: false,
        error: "Application was created but could not be verified.",
      };
    }

    await Promise.all([
      notifyUserEvent(trimmedUserId, {
        type: "seller.application.submitted",
        title: "Seller application submitted",
        body: `Your application for "${profile.shopName}" was submitted. An admin will review your shop details.`,
        link: "/seller/pending",
      }),
      notifyAdminsEvent({
        type: "seller.application.submitted.admin",
        title: "New seller application",
        body: `"${profile.shopName}" applied to become a seller.`,
        link: "/admin/sellers",
        detailLines: [
          `Profile: ${profile.$id}`,
          `Applicant: ${trimmedUserId}`,
          `Slug: ${profile.slug}`,
        ],
      }),
    ]);

    return {
      ok: true,
      message: "Application submitted. An admin will review your shop details.",
      profileId: profile.$id,
    };
  } catch (error) {
    if (error instanceof DbException && error.code === 409) {
      return {
        ok: false,
        error:
          "You already have a seller application or this shop URL is taken.",
      };
    }
    return {
      ok: false,
      error: "Could not submit application. Please try again.",
    };
  }
}

/**
 * Update shop name + bio for the signed-in approved seller only.
 * Never mutates slug, status, or userId.
 */
export async function updateOwnShopProfileCore(
  input: UpdateShopProfileInput,
): Promise<ShopProfileUpdateResult> {
  if (!hasDatabaseConfig()) {
    return { ok: false, error: "Marketplace is not configured." };
  }

  const user = await getLoggedInUser();
  if (!user) {
    return { ok: false, error: "You must be signed in to update your shop." };
  }

  const parsed = parseSellerApplicationInput({
    shopName: input.shopName,
    bio: input.bio,
  });
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }

  const existing = await getOwnSellerProfile();
  if (!existing || existing.userId !== user.$id) {
    return { ok: false, error: "Seller profile not found." };
  }
  if (existing.status !== "approved") {
    return { ok: false, error: "Only approved sellers can edit shop details." };
  }

  try {
    const { tables } = await createSessionClient();
    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_SELLER_PROFILES,
      rowId: existing.$id,
      data: {
        shopName: parsed.shopName,
        bio: parsed.bio,
        userId: user.$id,
      },
    });

    return {
      ok: true,
      message: "Shop profile updated.",
      slug: existing.slug,
    };
  } catch (error) {
    if (error instanceof DbException) {
      if (error.code === 401 || error.code === 404) {
        return { ok: false, error: "Not allowed to update this shop." };
      }
    }
    return {
      ok: false,
      error: "Could not update shop profile. Please try again.",
    };
  }
}

/**
 * Update return/shipping policy text for the signed-in approved seller only.
 * Never mutates slug, status, or shop name.
 */
export async function updateOwnShopPoliciesCore(
  input: UpdateShopPoliciesInput,
): Promise<ShopProfileUpdateResult> {
  if (!hasDatabaseConfig()) {
    return { ok: false, error: "Marketplace is not configured." };
  }

  const user = await getLoggedInUser();
  if (!user) {
    return {
      ok: false,
      error: "You must be signed in to update shop policies.",
    };
  }

  const parsed = parseShopPolicyInput(input);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }

  const existing = await getOwnSellerProfile();
  if (!existing || existing.userId !== user.$id) {
    return { ok: false, error: "Seller profile not found." };
  }
  if (existing.status !== "approved") {
    return {
      ok: false,
      error: "Only approved sellers can edit shop policies.",
    };
  }

  try {
    const { tables } = await createSessionClient();
    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_SELLER_PROFILES,
      rowId: existing.$id,
      data: {
        returnPolicy: parsed.returnPolicy,
        shippingPolicy: parsed.shippingPolicy,
        userId: user.$id,
      },
    });

    const cleared = !parsed.returnPolicy && !parsed.shippingPolicy;

    return {
      ok: true,
      message: cleared ? "Shop policies cleared." : "Shop policies saved.",
      slug: existing.slug,
    };
  } catch (error) {
    if (error instanceof DbException) {
      if (error.code === 401 || error.code === 404) {
        return { ok: false, error: "Not allowed to update shop policies." };
      }
    }
    return {
      ok: false,
      error: "Could not update shop policies. Please try again.",
    };
  }
}

/**
 * Upload shop banner for the signed-in approved seller only.
 * Reuses avatars bucket (public read); deletes previous banner on success.
 */
export async function updateOwnShopBannerCore(
  file: File,
): Promise<ShopBannerUpdateResult> {
  if (!hasDatabaseConfig()) {
    return { ok: false, error: "Marketplace is not configured." };
  }

  const user = await getLoggedInUser();
  if (!user) {
    return { ok: false, error: "You must be signed in to upload a banner." };
  }

  if (!(file instanceof File) || file.size <= 0) {
    return { ok: false, error: "Choose an image file to upload." };
  }

  const existing = await getOwnSellerProfile();
  if (!existing || existing.userId !== user.$id) {
    return { ok: false, error: "Seller profile not found." };
  }
  if (existing.status !== "approved") {
    return { ok: false, error: "Only approved sellers can upload a banner." };
  }

  let uploadedFileId: string | null = null;
  const previousFileId = existing.bannerFileId;

  try {
    const { fileId } = await uploadAvatar(file);
    uploadedFileId = fileId;

    const { tables } = await createSessionClient();
    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_SELLER_PROFILES,
      rowId: existing.$id,
      data: {
        bannerFileId: fileId,
        userId: user.$id,
      },
    });

    if (previousFileId && previousFileId !== fileId) {
      try {
        await deleteFile(BUCKET_AVATARS, previousFileId);
      } catch {
        // Best-effort cleanup; new banner is already linked.
      }
    }

    return {
      ok: true,
      message: "Shop banner updated.",
      slug: existing.slug,
    };
  } catch (error) {
    if (uploadedFileId) {
      try {
        await deleteFile(BUCKET_AVATARS, uploadedFileId);
      } catch {
        // Ignore cleanup failure.
      }
    }
    if (error instanceof DbException) {
      if (error.code === 401 || error.code === 404) {
        return { ok: false, error: "Not allowed to update this shop." };
      }
    }
    return { ok: false, error: "Could not upload banner. Please try again." };
  }
}
