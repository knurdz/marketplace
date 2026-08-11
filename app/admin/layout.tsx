import type { ReactNode } from "react";
import { PortalShell } from "@/components/layout/portal-shell";
import { requireLabel } from "@/lib/appwrite/roles";

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/sellers", label: "Sellers" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin#products", label: "Products" },
  { href: "/admin#payments", label: "Payments" },
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
