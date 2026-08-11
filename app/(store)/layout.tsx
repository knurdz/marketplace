import type { ReactNode } from "react";
import { StoreNavbar } from "@/components/layout/store-navbar";
import { getLoggedInUser } from "@/lib/appwrite/session";

export default async function StoreLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getLoggedInUser();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <StoreNavbar user={user} />
      {children}
    </div>
  );
}
