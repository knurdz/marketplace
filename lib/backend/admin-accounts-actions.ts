"use server";

import { revalidatePath } from "next/cache";
import { getLoggedInUser } from "@/lib/backend/session";
import {
  assertAdminMutationRateLimit,
  RATE_LIMIT_MESSAGE,
} from "@/lib/security/rate-limit";
import { userIsSuperAdmin } from "@/lib/security/super-admin";
import {
  blockAdminCore,
  createAdminAccountCore,
  deleteAdminCore,
  unblockAdminCore,
} from "@/lib/services/admin-accounts";

export type AdminAccountsActionState = {
  success?: string;
  error?: string;
};

async function assertSuperAdminMutation(): Promise<
  { ok: true; userId: string } | { ok: false; error: string }
> {
  const user = await getLoggedInUser();
  if (!user) {
    return { ok: false, error: "Unauthorized" };
  }
  if (!userIsSuperAdmin(user)) {
    return { ok: false, error: "Unauthorized" };
  }
  if (!(await assertAdminMutationRateLimit(user.$id)).ok) {
    return { ok: false, error: RATE_LIMIT_MESSAGE };
  }
  return { ok: true, userId: user.$id };
}

function revalidateAdminAccounts(): void {
  revalidatePath("/admin/admins");
  revalidatePath("/admin");
}

export async function createAdminAccount(
  _prev: AdminAccountsActionState,
  formData: FormData,
): Promise<AdminAccountsActionState> {
  const auth = await assertSuperAdminMutation();
  if (!auth.ok) return { error: auth.error };

  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof name !== "string" || typeof email !== "string") {
    return { error: "Name and email are required." };
  }
  if (typeof password !== "string" || !password) {
    return { error: "Password is required." };
  }

  const result = await createAdminAccountCore(auth.userId, {
    name,
    email,
    password,
  });
  if (!result.ok) return { error: result.error };

  revalidateAdminAccounts();
  return { success: result.message };
}

export async function blockAdminAccount(
  _prev: AdminAccountsActionState,
  formData: FormData,
): Promise<AdminAccountsActionState> {
  const auth = await assertSuperAdminMutation();
  if (!auth.ok) return { error: auth.error };

  const userId = formData.get("userId");
  const reason = formData.get("reason");
  if (typeof userId !== "string" || !userId.trim()) {
    return { error: "Missing admin." };
  }
  if (typeof reason !== "string" || !reason.trim()) {
    return { error: "Block reason is required." };
  }

  const result = await blockAdminCore(auth.userId, userId.trim(), reason);
  if (!result.ok) return { error: result.error };

  revalidateAdminAccounts();
  return { success: result.message };
}

export async function unblockAdminAccount(
  _prev: AdminAccountsActionState,
  formData: FormData,
): Promise<AdminAccountsActionState> {
  const auth = await assertSuperAdminMutation();
  if (!auth.ok) return { error: auth.error };

  const userId = formData.get("userId");
  if (typeof userId !== "string" || !userId.trim()) {
    return { error: "Missing admin." };
  }

  const result = await unblockAdminCore(auth.userId, userId.trim());
  if (!result.ok) return { error: result.error };

  revalidateAdminAccounts();
  return { success: result.message };
}

export async function deleteAdminAccount(
  _prev: AdminAccountsActionState,
  formData: FormData,
): Promise<AdminAccountsActionState> {
  const auth = await assertSuperAdminMutation();
  if (!auth.ok) return { error: auth.error };

  const userId = formData.get("userId");
  if (typeof userId !== "string" || !userId.trim()) {
    return { error: "Missing admin." };
  }

  const result = await deleteAdminCore(auth.userId, userId.trim());
  if (!result.ok) return { error: result.error };

  revalidateAdminAccounts();
  return { success: result.message };
}
