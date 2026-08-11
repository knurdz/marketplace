import type { ReactNode } from "react";
import { StoreFooter } from "@/components/layout/store-footer";
import { StoreNavbar } from "@/components/layout/store-navbar";
import { getLoggedInUser } from "@/lib/appwrite/session";

export default async function StoreLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getLoggedInUser();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <StoreNavbar user={user} />
      <div className="flex-1">{children}</div>
      <StoreFooter />
    </div>
  );
}
