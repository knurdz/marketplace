"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, LayoutDashboard, Package, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const BUYER_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/requests", label: "Requests", icon: Package },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account", label: "Account", icon: UserRound },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/requests") {
    return pathname === "/requests" || pathname.startsWith("/requests/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BuyerAccountNav({ className }: { className?: string }) {
  const pathname = usePathname() ?? "";

  return (
    <nav
      aria-label="Account"
      className={cn("flex flex-col gap-1", className)}
    >
      {BUYER_NAV.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function BuyerAccountMobileNav({ className }: { className?: string }) {
  const pathname = usePathname() ?? "";

  return (
    <nav
      aria-label="Account"
      className={cn(
        "scrollbar-none -mx-1 flex gap-1 overflow-x-auto px-1 pb-1",
        className,
      )}
    >
      {BUYER_NAV.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
              active
                ? "border-foreground/15 bg-foreground text-background"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-3.5" strokeWidth={1.75} aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
