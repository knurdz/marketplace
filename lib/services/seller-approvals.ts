import { and, desc, eq, ne, or, sql } from "drizzle-orm";
import { Query } from "@/lib/db/compat";
import {
  DATABASE_ID,
  TABLE_SELLER_PROFILES,
  hasDatabaseConfig,
} from "@/lib/backend/config";
import { ACTIVE_PRODUCT_STATUS } from "@/lib/types/status";
import { ROLE_LABELS } from "@/lib/backend/roles";
import { createAdminClient } from "@/lib/backend/server";
import { getDb } from "@/lib/db/client";
import { authUser, products, sellerProfiles } from "@/lib/db/schema";
import { notifyUserEvent } from "@/lib/email/events";
import { getUserAccountStateById } from "@/lib/backend/session";
import { assertAdminUser } from "@/lib/security/admin-auth";
import type { SellerProfile } from "@/lib/types";
import { isSellerStatus } from "@/lib/types";
import { writeAuditLog } from "./audit-logs";
import { escapeLikeWildcards } from "./products";
import { recordSellerApplicationRejectionAttempt } from "./seller-application-attempts";

const PENDING_STATUS = "pending" as const;
const APPROVED_STATUS = "approved" as const;
const REJECTED_STATUS = "rejected" as const;
const BANNED_STATUS = "banned" as const;
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
  accountSuspended?: boolean;
  /** Shop ban flow: account disabled and profile rejected. */
  shopBanned?: boolean;
  ownerEmail?: string;
  ownerName?: string;
};

export type AdminSellerListFilter = "pending" | "all" | "banned" | "suspended";

const ADMIN_SELLER_LIST_CAP = 100;
const ADMIN_SELLER_SEARCH_MAX = 256;

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
/**
 * Seller profiles for the admin table (search, filters, account state).
 * `banned` = profile status banned (report shop ban).
 * `suspended` = disabled auth account, excluding banned shops (those appear under Banned).
 */
export async function listSellerProfilesForAdminTable(opts?: {
  filter?: AdminSellerListFilter;
  search?: string;
}): Promise<AdminSellerRow[]> {
  await assertAdminUser();
  if (!hasDatabaseConfig()) return [];

  const filter = opts?.filter ?? "all";
  const search = opts?.search?.trim().slice(0, ADMIN_SELLER_SEARCH_MAX) ?? "";
  const conditions = [];

  if (filter === "pending") {
    conditions.push(eq(sellerProfiles.status, PENDING_STATUS));
  } else if (filter === "banned") {
    conditions.push(eq(sellerProfiles.status, BANNED_STATUS));
  } else if (filter === "suspended") {
    conditions.push(eq(authUser.disabled, true));
    conditions.push(ne(sellerProfiles.status, BANNED_STATUS));
  }

  if (search.length > 0) {
    const pattern = `%${escapeLikeWildcards(search.toLowerCase())}%`;
    conditions.push(
      or(
        sql`LOWER(${sellerProfiles.shopName}) LIKE ${pattern} ESCAPE ${"\\"}`,
        sql`LOWER(${sellerProfiles.slug}) LIKE ${pattern} ESCAPE ${"\\"}`,
        sql`LOWER(${authUser.email}) LIKE ${pattern} ESCAPE ${"\\"}`,
        sql`LOWER(${authUser.name}) LIKE ${pattern} ESCAPE ${"\\"}`,
      )!,
    );
  }

  try {
    const rows = await getDb()
      .select({
        id: sellerProfiles.id,
        userId: sellerProfiles.userId,
        shopName: sellerProfiles.shopName,
        slug: sellerProfiles.slug,
        bio: sellerProfiles.bio,
        status: sellerProfiles.status,
        rejectionReason: sellerProfiles.rejectionReason,
        createdAt: sellerProfiles.createdAt,
        disabled: authUser.disabled,
        ownerEmail: authUser.email,
        ownerName: authUser.name,
      })
      .from(sellerProfiles)
      .innerJoin(authUser, eq(sellerProfiles.userId, authUser.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(sellerProfiles.createdAt))
      .limit(ADMIN_SELLER_LIST_CAP);

    return rows.map((row) => ({
      $id: row.id,
      userId: row.userId,
      shopName: row.shopName,
      slug: row.slug,
      bio: row.bio,
      status: row.status,
      rejectionReason: row.rejectionReason,
      $createdAt: row.createdAt?.toISOString(),
      accountSuspended: row.disabled,
      shopBanned: row.status === BANNED_STATUS,
      ownerEmail: row.ownerEmail,
      ownerName: row.ownerName,
    }));
  } catch {
    return [];
  }
}

export async function listSellerProfilesAdmin(opts?: {
  status?: SellerProfile["status"];
  limit?: number;
}): Promise<AdminSellerRow[]> {
  if (!hasDatabaseConfig()) return [];
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
 * Approve a pending or previously rejected application: status → approved, seller label, audit.
 * Banned and approved profiles cannot be approved via this action.
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
  const priorStatus = profile.status;

  if (profile.status === BANNED_STATUS) {
    return {
      ok: false,
      error: "Banned shops cannot be approved. Unban the account first if this was a mistake.",
    };
  }
  if (profile.status === APPROVED_STATUS) {
    return {
      ok: false,
      error: "This shop is already approved.",
    };
  }
  if (profile.status !== PENDING_STATUS && profile.status !== REJECTED_STATUS) {
    return {
      ok: false,
      error: `Application is ${profile.status}. Only pending or rejected applications can be approved.`,
    };
  }

  const accountState = await getUserAccountStateById(profile.userId);
  if (accountState.status === "disabled") {
    return {
      ok: false,
      error:
        "This account is suspended. Unsuspend the user before approving the seller application.",
    };
  }
  if (accountState.status === "missing") {
    return { ok: false, error: "Seller account was not found." };
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
        data: { status: priorStatus },
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
      error: `Could not grant seller label. Application reverted to ${priorStatus}. Please retry.`,
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
  reason: string | null,
): Promise<SellerApprovalResult> {
  const trimmedReason = reason?.trim() || null;
  if (trimmedReason && trimmedReason.length > MAX_REJECTION_REASON) {
    return {
      ok: false,
      error: `Rejection reason must be at most ${MAX_REJECTION_REASON} characters.`,
    };
  }

  const loaded = await loadSellerProfileRow(sellerProfileId);
  if (!loaded) {
    return { ok: false, error: "Seller application not found." };
  }

  const { profile, row } = loaded;
  if (profile.status !== PENDING_STATUS) {
    return {
      ok: false,
      error: `Application is already ${profile.status}. Only pending applications can be rejected.`,
    };
  }

  const { tables } = await createAdminClient();

  try {
    await recordSellerApplicationRejectionAttempt({
      sellerProfileId: profile.$id,
      userId: profile.userId,
      shopName: profile.shopName,
      slug: profile.slug,
      bio: profile.bio,
      rejectionReason: trimmedReason,
      profileRow: row,
    });
  } catch {
    return {
      ok: false,
      error: "Failed to record application history.",
    };
  }

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
        ...(trimmedReason ? { reason: trimmedReason } : {}),
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
    link: "/seller/pending",
    ...(trimmedReason
      ? { detailLines: [`Message: ${trimmedReason}`] }
      : {}),
  });

  return { ok: true, message: `${profile.shopName} rejected.` };
}

