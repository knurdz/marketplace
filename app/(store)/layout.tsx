import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SkipToContent } from "@/components/layout/skip-to-content";
import { StoreFooter } from "@/components/layout/store-footer";
import { StoreNavbar } from "@/components/layout/store-navbar";
import { loadSellerStatus } from "@/lib/appwrite/home-path";
import { getOwnProfile } from "@/lib/appwrite/profiles";
import {
  homePathForUser,
  pathIsPublicStoreException,
  shouldLeaveBuyerStorefront,
} from "@/lib/appwrite/roles";
import { getLoggedInUser } from "@/lib/appwrite/session";
import { toSessionUserView } from "@/lib/appwrite/session-user";
import { getAvatarPreviewUrl } from "@/lib/appwrite/storage-urls";
import { debugLog9145e1 } from "@/lib/debug-9145e1";
import { getCartItemCount } from "@/lib/services";

export default async function StoreLayout({
  children,
}: {
  children: ReactNode;
}) {
  const authUser = await getLoggedInUser();
  const pathname = (await headers()).get("x-knurdz-pathname") ?? "";

  if (authUser && !pathIsPublicStoreException(pathname)) {
    const sellerStatus = await loadSellerStatus(authUser);
    const leave = shouldLeaveBuyerStorefront(authUser, sellerStatus);
    const home = homePathForUser(authUser, sellerStatus);
    // #region agent log
    debugLog9145e1({
      hypothesisId: "C",
      runId: "post-fix",
      location: "app/(store)/layout.tsx:store-gate",
      message: "storefront exclusive-shell gate",
      data: {
        pathname,
        publicException: false,
        labels: Array.isArray(authUser.labels) ? authUser.labels : null,
        sellerStatus: sellerStatus ?? null,
        shouldLeave: leave,
        home,
      },
    });
    // #endregion
    if (leave) {
      redirect(home);
    }
  }

  const [cartItemCount, profile] = authUser
    ? await Promise.all([getCartItemCount(), getOwnProfile()])
    : [0, null];
  const avatarUrl = profile ? getAvatarPreviewUrl(profile.avatarFileId) : null;
  const user = authUser ? toSessionUserView(authUser) : null;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SkipToContent />
      <StoreNavbar
        user={user}
        cartItemCount={cartItemCount}
        displayName={profile?.displayName}
        avatarUrl={avatarUrl}
      />
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
