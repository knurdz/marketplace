import { ID, Query } from "node-appwrite";
import type { Models } from "node-appwrite";
import {
  DATABASE_ID,
  TABLE_AUDIT_LOGS,
  hasAppwritePublicConfig,
} from "@/lib/appwrite/config";
import { ROLE_LABELS, userHasLabel } from "@/lib/appwrite/roles";
import { createAdminClient } from "@/lib/appwrite/server";

const PAGE_SIZE = 25;
const MAX_SUSPEND_REASON = 500;

export type AdminUserView = {
  userId: string;
  email: string;
  name: string;
  labels: string[];
  suspended: boolean;
  isAdmin: boolean;
  $createdAt?: string;
};

export type UserListResult = {
  users: AdminUserView[];
  total: number;
  nextCursor: string | null;
};

export type UserManagementResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

function toAdminUserView(user: Models.User<Models.Preferences>): AdminUserView {
  const labels = Array.isArray(user.labels) ? user.labels : [];
  return {
    userId: user.$id,
    email: user.email ?? "",
    name: user.name ?? "",
    labels,
    suspended: user.status === false,
    isAdmin: userHasLabel(user, ROLE_LABELS.admin),
    $createdAt: user.$createdAt,
  };
}

async function writeAuditLog(params: {
  actorId: string;
  event: string;
  resourceType: string;
  resourceId: string;
  meta: Record<string, string>;
}): Promise<void> {
  const { tables } = await createAdminClient();
  await tables.createRow({
    databaseId: DATABASE_ID,
    tableId: TABLE_AUDIT_LOGS,
    rowId: ID.unique(),
    data: {
      actorId: params.actorId,
      event: params.event.slice(0, 128),
      resourceType: params.resourceType.slice(0, 64),
      resourceId: params.resourceId,
      meta: JSON.stringify(params.meta).slice(0, 4000),
    },
    permissions: [],
  });
}

async function loadTargetUser(
  userId: string,
): Promise<Models.User<Models.Preferences> | null> {
  const trimmed = userId?.trim();
  if (!trimmed) return null;

  const { users } = await createAdminClient();
  try {
    return await users.get({ userId: trimmed });
  } catch {
    return null;
  }
}

function assertCanModifyTarget(
  adminUserId: string,
  target: Models.User<Models.Preferences>,
  action: "suspend" | "unsuspend",
): UserManagementResult | null {
  if (target.$id === adminUserId) {
    return {
      ok: false,
      error: `You cannot ${action} your own account.`,
    };
  }
  if (action === "suspend" && userHasLabel(target, ROLE_LABELS.admin)) {
    return {
      ok: false,
      error: "Admin accounts cannot be suspended.",
    };
  }
  return null;
}

/**
 * Paginated platform users for admin review (server-only; admin SDK).
 */
export async function listUsers(params?: {
  search?: string;
  cursor?: string;
}): Promise<UserListResult> {
  if (!hasAppwritePublicConfig()) {
    return { users: [], total: 0, nextCursor: null };
  }

  const search = params?.search?.trim().slice(0, 256) || undefined;
  const cursor = params?.cursor?.trim() || undefined;

  const queries = [Query.limit(PAGE_SIZE), Query.orderDesc("$createdAt")];
  if (cursor) {
    queries.push(Query.cursorAfter(cursor));
  }

  const { users } = await createAdminClient();
  const result = await users.list({
    search,
    queries,
    total: true,
  });

  const page = result.users.map(toAdminUserView);
  const last = page.at(-1);
  const nextCursor =
    page.length === PAGE_SIZE && last ? last.userId : null;

  return {
    users: page,
    total: result.total ?? page.length,
    nextCursor,
  };
}

/**
 * Suspend a user: disable Auth account, delete all sessions, audit once.
 */
export async function suspendUserCore(
  adminUserId: string,
  targetUserId: string,
  reason: string,
): Promise<UserManagementResult> {
  const trimmedReason = reason.trim();
  if (!trimmedReason) {
    return { ok: false, error: "Suspension reason is required." };
  }
  if (trimmedReason.length > MAX_SUSPEND_REASON) {
    return {
      ok: false,
      error: `Reason must be at most ${MAX_SUSPEND_REASON} characters.`,
    };
  }

  const target = await loadTargetUser(targetUserId);
  if (!target) {
    return { ok: false, error: "User not found." };
  }

  const blocked = assertCanModifyTarget(adminUserId, target, "suspend");
  if (blocked) return blocked;

  if (target.status === false) {
    return { ok: true, message: "User is already suspended." };
  }

  const { users } = await createAdminClient();

  try {
    await users.updateStatus({ userId: target.$id, status: false });
  } catch {
    return { ok: false, error: "Failed to suspend user account." };
  }

  try {
    await users.deleteSessions({ userId: target.$id });
  } catch {
    return {
      ok: false,
      error:
        "Account disabled but sessions could not be cleared. Contact an operator.",
    };
  }

  try {
    await writeAuditLog({
      actorId: adminUserId,
      event: "user.suspended",
      resourceType: "user",
      resourceId: target.$id,
      meta: { reason: trimmedReason },
    });
  } catch {
    return {
      ok: false,
      error:
        "User suspended and sessions cleared, but audit log failed. Notify an operator.",
    };
  }

  const label = target.email || target.name || target.$id;
  return { ok: true, message: `${label} suspended.` };
}

/**
 * Unsuspend a user: re-enable Auth account, audit once.
 */
export async function unsuspendUserCore(
  adminUserId: string,
  targetUserId: string,
): Promise<UserManagementResult> {
  const target = await loadTargetUser(targetUserId);
  if (!target) {
    return { ok: false, error: "User not found." };
  }

  const blocked = assertCanModifyTarget(adminUserId, target, "unsuspend");
  if (blocked) return blocked;

  if (target.status !== false) {
    return { ok: true, message: "User is already active." };
  }

  const { users } = await createAdminClient();

  try {
    await users.updateStatus({ userId: target.$id, status: true });
  } catch {
    return { ok: false, error: "Failed to unsuspend user account." };
  }

  try {
    await writeAuditLog({
      actorId: adminUserId,
      event: "user.unsuspended",
      resourceType: "user",
      resourceId: target.$id,
      meta: {},
    });
  } catch {
    return {
      ok: false,
      error:
        "User unsuspended, but audit log failed. Notify an operator.",
    };
  }

  const label = target.email || target.name || target.$id;
  return { ok: true, message: `${label} unsuspended.` };
}
