import Link from "next/link";
import type { ReactNode } from "react";
import { Menu } from "lucide-react";
import { signOut } from "@/lib/appwrite/auth";
import { SkipToContent } from "@/components/layout/skip-to-content";
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
import { cn } from "@/lib/utils";

export type PortalNavItem = {
  href: string;
  label: string;
};

type PortalShellProps = {
  title: string;
  subtitle: string;
  homeHref: string;
  nav: PortalNavItem[];
  children: ReactNode;
};

function SideNav({
  nav,
  label,
  className,
}: {
  nav: PortalNavItem[];
  label: string;
  className?: string;
}) {
  return (
    <nav aria-label={label} className={cn("flex flex-col gap-1", className)}>
      {nav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="rounded-md px-3 py-2 font-mono text-sm text-muted-foreground transition hover:bg-card hover:text-foreground"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function PortalShell({
  title,
  subtitle,
  homeHref,
  nav,
  children,
}: PortalShellProps) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <SkipToContent />
      <aside className="hidden w-56 shrink-0 border-r border-border bg-sidebar md:flex md:flex-col">
        <div className="px-4 py-5">
          <Link href="/" className="font-mono text-sm tracking-tight">
            Knurdz
            <span className="text-accent">.</span>
          </Link>
          <p className="mt-3 font-mono text-xs text-accent">{subtitle}</p>
          <h1 className="mt-1 hidden text-lg font-bold tracking-tight md:block">
            {title}
          </h1>
        </div>
        <Separator />
        <div className="flex flex-1 flex-col gap-4 p-3">
          <SideNav nav={nav} label={title} />
          <div className="mt-auto space-y-2 p-1">
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href={homeHref}>Storefront</Link>
            </Button>
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
                  variant="outline"
                  size="icon"
                  className="size-10"
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
                  <SideNav nav={nav} label={title} />
                  <Separator />
                  <Button variant="outline" asChild>
                    <Link href={homeHref}>Storefront</Link>
                  </Button>
                  <form action={signOut}>
                    <Button type="submit" variant="ghost" className="w-full">
                      Sign out
                    </Button>
                  </form>
                </div>
              </SheetContent>
            </Sheet>
            <h1 className="font-mono text-sm font-bold tracking-tight md:hidden">
              {title}
            </h1>
          </div>
          <p className="hidden font-mono text-xs text-muted-foreground md:block">
            Empty shell — features arrive in later steps
          </p>
          <div className="ml-auto flex items-center gap-2 md:ml-0">
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
          {children}
        </main>
      </div>
    </div>
  );
}
