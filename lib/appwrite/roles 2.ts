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

type LabeledUser = { labels?: string[] };

export function userHasLabel(user: LabeledUser, label: RoleLabel): boolean {
  return Array.isArray(user.labels) && user.labels.includes(label);
}

/** Only allow same-origin relative paths (blocks open redirects). */
export function safeNextPath(raw: string | undefined): string | null {
  if (!raw) return null;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("://")) {
    return null;
  }
  return raw;
}

function pathnameOf(path: string): string {
  return path.split("?")[0]?.split("#")[0] ?? path;
}

function pathIsPortal(path: string, portal: "/admin" | "/seller"): boolean {
  const pathname = pathnameOf(path);
  return pathname === portal || pathname.startsWith(`${portal}/`);
}

/**
 * Default destination after login/register. Admin wins if the user also has
 * seller. Buyers (and anyone without a portal label) go to the storefront.
 */
export function homePathForUser(user: LabeledUser): string {
  if (userHasLabel(user, "admin")) {
    return "/admin";
  }
  if (userHasLabel(user, "seller")) {
    return "/seller";
  }
  return "/";
}

/**
 * Post-login destination: honor a safe `next` only when the user may visit it.
 * `/admin*` requires the admin label; `/seller*` requires seller.
 */
export function postLoginPath(user: LabeledUser, next?: string | null): string {
  const roleHome = homePathForUser(user);
  const safe = safeNextPath(next ?? undefined);
  if (!safe) return roleHome;

  if (pathIsPortal(safe, "/admin") && !userHasLabel(user, "admin")) {
    return roleHome;
  }
  if (pathIsPortal(safe, "/seller") && !userHasLabel(user, "seller")) {
    return roleHome;
  }
  return safe;
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