/**
 * Unban a shop from a report ban: re-enable account, profile → approved, restore ban-hidden listings.
 */
export async function unbanShopCore(
  adminUserId: string,
  sellerProfileId: string,
): Promise<SellerApprovalResult> {
  const loaded = await loadSellerProfileRow(sellerProfileId);
  if (!loaded) {
    return { ok: false, error: "Seller shop not found." };
  }

  const { profile } = loaded;
  if (profile.status !== BANNED_STATUS) {
    return {
      ok: false,
      error: `Shop is ${profile.status}. Only banned shops can be unbanned.`,
    };
  }

  const accountState = await getUserAccountStateById(profile.userId);
  if (accountState.status === "disabled") {
    const { unsuspendUserCore } = await import("./user-management");
    const unsuspended = await unsuspendUserCore(adminUserId, profile.userId);
    if (!unsuspended.ok) return unsuspended;
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
    return { ok: false, error: "Failed to update shop status." };
  }

  try {
    await getDb()
      .update(products)
      .set({
        status: ACTIVE_PRODUCT_STATUS,
        hiddenByShopBan: false,
      })
      .where(
        and(
          eq(products.sellerId, profile.userId),
          eq(products.hiddenByShopBan, true),
        ),
      );
  } catch {
    return {
      ok: false,
      error: "Shop unbanned but listings could not be restored. Contact an operator.",
    };
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
        data: { status: BANNED_STATUS },
      });
    } catch {
      return {
        ok: false,
        error:
          "Unban failed and could not revert profile status. Contact an operator.",
      };
    }
    return {
      ok: false,
      error: "Could not grant seller label after unban. Profile reverted to banned.",
    };
  }

  try {
    await writeAuditLog({
      actorId: adminUserId,
      event: "shop.unbanned",
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
      error: "Shop unbanned but audit log failed. Please notify an operator.",
    };
  }

  return { ok: true, message: `${profile.shopName} unbanned. Listings hidden by the ban are live again.` };
}
