import type { Models } from "node-appwrite";
import type { SellerStatus } from "@/lib/types";
import { getOwnSellerProfile } from "@/lib/services/seller-application";
import { homePathForUser, postLoginPath, userHasLabel } from "./roles";

type LabeledUser = { $id?: string; labels?: string[] };

/**
 * Pending seller status is stored on seller_profiles, not Auth labels.
 * Skip the extra read when labels already decide the home path.
 */
export async function loadSellerStatus(
  user: LabeledUser,
): Promise<SellerStatus | null> {
  if (userHasLabel(user, "admin") || userHasLabel(user, "seller")) {
    return null;
  }
  const profile = await getOwnSellerProfile();
  return profile?.status ?? null;
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
