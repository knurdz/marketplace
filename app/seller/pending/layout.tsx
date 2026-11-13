import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { PendingSellerShell } from "@/components/layout/pending-seller-shell";
import { getOwnSellerProfile } from "@/lib/services/seller-application";

export default async function SellerPendingRouteLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await getOwnSellerProfile();
  if (!profile) {
    redirect("/");
  }
  return <PendingSellerShell>{children}</PendingSellerShell>;
}
