import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { SkipToContent } from "@/components/layout/skip-to-content";
import { PortalFrame } from "@/components/layout/portal-frame";
import type { PortalNavGroup } from "@/components/layout/portal-side-nav";
import { getOwnProfile } from "@/lib/appwrite/profiles";
import { getLoggedInUser } from "@/lib/appwrite/session";
import { toSessionUserView } from "@/lib/appwrite/session-user";
import { resolveAvatarUrl } from "@/lib/appwrite/storage-urls";

export type {
  PortalNavGroup,
  PortalNavItem,
  PortalNavIcon,
} from "@/components/layout/portal-side-nav";

type PortalShellProps = {
  title: string;
  homeHref: string;
  nav: PortalNavGroup[];
  children: ReactNode;
};

export async function PortalShell({
  title,
  homeHref,
  nav,
  children,
}: PortalShellProps) {
  const authUser = await getLoggedInUser();
  if (!authUser) {
    redirect("/login");
  }
  const profile = await getOwnProfile();
  const user = toSessionUserView(authUser);
  const avatarUrl = resolveAvatarUrl(profile?.avatarFileId, authUser.image);
  const settingsHref = title === "Admin" ? "/admin/settings" : "/seller/settings";

  return (
    <div className="portal min-h-dvh bg-background text-foreground">
      <SkipToContent />
      <PortalFrame
          title={title}
          homeHref={homeHref}
          nav={nav}
          user={user}
          displayName={profile?.displayName}
          avatarUrl={avatarUrl}
          settingsHref={settingsHref}
        >
        {children}
      </PortalFrame>
    </div>
  );
}
