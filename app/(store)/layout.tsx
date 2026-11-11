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
  mayBrowsePublicCatalog,
  pathIsPublicCatalog,
  pathIsPublicStoreException,
  shouldLeaveBuyerStorefront,
} from "@/lib/appwrite/roles";
import { redirectIfRegistrationIncomplete } from "@/lib/appwrite/registration-complete";
import { getLoggedInUser } from "@/lib/appwrite/session";
import { toSessionUserView } from "@/lib/appwrite/session-user";
import { getAvatarPreviewUrl } from "@/lib/appwrite/storage-urls";

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
  const avatarUrl = profile ? getAvatarPreviewUrl(profile.avatarFileId) : null;
  const user = authUser ? toSessionUserView(authUser) : null;

  return (
    <div className="storefront flex min-h-screen flex-col bg-background text-foreground">
      <SkipToContent />
      <StoreNavbar
        user={user}
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
