import { Query } from "@/lib/db/appwrite-shim";
import {
  DATABASE_ID,
  TABLE_SELLER_PROFILES,
  hasAppwritePublicConfig,
} from "@/lib/appwrite/config";
import { ROLE_LABELS } from "@/lib/appwrite/roles";
import { createAdminClient } from "@/lib/appwrite/server";
import { notifyUserEvent } from "@/lib/email/events";
import type { SellerProfile } from "@/lib/types";
import { isSellerStatus } from "@/lib/types";
import { writeAuditLog } from "./audit-logs";

const PENDING_STATUS = "pending" as const;
const APPROVED_STATUS = "approved" as const;
const REJECTED_STATUS = "rejected" as const;
const MAX_REJECTION_REASON = 500;

function asNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return value.length > 0 ? value : null;
}

/** Map a TablesDB row to SellerProfile; returns null if required fields invalid. */
export function asSellerProfile(
  row: Record<string, unknown>,
): SellerProfile | null {
  const statusRaw = row.status;
  if (!isSellerStatus(statusRaw)) return null;

  const $id = asNullableString(row.$id);
  const userId = asNullableString(row.userId);
  const shopName = asNullableString(row.shopName);
  const slug = asNullableString(row.slug);
  if (!$id || !userId || !shopName || !slug) return null;

  return {
    $id,
    userId,
    shopName,
    slug,
    bio: asNullableString(row.bio),
    bannerFileId: asNullableString(row.bannerFileId),
    status: statusRaw,
    rejectionReason: asNullableString(row.rejectionReason),
    returnPolicy: asNullableString(row.returnPolicy),
    shippingPolicy: asNullableString(row.shippingPolicy),
  };
}

/** Admin queue view for pending seller applications. */
export type AdminSellerApplication = {
  $id: string;
  userId: string;
  shopName: string;
  slug: string;
  bio: string | null;
  status: "pending";
  $createdAt?: string;
};

/** Admin list row for any seller profile status. */
export type AdminSellerRow = {
  $id: string;
  userId: string;
  shopName: string;
  slug: string;
  bio: string | null;
  status: SellerProfile["status"];
  rejectionReason: string | null;
  $createdAt?: string;
};

function toAdminApplication(
  profile: SellerProfile,
  row: Record<string, unknown>,
): AdminSellerApplication | null {
  if (profile.status !== PENDING_STATUS) return null;
  return {
    $id: profile.$id,
    userId: profile.userId,
    shopName: profile.shopName,
    slug: profile.slug,
    bio: profile.bio,
    status: PENDING_STATUS,
    $createdAt:
      typeof row.$createdAt === "string" ? row.$createdAt : undefined,
  };
}

function toAdminSellerRow(
  profile: SellerProfile,
  row: Record<string, unknown>,
): AdminSellerRow {
  return {
    $id: profile.$id,
    userId: profile.userId,
    shopName: profile.shopName,
    slug: profile.slug,
    bio: profile.bio,
    status: profile.status,
    rejectionReason: profile.rejectionReason,
    $createdAt:
      typeof row.$createdAt === "string" ? row.$createdAt : undefined,
  };
}

/** Exclusive seller role: never keep a buyer label on an approved shop. */
function exclusiveSellerLabels(): string[] {
  return [ROLE_LABELS.seller];
}

async function loadSellerProfileRow(
  sellerProfileId: string,
): Promise<{ profile: SellerProfile; row: Record<string, unknown> } | null> {
  const trimmed = sellerProfileId?.trim();
  if (!trimmed) return null;

  const { tables } = await createAdminClient();
  try {
    const row = await tables.getRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_SELLER_PROFILES,
      rowId: trimmed,
    });
    const record = row as unknown as Record<string, unknown>;
    const profile = asSellerProfile(record);
    if (!profile) return null;
    return { profile, row: record };
  } catch {
    return null;
  }
}

export type SellerApprovalResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

/**
 * Seller profiles for admin (server-only). Pass status to filter, or omit for all.
 */
export async function listSellerProfilesAdmin(opts?: {
  status?: SellerProfile["status"];
  limit?: number;
}): Promise<AdminSellerRow[]> {
  if (!hasAppwritePublicConfig()) return [];
  if (!process.env.DATABASE_URL?.trim()) return [];

  const limit = Math.min(Math.max(opts?.limit ?? 100, 1), 100);

  try {
    const { tables } = await createAdminClient();
    const queries = [Query.orderDesc("$createdAt"), Query.limit(limit)];
    if (opts?.status) {
      queries.unshift(Query.equal("status", opts.status));
    }

    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_SELLER_PROFILES,
      queries,
    });

    const rows: AdminSellerRow[] = [];
    for (const row of result.rows) {
      const record = row as unknown as Record<string, unknown>;
      const profile = asSellerProfile(record);
      if (!profile) continue;
      if (opts?.status && profile.status !== opts.status) continue;
      rows.push(toAdminSellerRow(profile, record));
    }
    return rows;
  } catch {
    return [];
  }
}

/**
 * Pending seller applications for admin review (server-only; admin SDK).
 */
export async function listPendingSellerApplications(): Promise<
  AdminSellerApplication[]
