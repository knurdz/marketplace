"use client";

import type { CSSProperties, ReactNode } from "react";
import { PortalAppSidebar } from "@/components/layout/portal-app-sidebar";
import { PortalDrawerHost } from "@/components/layout/portal-drawer-host";
import { PortalTopBar } from "@/components/layout/portal-top-bar";
import type { PortalNavGroup } from "@/components/layout/portal-side-nav";
import type { SessionUserView } from "@/lib/backend/session-user";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export function PortalFrame({
  title,
  homeHref,
  nav,
  user,
  displayName,
  avatarUrl,
  settingsHref,
  children,
}: {
  title: string;
  homeHref: string;
  nav: PortalNavGroup[];
  user: SessionUserView;
  displayName?: string | null;
  avatarUrl?: string | null;
  settingsHref: string;
  children: ReactNode;
}) {
  return (
    <TooltipProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "16.25rem",
            "--sidebar-width-icon": "4.5rem",
          } as CSSProperties
        }
      >
        <PortalAppSidebar title={title} homeHref={homeHref} groups={nav} />
        <SidebarInset className="relative min-h-svh bg-background shadow-none">
          <PortalDrawerHost />
          <div className="flex w-full flex-1 flex-col px-4 pt-6 md:px-6 md:pt-8 lg:px-8">
            <PortalTopBar
              user={user}
              displayName={displayName}
              avatarUrl={avatarUrl}
              settingsHref={settingsHref}
            />
            <main
              id="main-content"
              tabIndex={-1}
              className="w-full flex-1 pb-10 outline-none"
            >
              {children}
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
