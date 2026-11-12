"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Heart, LayoutDashboard, Package, UserRound } from "lucide-react";
import {
  NavCountBadge,
  type NavCountTone,
} from "@/components/layout/nav-count-badge";
import { SheetClose } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const BUYER_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/requests", label: "Requests", icon: Package },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/account", label: "Account", icon: UserRound },
] as const;

export type BuyerNavCounts = {
  wishlist: number;
  requests: number;
  notifications: number;
};

const EMPTY_COUNTS: BuyerNavCounts = {
  wishlist: 0,
  requests: 0,
  notifications: 0,
};

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
  if (href === "/notifications" && counts.notifications > 0) {
    return { count: counts.notifications, tone: "notifications" };
  }
  return null;
}

function linkLabel(label: string, href: string, counts: BuyerNavCounts): string {
  const badge = countForHref(href, counts);
  if (!badge) return label;
  if (href === "/wishlist") return `Wishlist, ${badge.count} saved`;
  if (href === "/notifications") return `Notifications, ${badge.count} unread`;
  return `Requests, ${badge.count}`;
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/requests") {
    return pathname === "/requests" || pathname.startsWith("/requests/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function BuyerNavLink({
  href,
  label,
  counts,
  active,
  dismissOnNavigate,
  appearance = "sidebar",
}: {
  href: string;
  label: string;
  counts: BuyerNavCounts;
  active: boolean;
  dismissOnNavigate?: boolean;
  appearance?: "sidebar" | "plain";
}) {
  const Icon = BUYER_NAV.find((item) => item.href === href)?.icon ?? LayoutDashboard;
  const badge = countForHref(href, counts);
  const plain = appearance === "plain";
  const link = (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      aria-label={linkLabel(label, href, counts)}
      className={cn(
        "flex items-center transition-colors",
        plain
          ? "justify-between gap-3 rounded-2xl px-4 py-3.5 text-lg tracking-tight"
          : "gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium",
        plain
          ? active
            ? "bg-foreground font-semibold text-background"
            : "font-medium text-foreground/80 hover:bg-muted hover:text-foreground"
          : active
            ? "bg-accent/10 text-foreground ring-1 ring-accent/20"
            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
      )}
    >
      {!plain ? (
        <Icon className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
      ) : null}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {badge ? (
        plain ? (
          <span
            className={cn(
              "text-sm font-semibold tabular-nums",
              active ? "text-background/70" : "text-muted-foreground",
            )}
          >
            {badge.count > 99 ? "99+" : badge.count}
          </span>
        ) : (
          <NavCountBadge count={badge.count} tone={badge.tone} />
        )
      ) : null}
    </Link>
  );

  if (dismissOnNavigate) {
    return <SheetClose asChild>{link}</SheetClose>;
  }
  return link;
}

export function BuyerAccountNav({
  className,
  counts = EMPTY_COUNTS,
  dismissOnNavigate,
  appearance = "sidebar",
}: {
  className?: string;
  counts?: BuyerNavCounts;
  /** Closes the mobile sheet when a link is chosen. */
  dismissOnNavigate?: boolean;
  /** `plain` — text-only rows for the mobile menu sheet. */
  appearance?: "sidebar" | "plain";
}) {
  const pathname = usePathname() ?? "";

  return (
    <nav
      aria-label="Account"
      className={cn("flex flex-col gap-1", className)}
    >
      {BUYER_NAV.map(({ href, label }) => (
        <BuyerNavLink
          key={href}
          href={href}
          label={label}
          counts={counts}
          active={isActive(pathname, href)}
          dismissOnNavigate={dismissOnNavigate}
          appearance={appearance}
        />
      ))}
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
