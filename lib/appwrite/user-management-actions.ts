"use server";

import { revalidatePath } from "next/cache";
import { ROLE_LABELS, userHasLabel } from "@/lib/appwrite/roles";
import { getLoggedInUser } from "@/lib/appwrite/session";
import {
  suspendUserCore,
  unsuspendUserCore,
} from "@/lib/services/user-management";

export type UserManagementActionState = {
  success?: string;
  error?: string;
};

async function assertAdmin(): Promise<
  { ok: true; userId: string } | { ok: false; error: string }
> {
  const user = await getLoggedInUser();
  if (!user) {
    return { ok: false, error: "Unauthorized" };
  }
  if (!userHasLabel(user, ROLE_LABELS.admin)) {
    return { ok: false, error: "Unauthorized" };
  }
  return { ok: true, userId: user.$id };
}

function revalidateUserPaths(): void {
  revalidatePath("/admin/users");
  revalidatePath("/admin");
}

export async function suspendUser(
  _prev: UserManagementActionState,
  formData: FormData,
): Promise<UserManagementActionState> {
  const auth = await assertAdmin();
  if (!auth.ok) return { error: auth.error };

  const userId = formData.get("userId");
  if (typeof userId !== "string" || !userId.trim()) {
    return { error: "Missing user." };
  }

  const reason = formData.get("reason");
  if (typeof reason !== "string" || !reason.trim()) {
    return { error: "Suspension reason is required." };
  }

  const result = await suspendUserCore(auth.userId, userId.trim(), reason);
  if (!result.ok) return { error: result.error };

  revalidateUserPaths();
  return { success: result.message };
}

export async function unsuspendUser(
  _prev: UserManagementActionState,
  formData: FormData,
): Promise<UserManagementActionState> {
  const auth = await assertAdmin();
  if (!auth.ok) return { error: auth.error };

  const userId = formData.get("userId");
  if (typeof userId !== "string" || !userId.trim()) {
    return { error: "Missing user." };
  }

  const result = await unsuspendUserCore(auth.userId, userId.trim());
  if (!result.ok) return { error: result.error };

  revalidateUserPaths();
  return { success: result.message };
}
