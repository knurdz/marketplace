import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SkipToContent } from "@/components/layout/skip-to-content";
import { StoreFooter } from "@/components/layout/store-footer";
import { StoreNavbar } from "@/components/layout/store-navbar";
import { loadSellerStatus } from "@/lib/backend/home-path";
import { getOwnProfile } from "@/lib/backend/profiles";
import {
  homePathForUser,
  mayBrowsePublicCatalog,
  pathIsPublicCatalog,
  pathIsPublicStoreException,
  shouldLeaveBuyerStorefront,
} from "@/lib/backend/roles";
import { redirectIfRegistrationIncomplete } from "@/lib/backend/registration-complete";
import { getLoggedInUser } from "@/lib/backend/session";
import { portalHomeForSessionUser, toSessionUserView } from "@/lib/backend/session-user";
import { resolveAvatarUrl } from "@/lib/backend/storage-urls";
import { getOwnBuyerCommerceCounts } from "@/lib/services/buyer-commerce-counts";

export default async function StoreLayout({
  children,
}: {
  children: ReactNode;
}) {
  const authUser = await getLoggedInUser();
  const pathname = (await headers()).get("x-knurdz-pathname") ?? "";

  await redirectIfRegistrationIncomplete(pathname);

  if (
    authUser &&
    !pathIsPublicStoreException(pathname) &&
    !(pathIsPublicCatalog(pathname) && mayBrowsePublicCatalog(authUser))
  ) {
    const sellerStatus = await loadSellerStatus(authUser);
    const leave = shouldLeaveBuyerStorefront(authUser, sellerStatus);
    const home = homePathForUser(authUser, sellerStatus);
    if (leave) {
      redirect(home);
    }
  }

  const profile = authUser ? await getOwnProfile() : null;
  const avatarUrl = authUser
    ? resolveAvatarUrl(profile?.avatarFileId, authUser.image)
    : null;
  const user = authUser ? toSessionUserView(authUser) : null;
  const counts =
    user && !portalHomeForSessionUser(user)
      ? await getOwnBuyerCommerceCounts()
      : null;

  return (
    <div className="storefront flex min-h-screen flex-col bg-background text-foreground">
      <SkipToContent />
      <StoreNavbar
        user={user}
        displayName={profile?.displayName}
        avatarUrl={avatarUrl}
        counts={counts}
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
