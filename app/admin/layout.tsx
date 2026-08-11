import type { ReactNode } from "react";
import { requireLabel } from "@/lib/appwrite/roles";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireLabel("admin");
  return <>{children}</>;
}
