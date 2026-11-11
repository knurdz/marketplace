"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Settings } from "lucide-react";
import { AccountMenu } from "@/components/layout/account-menu";
import { portalWelcomeName } from "@/components/layout/portal-greeting";
import type { SessionUserView } from "@/lib/appwrite/session-user";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

function IconTile({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PortalTopBar({
  user,
  displayName,
  avatarUrl,
  settingsHref,
}: {
  user: SessionUserView;
  displayName?: string | null;
  avatarUrl?: string | null;
  settingsHref: string;
}) {
  const name = portalWelcomeName(user, displayName);

  return (
    <div className="flex flex-col gap-4 pb-8 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger className="size-9 md:hidden" />
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
          Welcome back, {name}
        </h1>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
        <IconTile>
          <ThemeToggle className="size-9" />
        </IconTile>
        <IconTile>
          <NotificationBell className="size-9" />
        </IconTile>
        <Link
          href={settingsHref}
          className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Settings"
        >
          <Settings className="size-4" strokeWidth={1.75} />
        </Link>
        <AccountMenu user={user} displayName={displayName} avatarUrl={avatarUrl} />
      </div>
    </div>
  );
}
