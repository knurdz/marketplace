import type { ReactNode } from "react";
import { requireLabel } from "@/lib/appwrite/roles";

export default async function SellerLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireLabel("seller");
  return <>{children}</>;
}
