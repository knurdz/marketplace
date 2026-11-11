import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PendingSellerShell } from "@/components/layout/pending-seller-shell";
import {
  PortalShell,
  type PortalNavGroup,
} from "@/components/layout/portal-shell";
import { redirectIfRegistrationIncomplete } from "@/lib/backend/registration-complete";
import { ROLE_LABELS, requireUser, userHasLabel } from "@/lib/backend/roles";
import { buildNoIndexMetadata } from "@/lib/seo/metadata";
import {
  blockedSellerPortalDestination,
  getOwnSellerProfile,
} from "@/lib/services/seller-application";

export const metadata: Metadata = buildNoIndexMetadata("Seller Portal");

const SELLER_NAV: PortalNavGroup[] = [
  {
    items: [{ href: "/seller", label: "Dashboard", icon: "dashboard" }],
  },
  {
    title: "Shop",
    items: [
      { href: "/seller/shop", label: "Shop", icon: "shop" },
      { href: "/seller/listings", label: "Listings", icon: "listings" },
    ],
  },
  {
    title: "Sales",
    items: [
      { href: "/seller/requests", label: "Requests", icon: "orders" },
      { href: "/seller/reviews", label: "Reviews", icon: "reviews" },
    ],
  },
  {
    title: "Account",
    items: [{ href: "/seller/settings", label: "Settings", icon: "settings" }],
  },
];

export default async function SellerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();
  const pathname = (await headers()).get("x-knurdz-pathname") ?? "";
  await redirectIfRegistrationIncomplete(pathname);
  const hasSellerLabel = userHasLabel(user, ROLE_LABELS.seller);
  const isPendingPage = pathname === "/seller/pending";
  const profile = await getOwnSellerProfile();
  const hasApprovedSellerAccess =
    hasSellerLabel && profile?.status === "approved";

  if (hasApprovedSellerAccess) {
    if (isPendingPage) {
      redirect("/seller");
    }
    return (
      <PortalShell title="Seller" homeHref="/seller" nav={SELLER_NAV}>
        {children}
      </PortalShell>
    );
  }

  if (isPendingPage) {
    if (!profile) {
      redirect("/");
    }
    return <PendingSellerShell>{children}</PendingSellerShell>;
  }

  const dest = blockedSellerPortalDestination(false, profile);
  if (dest) {
    redirect(dest);
  }
  redirect("/");
}
