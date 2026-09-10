"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Banknote,
  ChartColumn,
  ClipboardList,
  FolderTree,
  LayoutDashboard,
  MessageSquare,
  Package,
  Receipt,
  ScrollText,
  Settings,
  ShieldCheck,
  Store,
  Ticket,
  TrendingUp,
  Users,
  Wallet,
  Flag,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Icons are referenced by name so server layouts can declare nav config
 * without passing non-serializable components across the client boundary.
 */
const NAV_ICONS = {
  dashboard: LayoutDashboard,
  listings: Package,
  categories: FolderTree,
  coupons: Ticket,
  orders: Receipt,
  sellers: Store,
  performance: TrendingUp,
  users: Users,
  trust: ShieldCheck,
  reports: Flag,
  bankSlips: Banknote,
  notifyLogs: ScrollText,
  analytics: ChartColumn,
  settings: Settings,
  audit: ClipboardList,
  shop: Store,
  messages: MessageSquare,
  earnings: Wallet,
} satisfies Record<string, LucideIcon>;

export type PortalNavIcon = keyof typeof NAV_ICONS;

export type PortalNavItem = {
  href: string;
  label: string;
  icon?: PortalNavIcon;
};

export type PortalNavGroup = {
  title?: string;
  items: PortalNavItem[];
};

function isActivePath(pathname: string, href: string, allHrefs: string[]): boolean {
  if (pathname === href) return true;
  if (!pathname.startsWith(`${href}/`)) return false;
  return !allHrefs.some(
    (other) =>
      other !== href &&
      other.startsWith(`${href}/`) &&
      (pathname === other || pathname.startsWith(`${other}/`)),
  );
}

export function PortalSideNav({
  groups,
  label,
  className,
}: {
  groups: PortalNavGroup[];
  label: string;
  className?: string;
}) {
  const pathname = usePathname();
  const allHrefs = groups.flatMap((group) => group.items.map((item) => item.href));

  return (
    <nav aria-label={label} className={cn("flex flex-col gap-4", className)}>
      {groups.map((group) => (
        <div key={group.title ?? group.items.map((item) => item.href).join("-")}>
          {group.title ? (
            <p className="px-3 pb-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              {group.title}
            </p>
          ) : null}
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = isActivePath(pathname, item.href, allHrefs);
              const Icon = item.icon ? NAV_ICONS[item.icon] : null;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-accent/12 font-medium text-foreground"
                      : "text-muted-foreground hover:bg-card-hover hover:text-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {Icon ? (
                    <Icon
                      className={cn(
                        "size-4 shrink-0",
                        active ? "text-accent" : null,
                      )}
                      aria-hidden
                    />
                  ) : null}
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
