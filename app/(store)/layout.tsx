import type { ReactNode } from "react";
import { SkipToContent } from "@/components/layout/skip-to-content";
import { StoreFooter } from "@/components/layout/store-footer";
import { StoreNavbar } from "@/components/layout/store-navbar";
import { getOwnProfile } from "@/lib/appwrite/profiles";
import { getLoggedInUser } from "@/lib/appwrite/session";
import { toSessionUserView } from "@/lib/appwrite/session-user";
import { getAvatarPreviewUrl } from "@/lib/appwrite/storage-urls";
import { getCartItemCount } from "@/lib/services";

export default async function StoreLayout({
  children,
}: {
  children: ReactNode;
}) {
  const authUser = await getLoggedInUser();
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
