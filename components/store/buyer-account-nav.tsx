"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, LayoutDashboard, Package, UserRound } from "lucide-react";
import {
  NavCountBadge,
  type NavCountTone,
} from "@/components/layout/nav-count-badge";
import { cn } from "@/lib/utils";

const BUYER_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/requests", label: "Requests", icon: Package },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account", label: "Account", icon: UserRound },
] as const;

export type BuyerNavCounts = {
  wishlist: number;
  requests: number;
};

const EMPTY_COUNTS: BuyerNavCounts = { wishlist: 0, requests: 0 };

function countForHref(
  href: string,
  counts: BuyerNavCounts,
): { count: number; tone: NavCountTone } | null {
  if (href === "/wishlist" && counts.wishlist > 0) {
    return { count: counts.wishlist, tone: "wishlist" };
  }
  if (href === "/requests" && counts.requests > 0) {
    return { count: counts.requests, tone: "requests" };
  }
  return null;
}

function linkLabel(label: string, href: string, counts: BuyerNavCounts): string {
  const badge = countForHref(href, counts);
  if (!badge) return label;
  if (href === "/wishlist") return `Wishlist, ${badge.count} saved`;
  return `Requests, ${badge.count}`;
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/requests") {
    return pathname === "/requests" || pathname.startsWith("/requests/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BuyerAccountNav({
  className,
  counts = EMPTY_COUNTS,
}: {
  className?: string;
  counts?: BuyerNavCounts;
}) {
  const pathname = usePathname() ?? "";

  return (
    <nav
      aria-label="Account"
      className={cn("flex flex-col gap-1", className)}
    >
      {BUYER_NAV.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        const badge = countForHref(href, counts);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            aria-label={linkLabel(label, href, counts)}
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
            <span className="min-w-0 flex-1 truncate">{label}</span>
            {badge ? (
              <NavCountBadge count={badge.count} tone={badge.tone} />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function BuyerAccountMobileNav({
  className,
  counts = EMPTY_COUNTS,
}: {
  className?: string;
  counts?: BuyerNavCounts;
}) {
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
        const badge = countForHref(href, counts);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            aria-label={linkLabel(label, href, counts)}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
              active
                ? "border-foreground/15 bg-foreground text-background"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-3.5" strokeWidth={1.75} aria-hidden />
            {label}
            {badge ? (
              <NavCountBadge count={badge.count} tone={badge.tone} />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
