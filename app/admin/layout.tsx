import type { ReactNode } from "react";
import { PortalShell } from "@/components/layout/portal-shell";
import { requireLabel } from "@/lib/appwrite/roles";

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/sellers", label: "Sellers" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/listings", label: "Listings" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/payments/bank-slips", label: "Bank slips" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/audit", label: "Audit" },
  { href: "/admin#reports", label: "Reports" },
];

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireLabel("admin");

  return (
    <PortalShell
      title="Admin"
      subtitle="$ ./admin --portal"
      homeHref="/"
      nav={ADMIN_NAV}
    >
      {children}
    </PortalShell>
  );
}
