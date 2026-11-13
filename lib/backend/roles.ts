import { redirect } from "next/navigation";
import type { SellerStatus } from "@/lib/types";
import type { Models } from "@/lib/db/compat";
import type { SessionUser } from "./session";
import { getLoggedInUser } from "./session";

/** Auth labels used for marketplace roles. */
export const ROLE_LABELS = {
  buyer: "buyer",
  seller: "seller",
  admin: "admin",
} as const;

export type RoleLabel = (typeof ROLE_LABELS)[keyof typeof ROLE_LABELS];

type LabeledUser = { labels?: string[] };

export function userHasLabel(user: LabeledUser, label: RoleLabel): boolean {
  if (!Array.isArray(user.labels)) return false;
  if (user.labels.includes(label)) return true;
  // Legacy accounts used label "user" instead of "buyer".
  return label === ROLE_LABELS.buyer && user.labels.includes("user");
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

const PUBLIC_CATALOG_EXACT = new Set([
  "/",
  "/market",
  "/search",
  "/categories",
  "/faq",
]);

const PUBLIC_CATALOG_PREFIXES = [
  "/categories/",
  "/products/",
  "/shop/",
  "/legal/",
] as const;

/**
 * Public browse routes admins and labeled sellers may open.
 * Buyer account hubs (requests, wishlist, dashboard) stay excluded.
 */
export function pathIsPublicCatalog(path: string): boolean {
  const pathname = pathnameOf(path);
  if (PUBLIC_CATALOG_EXACT.has(pathname)) return true;
  return PUBLIC_CATALOG_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/** Approved portal roles may browse the public catalog while signed in. */
export function mayBrowsePublicCatalog(user: LabeledUser): boolean {
  return (
    userHasLabel(user, ROLE_LABELS.admin) ||
    userHasLabel(user, ROLE_LABELS.seller)
  );
}

const AUTH_PREFIXES = [
  "/login",
  "/register",
  "/account",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/oauth",
] as const;

function pathIsAuth(path: string): boolean {
  const pathname = pathnameOf(path);
  return AUTH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Buyer-only commerce (catalog, requests, wishlist, buyer hub).
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
  return homePathForUser(user, sellerStatus) !== "/";
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
  if (sellerStatus === "pending" || sellerStatus === "rejected") {
    return "/seller/pending";
  }
  if (userHasLabel(user, "seller")) {
    return "/seller";
  }
  return "/";
}

/**
 * Post-login destination: honor a safe `next` only when the user may visit it.
 * Admins and sellers may land on the public catalog; buyer-account hubs and
 * pending applicants still resolve to the role home.
 */
export function postLoginPath(
  user: LabeledUser,
  next?: string | null,
  sellerStatus?: SellerStatus | null,
): string {
  const roleHome = homePathForUser(user, sellerStatus);
  const safe = safeNextPath(next ?? undefined);
  if (!safe) return roleHome;

  if (sellerStatus === "pending" || sellerStatus === "rejected") {
    if (pathnameOf(safe) === "/seller/pending") {
      return safe;
    }
    return roleHome;
  }

  if (pathIsPortal(safe, "/admin") && !userHasLabel(user, "admin")) {
    return roleHome;
  }

  if (pathIsPortal(safe, "/seller")) {
    const pendingPage = pathnameOf(safe) === "/seller/pending";
    if (pendingPage) {
      if (userHasLabel(user, "seller")) return "/seller";
      return roleHome;
    }
    if (!userHasLabel(user, "seller")) {
      return roleHome;
    }
  }

  if (
    pathIsPublicCatalog(safe) &&
    mayBrowsePublicCatalog(user)
  ) {
    return safe;
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
