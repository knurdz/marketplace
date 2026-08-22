import type { ReactNode } from "react";
import { PortalShell } from "@/components/layout/portal-shell";
import { requireLabel } from "@/lib/appwrite/roles";

const ADMIN_NAV = [
  {
    title: "Commerce",
    items: [
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/listings", label: "Listings" },
      { href: "/admin/categories", label: "Categories" },
      { href: "/admin/coupons", label: "Coupons" },
      { href: "/admin/orders", label: "Orders" },
    ],
  },
  {
    title: "People",
    items: [
      { href: "/admin/sellers", label: "Sellers" },
      { href: "/admin/sellers/performance", label: "Performance" },
      { href: "/admin/users", label: "Users" },
      { href: "/admin/trust", label: "Trust" },
      { href: "/admin/reports", label: "Reports" },
    ],
  },
  {
    title: "Payments",
    items: [
      { href: "/admin/payments/bank-slips", label: "Bank slips" },
      { href: "/admin/payments/notify-logs", label: "Notify logs" },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/admin/analytics", label: "Analytics" },
      { href: "/admin/settings", label: "Settings" },
      { href: "/admin/audit", label: "Audit" },
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
    <PortalShell title="Admin" homeHref="/market" nav={ADMIN_NAV}>
      {children}
    </PortalShell>
  );
}
