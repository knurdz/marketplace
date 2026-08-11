import type { Models } from "node-appwrite";
import { redirect } from "next/navigation";
import { getLoggedInUser } from "./session";

/** Appwrite Auth labels used for marketplace roles. */
export const ROLE_LABELS = {
  buyer: "buyer",
  seller: "seller",
  admin: "admin",
} as const;

export type RoleLabel = (typeof ROLE_LABELS)[keyof typeof ROLE_LABELS];

export function userHasLabel(
  user: Models.User<Models.Preferences>,
  label: RoleLabel,
): boolean {
  return Array.isArray(user.labels) && user.labels.includes(label);
}

/** Require a signed-in user; redirect to login otherwise. */
export async function requireUser(): Promise<Models.User<Models.Preferences>> {
  const user = await getLoggedInUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

/**
 * Authoritative role gate for Server Components / layouts.
 * Labels are set only via admin API (register → buyer; seller/admin later).
 * Never trust UI-only checks.
 */
export async function requireLabel(
  label: Extract<RoleLabel, "seller" | "admin">,
): Promise<Models.User<Models.Preferences>> {
  const user = await requireUser();
  if (!userHasLabel(user, label)) {
    redirect("/");
  }
  return user;
}
