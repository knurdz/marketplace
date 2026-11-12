import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  PortalShell,
  type PortalNavGroup,
} from "@/components/layout/portal-shell";
import { redirectIfRegistrationIncomplete } from "@/lib/backend/registration-complete";
import { requireLabel } from "@/lib/backend/roles";
import { buildNoIndexMetadata } from "@/lib/seo/metadata";
import {
  getAdminPortalSidebarDots,
  type AdminPortalSidebarDots,
} from "@/lib/services/portal-sidebar-dots";

export const metadata: Metadata = buildNoIndexMetadata("Admin Portal");

function buildAdminNav(dots: AdminPortalSidebarDots): PortalNavGroup[] {
  return [
    {
      items: [{ href: "/admin", label: "Dashboard", icon: "dashboard" }],
    },
    {
      title: "Commerce",
      items: [
        {
          href: "/admin/listings",
          label: "Listings",
          icon: "listings",
          showDot: dots.listings,
        },
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
          showDot: dots.sellers,
        },
        { href: "/admin/buyers", label: "Buyers", icon: "users" },
        {
          href: "/admin/sellers/performance",
          label: "Performance",
          icon: "performance",
        },
        { href: "/admin/trust", label: "Trust", icon: "trust" },
        {
          href: "/admin/reports",
          label: "Reports",
          icon: "reports",
          showDot: dots.reports,
        },
        {
          href: "/admin/reviews",
          label: "Reviews",
          icon: "reports",
          showDot: dots.reviews,
        },
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
  const dots = await getAdminPortalSidebarDots();

  return (
    <PortalShell
      title="Admin"
      homeHref="/admin"
      nav={buildAdminNav(dots)}
    >
      {children}
    </PortalShell>
  );
}
