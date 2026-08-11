import type { ReactNode } from "react";
import { PortalShell } from "@/components/layout/portal-shell";
import { requireLabel } from "@/lib/appwrite/roles";

const SELLER_NAV = [
  { href: "/seller", label: "Dashboard" },
  { href: "/seller#listings", label: "Listings" },
  { href: "/seller#orders", label: "Orders" },
  { href: "/seller#settings", label: "Settings" },
];

export default async function SellerLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireLabel("seller");

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
