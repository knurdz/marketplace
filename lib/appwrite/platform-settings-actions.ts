"use server";

/**
 * Admin-only platform settings write actions.
 * Core logic in lib/services/platform-settings-admin.ts.
 */

import { revalidatePath } from "next/cache";
import { ROLE_LABELS, userHasLabel } from "@/lib/appwrite/roles";
import { getLoggedInUser } from "@/lib/appwrite/session";
import { updatePlatformSettingCore } from "@/lib/services/platform-settings-admin";

export type PlatformSettingActionState = {
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

function revalidateSettingsPath(): void {
  revalidatePath("/admin/settings");
  revalidatePath("/admin");
}

export async function updatePlatformSetting(
  key: string,
  value: string,
  description?: string,
): Promise<PlatformSettingActionState> {
  const auth = await assertAdmin();
  if (!auth.ok) return { error: auth.error };

  if (typeof key !== "string" || !key.trim()) {
    return { error: "Missing setting key." };
  }
  if (typeof value !== "string") {
    return { error: "Missing value." };
  }

  const result = await updatePlatformSettingCore(
    auth.userId,
    key.trim(),
    value,
    description,
  );
  if (!result.ok) return { error: result.error };

  revalidateSettingsPath();
  return { success: result.message };
}

export async function updatePlatformSettingFormAction(
  _prev: PlatformSettingActionState,
  formData: FormData,
): Promise<PlatformSettingActionState> {
  const key = formData.get("key");
  const value = formData.get("value");
  const descriptionRaw = formData.get("description");

  if (typeof key !== "string" || !key.trim()) {
    return { error: "Missing setting key." };
  }
  if (typeof value !== "string") {
    return { error: "Missing value." };
  }

  const description =
    typeof descriptionRaw === "string" && descriptionRaw.trim()
      ? descriptionRaw.trim()
      : undefined;

  return updatePlatformSetting(key.trim(), value, description);
}
