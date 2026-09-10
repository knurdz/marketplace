import Link from "next/link";
import type { ReactNode } from "react";
import { ExternalLink, Menu } from "lucide-react";
import { signOut } from "@/lib/appwrite/auth";
import { SkipToContent } from "@/components/layout/skip-to-content";
import {
  PortalSideNav,
  type PortalNavGroup,
} from "@/components/layout/portal-side-nav";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          <Link href={homeHref} className="text-sm font-semibold tracking-tight">
            Knurdz
            <span className="text-accent">.</span>
          </Link>
          <span
            className="rounded-md bg-card px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground"
            aria-hidden
          >
            {title}
          </span>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-2">
          <PortalSideNav groups={nav} label={title} />
          <div className="mt-auto shrink-0 space-y-1 pt-2">
            <Separator className="mb-2" />
            <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
              <Link href="/">
                <ExternalLink className="size-4" aria-hidden />
                Storefront
              </Link>
            </Button>
            <form action={signOut}>
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="w-full justify-start"
              >
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md md:px-6">
          <div className="flex items-center gap-3 md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon-sm"
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
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link href="/">
                      <ExternalLink className="size-4" aria-hidden />
                      Storefront
                    </Link>
                  </Button>
                  <form action={signOut}>
                    <Button
                      type="submit"
                      variant="ghost"
                      className="w-full justify-start"
                    >
                      Sign out
                    </Button>
                  </form>
                </div>
              </SheetContent>
            </Sheet>
            <p className="text-sm font-semibold tracking-tight">{title}</p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <NotificationBell className="size-10" />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/account">Account</Link>
            </Button>
          </div>
        </header>
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 px-4 py-6 outline-none md:px-6 md:py-8"
        >
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
