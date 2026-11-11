import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getOwnProfile } from "./profiles";
import { safeNextPath } from "./roles";
import { getLoggedInUser } from "./session";

function pathnameOf(path: string): string {
  return path.split("?")[0]?.split("#")[0] ?? path;
}

/** Routes incomplete registrants may visit without finishing /register/complete. */
export function pathAllowsIncompleteRegistration(path: string): boolean {
  const pathname = pathnameOf(path);
  if (pathname === "/register/complete") return true;
  if (pathname === "/oauth" || pathname.startsWith("/oauth/")) return true;
  if (pathname.startsWith("/api/auth")) return true;
  // Email links must stay reachable even with a half-finished session.
  if (
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/verify-email"
  ) {
    return true;
  }
  if (pathname === "/faq" || pathname.startsWith("/legal/")) return true;
  return false;
}

export function registrationCompletePath(next?: string | null): string {
  const safe = safeNextPath(next ?? undefined);
  if (!safe || safe === "/register/complete") return "/register/complete";
  return `/register/complete?next=${encodeURIComponent(safe)}`;
}

/**
 * Redirect signed-in users with incomplete registration away from the app
 * until they finish /register/complete (except oauth + complete itself).
 */
export async function redirectIfRegistrationIncomplete(
  pathname?: string,
): Promise<void> {
  const user = await getLoggedInUser();
  if (!user) return;

  const path =
    pathname ?? (await headers()).get("x-knurdz-pathname") ?? "";
  if (pathAllowsIncompleteRegistration(path)) return;

  const profile = await getOwnProfile();
  if (profile?.registrationComplete) return;

  redirect(registrationCompletePath());
}
