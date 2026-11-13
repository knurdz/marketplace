import { and, desc, eq, gt, like, or } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import { ROLE_LABELS } from "@/lib/backend/roles";
import { hasDatabaseConfig } from "@/lib/backend/config";
import { createAdminClient } from "@/lib/backend/server";
import { getLoggedInUser } from "@/lib/backend/session";
import { getDb, newId } from "@/lib/db/client";
import {
  authAccount,
  authUser,
  notifications,
  profiles,
  purchaseRequests,
  sellerProfiles,
  wishlistItems,
} from "@/lib/db/schema";
import {
  isPasswordBreached,
  MAX_PASSWORD_LENGTH,
} from "@/lib/security/password";
import { userIsSuperAdmin } from "@/lib/security/super-admin";
import { writeAuditLog } from "./audit-logs";

const PAGE_SIZE = 25;
const MAX_NAME_LENGTH = 255;
const MAX_EMAIL_LENGTH = 255;
const MIN_PASSWORD_LENGTH = 8;
const MAX_SUSPEND_REASON = 500;

export type AdminAccountView = {
  userId: string;
  email: string;
  name: string;
  isSuperAdmin: boolean;
  suspended: boolean;
  $createdAt?: string;
};

export type AdminAccountListResult = {
  admins: AdminAccountView[];
  total: number;
  nextCursor: string | null;
};

export type AdminAccountResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

function normalizeAdminEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

function toAdminView(row: {
  id: string;
  email: string;
  name: string;
  disabled: boolean;
  isSuperAdmin: boolean;
  createdAt?: Date;
}): AdminAccountView {
  return {
    userId: row.id,
    email: row.email,
    name: row.name,
    isSuperAdmin: row.isSuperAdmin,
    suspended: row.disabled,
    $createdAt: row.createdAt?.toISOString(),
  };
}

async function assertSuperAdminActor(): Promise<
  { ok: true; userId: string } | { ok: false; error: string }
> {
  const user = await getLoggedInUser();
  if (!user) {
    return { ok: false, error: "Unauthorized" };
  }
  if (!userIsSuperAdmin(user)) {
    return { ok: false, error: "Unauthorized" };
  }
  return { ok: true, userId: user.$id };
}

async function loadAdminUser(
  userId: string,
): Promise<(typeof authUser.$inferSelect) | null> {
  const trimmed = userId?.trim();
  if (!trimmed) return null;
  const db = getDb();
  const rows = await db
    .select()
    .from(authUser)
    .where(eq(authUser.id, trimmed))
    .limit(1);
  return rows[0] ?? null;
}

function assertTargetIsMutableAdmin(
  actorId: string,
  target: typeof authUser.$inferSelect,
): AdminAccountResult | null {
  if (target.id === actorId) {
    return { ok: false, error: "You cannot modify your own account here." };
  }
  if (target.role !== ROLE_LABELS.admin) {
    return { ok: false, error: "Target is not an admin account." };
  }
  if (target.isSuperAdmin) {
    return { ok: false, error: "The superadmin account cannot be modified." };
  }
  return null;
}

export async function listAdminAccounts(params?: {
  search?: string;
  cursor?: string;
}): Promise<AdminAccountListResult> {
  const auth = await assertSuperAdminActor();
  if (!auth.ok) {
    return { admins: [], total: 0, nextCursor: null };
  }
  if (!hasDatabaseConfig()) {
    return { admins: [], total: 0, nextCursor: null };
  }

  const search = params?.search?.trim().slice(0, 256);
  const cursor = params?.cursor?.trim();

  const db = getDb();
  const conditions = [eq(authUser.role, ROLE_LABELS.admin)];
  if (cursor) {
    conditions.push(gt(authUser.id, cursor));
  }
  if (search) {
    const term = search.replace(/[%_]/g, "").trim();
    if (term) {
      const pattern = `%${term}%`;
      conditions.push(
        or(like(authUser.email, pattern), like(authUser.name, pattern))!,
      );
    }
  }

  const rows = await db
    .select()
    .from(authUser)
    .where(and(...conditions))
    .orderBy(desc(authUser.createdAt))
    .limit(PAGE_SIZE);

  const admins = rows.map(toAdminView);
  const last = admins.at(-1);
  const nextCursor =
    admins.length === PAGE_SIZE && last ? last.userId : null;

  return {
    admins,
    total: admins.length,
    nextCursor,
  };
}

