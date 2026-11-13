import { eq } from "drizzle-orm";
import type { Models } from "@/lib/db/compat";
import { getDb } from "@/lib/db/client";
import { profiles, sellerProfiles } from "@/lib/db/schema";
import { isSellerStatus, type SellerStatus } from "@/lib/types/status";
import { registrationCompletePath } from "./registration-complete";
import { homePathForUser, postLoginPath, userHasLabel } from "./roles";

type LabeledUser = { $id?: string; labels?: string[] };

async function isRegistrationCompleteForUser(
  userId: string | undefined,
): Promise<boolean> {
  if (!userId) return false;
  try {
    const rows = await getDb()
      .select({ registrationComplete: profiles.registrationComplete })
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);
    return Boolean(rows[0]?.registrationComplete);
  } catch {
    return false;
  }
}

/**
 * Pending seller status is stored on seller_profiles, not role labels.
 * Looked up by the caller's verified user id (not the request cookie), so it
 * also works right after sign-in, before the new session cookie is readable.
 */
export async function loadSellerStatus(
  user: LabeledUser,
): Promise<SellerStatus | null> {
  if (userHasLabel(user, "admin")) {
    return null;
  }
  if (!user.$id) return null;
  try {
    const rows = await getDb()
      .select({ status: sellerProfiles.status })
      .from(sellerProfiles)
      .where(eq(sellerProfiles.userId, user.$id))
      .limit(1);
    const status = rows[0]?.status;
    return isSellerStatus(status) ? status : null;
  } catch {
    return null;
  }
}

export async function resolveHomePath(
  user: LabeledUser | Models.User<Models.Preferences>,
): Promise<string> {
  if (!(await isRegistrationCompleteForUser(user.$id))) {
    return registrationCompletePath();
  }
  const sellerStatus = await loadSellerStatus(user);
  return homePathForUser(user, sellerStatus);
}

export async function resolvePostLoginPath(
  user: LabeledUser | Models.User<Models.Preferences>,
  next?: string | null,
): Promise<string> {
  if (!(await isRegistrationCompleteForUser(user.$id))) {
    return registrationCompletePath(next);
  }
  const sellerStatus = await loadSellerStatus(user);
  return postLoginPath(user, next, sellerStatus);
}
