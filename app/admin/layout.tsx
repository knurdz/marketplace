import type { ReactNode } from "react";
import {
  PortalShell,
  type PortalNavGroup,
} from "@/components/layout/portal-shell";
import { redirectIfRegistrationIncomplete } from "@/lib/appwrite/registration-complete";
import { requireLabel } from "@/lib/appwrite/roles";
import { hasPendingSellerApplications } from "@/lib/services/seller-approvals";

function buildAdminNav(pendingSellers: boolean): PortalNavGroup[] {
  return [
    {
      items: [{ href: "/admin", label: "Dashboard", icon: "dashboard" }],
    },
    {
      title: "Commerce",
      items: [
        { href: "/admin/listings", label: "Listings", icon: "listings" },
        { href: "/admin/categories", label: "Categories", icon: "categories" },
        { href: "/admin/requests", label: "Requests", icon: "orders" },
      ],
    },
    {
      title: "People",
      items: [
        {
          href: "/admin/sellers",
          label: "Sellers",
          icon: "sellers",
          showDot: pendingSellers,
        },
        { href: "/admin/buyers", label: "Buyers", icon: "users" },
        {
          href: "/admin/sellers/performance",
          label: "Performance",
          icon: "performance",
        },
        { href: "/admin/trust", label: "Trust", icon: "trust" },
        { href: "/admin/reports", label: "Reports", icon: "reports" },
        { href: "/admin/reviews", label: "Reviews", icon: "reports" },
      ],
    },
    {
      title: "System",
      items: [
        { href: "/admin/settings", label: "Settings", icon: "settings" },
        { href: "/admin/audit", label: "Audit", icon: "audit" },
      ],
    },
  ];
}

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireLabel("admin");
  await redirectIfRegistrationIncomplete();
  const pendingSellers = await hasPendingSellerApplications();

  return (
    <PortalShell
      title="Admin"
      homeHref="/admin"
      nav={buildAdminNav(pendingSellers)}
    >
      {children}
    </PortalShell>
  );
}
