import type { Models } from "node-appwrite";
import { redirect } from "next/navigation";
import type { SellerStatus } from "@/lib/types";
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

/** FAQ / legal stay reachable without mixing buyer commerce. */
export function pathIsPublicStoreException(path: string): boolean {
  const pathname = pathnameOf(path);
  return pathname === "/faq" || pathname.startsWith("/legal/");
}

const AUTH_PREFIXES = [
  "/login",
  "/register",
  "/account",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
] as const;

function pathIsAuth(path: string): boolean {
  const pathname = pathnameOf(path);
  return AUTH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Buyer-only commerce (catalog, cart, checkout, buyer hub).
 * Portals, auth, FAQ, and legal are excluded.
 */
export function pathIsBuyerCommerce(path: string): boolean {
  if (pathIsPublicStoreException(path) || pathIsAuth(path)) return false;
  if (pathIsPortal(path, "/admin") || pathIsPortal(path, "/seller")) {
    return false;
  }
  return true;
}

export function shouldLeaveBuyerStorefront(
  user: LabeledUser,
  sellerStatus?: SellerStatus | null,
): boolean {
  return homePathForUser(user, sellerStatus) !== "/market";
}

/**
 * Default destination after login/register.
 * Pass seller profile status so pending applicants do not land on the market.
 */
export function homePathForUser(
  user: LabeledUser,
  sellerStatus?: SellerStatus | null,
): string {
  if (userHasLabel(user, "admin")) {
    return "/admin";
  }
  if (userHasLabel(user, "seller")) {
    return "/seller";
  }
  if (sellerStatus === "pending" || sellerStatus === "rejected") {
    return "/seller/pending";
  }
  if (!userHasLabel(user, "buyer")) {
    // No buyer label and no seller application — avoid /seller/pending loop
    // when seller_profiles row is missing or unreadable.
    return "/account";
  }
  return "/market";
}

/**
 * Post-login destination: honor a safe `next` only when the user may visit it.
 * Admins and sellers (and pending applicants) cannot be sent into buyer commerce.
 */
export function postLoginPath(
  user: LabeledUser,
  next?: string | null,
  sellerStatus?: SellerStatus | null,
): string {
  const roleHome = homePathForUser(user, sellerStatus);
  const safe = safeNextPath(next ?? undefined);
  if (!safe) return roleHome;

  if (pathIsPortal(safe, "/admin") && !userHasLabel(user, "admin")) {
    return roleHome;
  }

  if (pathIsPortal(safe, "/seller")) {
    const pendingPage = pathnameOf(safe) === "/seller/pending";
    if (pendingPage) {
      if (userHasLabel(user, "seller")) return "/seller";
      if (sellerStatus === "pending" || sellerStatus === "rejected") {
        return safe;
      }
      return roleHome;
    }
    if (!userHasLabel(user, "seller")) {
      return roleHome;
    }
  }

  if (
    pathIsBuyerCommerce(safe) &&
    shouldLeaveBuyerStorefront(user, sellerStatus)
  ) {
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
 * Labels are set only via admin API (register → buyer; seller after approval).
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