export async function createAdminAccountCore(
  actorId: string,
  input: { name: string; email: string; password: string },
): Promise<AdminAccountResult> {
  const name = input.name.trim();
  const email = normalizeAdminEmail(input.email);
  const password = input.password;

  if (!name) {
    return { ok: false, error: "Name is required." };
  }
  if (name.length > MAX_NAME_LENGTH) {
    return { ok: false, error: "Name is too long." };
  }
  if (!email || !email.includes("@")) {
    return { ok: false, error: "A valid email is required." };
  }
  if (email.length > MAX_EMAIL_LENGTH) {
    return { ok: false, error: "Email is too long." };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    };
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return { ok: false, error: "Password is too long." };
  }
  if (await isPasswordBreached(password)) {
    return {
      ok: false,
      error: "This password appears in a known breach. Choose a different password.",
    };
  }

  const db = getDb();
  const existing = await db
    .select({ id: authUser.id })
    .from(authUser)
    .where(eq(authUser.email, email))
    .limit(1);
  if (existing[0]) {
    return { ok: false, error: "An account with this email already exists." };
  }

  const userId = newId();
  const hashed = await hashPassword(password);

  try {
    await db.transaction(async (tx) => {
      await tx.insert(authUser).values({
        id: userId,
        email,
        name,
        emailVerified: true,
        role: ROLE_LABELS.admin,
        disabled: false,
        isSuperAdmin: false,
      });
      await tx.insert(authAccount).values({
        id: newId(),
        accountId: userId,
        providerId: "credential",
        userId,
        password: hashed,
      });
      await tx.insert(profiles).values({
        id: userId,
        userId,
        displayName: name.slice(0, 128),
        registrationComplete: true,
      });
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message.slice(0, 200) : "unknown";
    if (message.toLowerCase().includes("duplicate")) {
      return { ok: false, error: "An account with this email already exists." };
    }
    return { ok: false, error: "Failed to create admin account." };
  }

  try {
    await writeAuditLog({
      actorId,
      event: "admin.created",
      resourceType: "user",
      resourceId: userId,
      meta: { email },
    });
  } catch {
    return {
      ok: false,
      error:
        "Admin created but audit log failed. Please notify an operator.",
    };
  }

  return { ok: true, message: `Admin ${email} created.` };
}

export async function deleteAdminCore(
  actorId: string,
  targetUserId: string,
): Promise<AdminAccountResult> {
  const target = await loadAdminUser(targetUserId);
  if (!target) {
    return { ok: false, error: "User not found." };
  }
  const blocked = assertTargetIsMutableAdmin(actorId, target);
  if (blocked) return blocked;

  const db = getDb();
  const seller = await db
    .select({ id: sellerProfiles.id })
    .from(sellerProfiles)
    .where(eq(sellerProfiles.userId, target.id))
    .limit(1);
  if (seller[0]) {
    return {
      ok: false,
      error: "Remove seller activity before deleting this admin.",
    };
  }

  const buyerRequests = await db
    .select({ id: purchaseRequests.id })
    .from(purchaseRequests)
    .where(eq(purchaseRequests.buyerId, target.id))
    .limit(1);
  if (buyerRequests[0]) {
    return {
      ok: false,
      error: "This admin has purchase request history and cannot be deleted.",
    };
  }

  const sellerRequests = await db
    .select({ id: purchaseRequests.id })
    .from(purchaseRequests)
    .where(eq(purchaseRequests.sellerId, target.id))
    .limit(1);
  if (sellerRequests[0]) {
    return {
      ok: false,
      error: "This admin has purchase request history and cannot be deleted.",
    };
  }

  const email = target.email;

  try {
    await db.transaction(async (tx) => {
      await tx
        .delete(wishlistItems)
        .where(eq(wishlistItems.userId, target.id));
      await tx
        .delete(notifications)
        .where(eq(notifications.userId, target.id));
      await tx.delete(profiles).where(eq(profiles.userId, target.id));
      await tx.delete(authUser).where(eq(authUser.id, target.id));
    });
  } catch {
    return { ok: false, error: "Failed to delete admin account." };
  }

  try {
    await writeAuditLog({
      actorId,
      event: "admin.deleted",
      resourceType: "user",
      resourceId: target.id,
      meta: { email },
    });
  } catch {
    return {
      ok: false,
      error: "Admin deleted but audit log failed. Please notify an operator.",
    };
  }

  return { ok: true, message: `${email} deleted.` };
}

export async function blockAdminCore(
  actorId: string,
  targetUserId: string,
  reason: string,
): Promise<AdminAccountResult> {
  const trimmedReason = reason.trim();
  if (!trimmedReason) {
    return { ok: false, error: "Block reason is required." };
  }
  if (trimmedReason.length > MAX_SUSPEND_REASON) {
    return {
      ok: false,
      error: `Reason must be at most ${MAX_SUSPEND_REASON} characters.`,
    };
  }

  const target = await loadAdminUser(targetUserId);
  if (!target) {
    return { ok: false, error: "User not found." };
  }
  const blocked = assertTargetIsMutableAdmin(actorId, target);
  if (blocked) return blocked;

  if (target.disabled) {
    return { ok: true, message: "Admin is already blocked." };
  }

  const { users } = await createAdminClient();
  try {
    await users.updateStatus({ userId: target.id, status: false });
    await users.deleteSessions({ userId: target.id });
  } catch {
    return { ok: false, error: "Failed to block admin account." };
  }

  try {
    await writeAuditLog({
      actorId,
      event: "admin.blocked",
      resourceType: "user",
      resourceId: target.id,
      meta: { email: target.email, reason: trimmedReason },
    });
  } catch {
    return {
      ok: false,
      error: "Admin blocked but audit log failed. Please notify an operator.",
    };
  }

  return { ok: true, message: `${target.email} blocked.` };
}

export async function unblockAdminCore(
  actorId: string,
  targetUserId: string,
): Promise<AdminAccountResult> {
  const target = await loadAdminUser(targetUserId);
  if (!target) {
    return { ok: false, error: "User not found." };
  }
  const blocked = assertTargetIsMutableAdmin(actorId, target);
  if (blocked) return blocked;

  if (!target.disabled) {
    return { ok: true, message: "Admin is already active." };
  }

  const { users } = await createAdminClient();
  try {
    await users.updateStatus({ userId: target.id, status: true });
  } catch {
    return { ok: false, error: "Failed to unblock admin account." };
  }

  try {
    await writeAuditLog({
      actorId,
      event: "admin.unblocked",
      resourceType: "user",
      resourceId: target.id,
      meta: { email: target.email },
    });
  } catch {
    return {
      ok: false,
      error: "Admin unblocked but audit log failed. Please notify an operator.",
    };
  }

  return { ok: true, message: `${target.email} unblocked.` };
}