> {
  const rows = await listSellerProfilesAdmin({ status: PENDING_STATUS });
  const apps: AdminSellerApplication[] = [];
  for (const row of rows) {
    if (row.status !== PENDING_STATUS) continue;
    apps.push({
      $id: row.$id,
      userId: row.userId,
      shopName: row.shopName,
      slug: row.slug,
      bio: row.bio,
      status: PENDING_STATUS,
      $createdAt: row.$createdAt,
    });
  }
  return apps;
}

/** True when at least one seller application awaits admin review. */
export async function hasPendingSellerApplications(): Promise<boolean> {
  const rows = await listSellerProfilesAdmin({
    status: PENDING_STATUS,
    limit: 1,
  });
  return rows.some((row) => row.status === PENDING_STATUS);
}

/**
 * Approve a pending seller application: status → approved, set seller-only label, audit.
 * ponytail: status update + label update are not atomic; compensating revert on label failure.
 */
export async function approveSellerApplicationCore(
  adminUserId: string,
  sellerProfileId: string,
): Promise<SellerApprovalResult> {
  const loaded = await loadSellerProfileRow(sellerProfileId);
  if (!loaded) {
    return { ok: false, error: "Seller application not found." };
  }

  const { profile } = loaded;
  if (profile.status !== PENDING_STATUS) {
    return {
      ok: false,
      error: `Application is already ${profile.status}. Only pending applications can be approved.`,
    };
  }

  const { tables, users } = await createAdminClient();

  try {
    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_SELLER_PROFILES,
      rowId: profile.$id,
      data: {
        status: APPROVED_STATUS,
        rejectionReason: null,
      },
    });
  } catch {
    return { ok: false, error: "Failed to update seller application status." };
  }

  try {
    await users.get({ userId: profile.userId });
    await users.updateLabels({
      userId: profile.userId,
      labels: exclusiveSellerLabels(),
    });
  } catch {
    try {
      await tables.updateRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_SELLER_PROFILES,
        rowId: profile.$id,
        data: { status: PENDING_STATUS },
      });
    } catch {
      return {
        ok: false,
        error:
          "Approval failed and could not revert status. Contact an operator. The profile may be stuck in approved without a seller label.",
      };
    }
    return {
      ok: false,
      error:
        "Could not grant seller label. Application reverted to pending. Please retry.",
    };
  }

  try {
    await writeAuditLog({
      actorId: adminUserId,
      event: "seller.approved",
      resourceType: "seller_profile",
      resourceId: profile.$id,
      meta: {
        userId: profile.userId,
        shopName: profile.shopName,
        slug: profile.slug,
      },
    });
  } catch {
    return {
      ok: false,
      error:
        "Seller approved and label granted, but audit log failed. Please notify an operator.",
    };
  }

  await notifyUserEvent(profile.userId, {
    type: "seller.approved",
    title: "Seller application approved",
    body: `Your shop "${profile.shopName}" was approved. You can open the seller portal and start listing.`,
    link: "/seller",
  });

  return { ok: true, message: `${profile.shopName} approved as seller.` };
}

/**
 * Reject a pending seller application: status → rejected, store reason, audit.
 * Does not modify Auth labels.
 */
export async function rejectSellerApplicationCore(
  adminUserId: string,
  sellerProfileId: string,
  reason: string,
): Promise<SellerApprovalResult> {
  const trimmedReason = reason.trim();
  if (!trimmedReason) {
    return { ok: false, error: "Rejection reason is required." };
  }
  if (trimmedReason.length > MAX_REJECTION_REASON) {
    return {
      ok: false,
      error: `Rejection reason must be at most ${MAX_REJECTION_REASON} characters.`,
    };
  }

  const loaded = await loadSellerProfileRow(sellerProfileId);
  if (!loaded) {
    return { ok: false, error: "Seller application not found." };
  }

  const { profile } = loaded;
  if (profile.status !== PENDING_STATUS) {
    return {
      ok: false,
      error: `Application is already ${profile.status}. Only pending applications can be rejected.`,
    };
  }

  const { tables } = await createAdminClient();

  try {
    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_SELLER_PROFILES,
      rowId: profile.$id,
      data: {
        status: REJECTED_STATUS,
        rejectionReason: trimmedReason,
      },
    });
  } catch {
    return { ok: false, error: "Failed to reject seller application." };
  }

  try {
    await writeAuditLog({
      actorId: adminUserId,
      event: "seller.rejected",
      resourceType: "seller_profile",
      resourceId: profile.$id,
      meta: {
        userId: profile.userId,
        shopName: profile.shopName,
        slug: profile.slug,
        reason: trimmedReason,
      },
    });
  } catch {
    return {
      ok: false,
      error:
        "Application rejected but audit log failed. Please notify an operator.",
    };
  }

  await notifyUserEvent(profile.userId, {
    type: "seller.rejected",
    title: "Seller application not approved",
    body: `Your application for "${profile.shopName}" was not approved.`,
    link: "/become-seller",
    detailLines: [`Reason: ${trimmedReason}`],
  });

  return { ok: true, message: `${profile.shopName} rejected.` };
}
