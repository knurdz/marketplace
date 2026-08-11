import type { ReactNode } from "react";
import { SkipToContent } from "@/components/layout/skip-to-content";
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
      <SkipToContent />
      <StoreNavbar user={user} />
      <div
        id="main-content"
        tabIndex={-1}
        className="flex-1 outline-none"
      >
        {children}
      </div>
      <StoreFooter />
    </div>
  );
}
