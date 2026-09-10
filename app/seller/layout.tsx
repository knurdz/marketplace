import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PendingSellerShell } from "@/components/layout/pending-seller-shell";
import {
  PortalShell,
  type PortalNavGroup,
} from "@/components/layout/portal-shell";
import { ROLE_LABELS, requireUser, userHasLabel } from "@/lib/appwrite/roles";
import {
  blockedSellerPortalDestination,
  getOwnSellerProfile,
} from "@/lib/services/seller-application";

const SELLER_NAV: PortalNavGroup[] = [
  {
    items: [
      { href: "/seller", label: "Dashboard", icon: "dashboard" },
      { href: "/seller/shop", label: "Shop", icon: "shop" },
      { href: "/seller/listings", label: "Listings", icon: "listings" },
      { href: "/seller/orders", label: "Orders", icon: "orders" },
      { href: "/seller/messages", label: "Messages", icon: "messages" },
      { href: "/seller/earnings", label: "Earnings", icon: "earnings" },
      { href: "/seller/settings", label: "Settings", icon: "settings" },
    ],
  },
];

export default async function SellerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();
  const hasSellerLabel = userHasLabel(user, ROLE_LABELS.seller);
  const pathname = (await headers()).get("x-knurdz-pathname") ?? "";
  const isPendingPage = pathname === "/seller/pending";

  if (hasSellerLabel) {
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
    const profile = await getOwnSellerProfile();
    if (!profile) {
      redirect("/market");
    }
    if (profile.status === "approved") {
      redirect("/seller");
    }
    return <PendingSellerShell>{children}</PendingSellerShell>;
  }

  const profile = await getOwnSellerProfile();
  const dest = blockedSellerPortalDestination(hasSellerLabel, profile);
  if (dest) {
    redirect(dest);
  }
  redirect("/");
}
