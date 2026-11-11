import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SkipToContent } from "@/components/layout/skip-to-content";
import { StoreFooter } from "@/components/layout/store-footer";
import { StoreNavbar } from "@/components/layout/store-navbar";
import { getOwnProfile } from "@/lib/backend/profiles";
import { redirectIfRegistrationIncomplete } from "@/lib/backend/registration-complete";
import { getLoggedInUser } from "@/lib/backend/session";
import { portalHomeForSessionUser, toSessionUserView } from "@/lib/backend/session-user";
import { resolveAvatarUrl } from "@/lib/backend/storage-urls";
import { NOINDEX_METADATA } from "@/lib/seo/metadata";
import { getOwnBuyerCommerceCounts } from "@/lib/services/buyer-commerce-counts";

export const metadata: Metadata = NOINDEX_METADATA;

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
