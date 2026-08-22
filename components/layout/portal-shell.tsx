import Link from "next/link";
import type { ReactNode } from "react";
import { Menu } from "lucide-react";
import { signOut } from "@/lib/appwrite/auth";
import { SkipToContent } from "@/components/layout/skip-to-content";
import {
  PortalSideNav,
  type PortalNavGroup,
} from "@/components/layout/portal-side-nav";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export type { PortalNavGroup, PortalNavItem } from "@/components/layout/portal-side-nav";

type PortalShellProps = {
  title: string;
  homeHref: string;
  nav: PortalNavGroup[];
  children: ReactNode;
};

export function PortalShell({
  title,
  homeHref,
  nav,
  children,
}: PortalShellProps) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <SkipToContent />
      <aside className="hidden w-60 shrink-0 border-r border-border bg-sidebar md:sticky md:top-0 md:flex md:h-dvh md:flex-col">
        <div className="shrink-0 px-4 py-5">
          <Link href={homeHref} className="text-sm font-semibold tracking-tight">
            Knurdz
            <span className="text-accent">.</span>
          </Link>
          <h1 className="mt-3 text-lg font-bold tracking-tight">{title}</h1>
        </div>
        <Separator />
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-3">
          <PortalSideNav groups={nav} label={title} />
          <div className="mt-auto shrink-0 space-y-2 p-1">
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="sm" className="w-full">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border px-4 md:px-6">
          <div className="flex items-center gap-3 md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  aria-label="Open menu"
                >
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px]">
                <SheetHeader>
                  <SheetTitle className="text-left">{title}</SheetTitle>
                </SheetHeader>
                <div className="mt-4 flex flex-col gap-4 px-2">
                  <PortalSideNav groups={nav} label={title} />
                  <Separator />
                  <form action={signOut}>
                    <Button type="submit" variant="ghost" className="w-full">
                      Sign out
                    </Button>
                  </form>
                </div>
              </SheetContent>
            </Sheet>
            <h1 className="text-sm font-bold tracking-tight md:hidden">
              {title}
            </h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <NotificationBell className="size-10" />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/account">Account</Link>
            </Button>
          </div>
        </header>
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 px-4 py-8 outline-none md:px-8"
        >
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
