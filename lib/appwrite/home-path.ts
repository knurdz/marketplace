import { eq } from "drizzle-orm";
import type { Models } from "@/lib/db/appwrite-shim";
import { getDb } from "@/lib/db/client";
import { sellerProfiles } from "@/lib/db/schema";
import { isSellerStatus, type SellerStatus } from "@/lib/types/status";
import { homePathForUser, postLoginPath, userHasLabel } from "./roles";

type LabeledUser = { $id?: string; labels?: string[] };

/**
 * Pending seller status is stored on seller_profiles, not role labels.
 * Looked up by the caller's verified user id (not the request cookie), so it
 * also works right after sign-in, before the new session cookie is readable.
 */
export async function loadSellerStatus(
  user: LabeledUser,
): Promise<SellerStatus | null> {
  if (userHasLabel(user, "admin") || userHasLabel(user, "seller")) {
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
  const sellerStatus = await loadSellerStatus(user);
  return homePathForUser(user, sellerStatus);
}

export async function resolvePostLoginPath(
  user: LabeledUser | Models.User<Models.Preferences>,
  next?: string | null,
): Promise<string> {
  const sellerStatus = await loadSellerStatus(user);
  return postLoginPath(user, next, sellerStatus);
}
