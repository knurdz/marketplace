import type { ReactNode } from "react";
import {
  PortalShell,
  type PortalNavGroup,
} from "@/components/layout/portal-shell";
import { requireLabel } from "@/lib/appwrite/roles";

const ADMIN_NAV: PortalNavGroup[] = [
  {
    title: "Commerce",
    items: [
      { href: "/admin", label: "Dashboard", icon: "dashboard" },
      { href: "/admin/listings", label: "Listings", icon: "listings" },
      { href: "/admin/categories", label: "Categories", icon: "categories" },
      { href: "/admin/coupons", label: "Coupons", icon: "coupons" },
      { href: "/admin/orders", label: "Orders", icon: "orders" },
    ],
  },
  {
    title: "People",
    items: [
      { href: "/admin/sellers", label: "Sellers", icon: "sellers" },
      {
        href: "/admin/sellers/performance",
        label: "Performance",
        icon: "performance",
      },
      { href: "/admin/users", label: "Users", icon: "users" },
      { href: "/admin/trust", label: "Trust", icon: "trust" },
      { href: "/admin/reports", label: "Reports", icon: "reports" },
    ],
  },
  {
    title: "Payments",
    items: [
      {
        href: "/admin/payments/bank-slips",
        label: "Bank slips",
        icon: "bankSlips",
      },
      {
        href: "/admin/payments/notify-logs",
        label: "Notify logs",
        icon: "notifyLogs",
      },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/admin/analytics", label: "Analytics", icon: "analytics" },
      { href: "/admin/settings", label: "Settings", icon: "settings" },
      { href: "/admin/audit", label: "Audit", icon: "audit" },
    ],
  },
];

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireLabel("admin");

  return (
    <PortalShell title="Admin" homeHref="/admin" nav={ADMIN_NAV}>
      {children}
    </PortalShell>
  );
}
