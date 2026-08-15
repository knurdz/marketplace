import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { PortalShell } from "@/components/layout/portal-shell";
import { ROLE_LABELS, requireUser, userHasLabel } from "@/lib/appwrite/roles";
import {
  blockedSellerPortalDestination,
  getOwnSellerProfile,
} from "@/lib/services/seller-application";

const SELLER_NAV = [
  { href: "/seller", label: "Dashboard" },
  { href: "/seller/shop", label: "Shop" },
  { href: "/seller/listings", label: "Listings" },
  { href: "/seller/orders", label: "Orders" },
  { href: "/seller/earnings", label: "Earnings" },
  { href: "/seller/settings", label: "Settings" },
];

export default async function SellerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();
  const hasSellerLabel = userHasLabel(user, ROLE_LABELS.seller);

  if (!hasSellerLabel) {
    const profile = await getOwnSellerProfile();
    const dest = blockedSellerPortalDestination(hasSellerLabel, profile);
    if (dest) redirect(dest);
  }

  return (
    <PortalShell
      title="Seller"
      subtitle="$ ./seller --portal"
      homeHref="/"
      nav={SELLER_NAV}
    >
      {children}
    </PortalShell>
  );
}
