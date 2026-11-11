import type { ReactNode } from "react";
import { SkipToContent } from "@/components/layout/skip-to-content";
import { StoreFooter } from "@/components/layout/store-footer";
import { StoreNavbar } from "@/components/layout/store-navbar";
import { getOwnProfile } from "@/lib/appwrite/profiles";
import { redirectIfRegistrationIncomplete } from "@/lib/appwrite/registration-complete";
import { getLoggedInUser } from "@/lib/appwrite/session";
import { portalHomeForSessionUser, toSessionUserView } from "@/lib/appwrite/session-user";
import { resolveAvatarUrl } from "@/lib/appwrite/storage-urls";
import { getOwnBuyerCommerceCounts } from "@/lib/services/buyer-commerce-counts";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  await redirectIfRegistrationIncomplete();

  const authUser = await getLoggedInUser();
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
      <div id="main-content" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </div>
      <StoreFooter />
    </div>
  );
}
