import { redirect } from "next/navigation";
import type { SessionUser } from "@/lib/backend/session";
import { getLoggedInUser } from "@/lib/backend/session";
import { ROLE_LABELS, userHasLabel } from "@/lib/backend/roles";

export function userIsSuperAdmin(user: SessionUser | null | undefined): boolean {
  return Boolean(user?.isSuperAdmin);
}

/** Server Components: require the singleton superadmin account. */
export async function requireSuperAdmin(): Promise<SessionUser> {
  const user = await getLoggedInUser();
  if (!user || !userHasLabel(user, ROLE_LABELS.admin) || !user.isSuperAdmin) {
    redirect("/admin");
  }
  return user;
}
