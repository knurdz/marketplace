import type { ReactNode } from "react";
import { SkipToContent } from "@/components/layout/skip-to-content";
import { StoreFooter } from "@/components/layout/store-footer";
import { StoreNavbar } from "@/components/layout/store-navbar";
import { getLoggedInUser } from "@/lib/appwrite/session";
import { getCartItemCount } from "@/lib/services";

export default async function StoreLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getLoggedInUser();
  const cartItemCount = user ? await getCartItemCount() : 0;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SkipToContent />
      <StoreNavbar user={user} cartItemCount={cartItemCount} />
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
