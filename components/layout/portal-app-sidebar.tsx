"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronsLeft, ChevronsRight, ExternalLink, LogOut } from "lucide-react";
import { signOut } from "@/lib/appwrite/auth";
import {
  NAV_ICONS,
  type PortalNavGroup,
  type PortalNavIcon,
  type PortalNavItem,
} from "@/components/layout/portal-side-nav";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

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

function SidebarCollapseButton({ className }: { className?: string }) {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      className={cn(
        "shrink-0 rounded-lg border-border bg-background text-muted-foreground shadow-none",
        className,
      )}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      onClick={toggleSidebar}
    >
      {collapsed ? <ChevronsRight /> : <ChevronsLeft />}
    </Button>
  );
}

function NavMenuItem({
  item,
  active,
}: {
  item: PortalNavItem;
  active: boolean;
}) {
  const Icon = item.icon ? NAV_ICONS[item.icon as PortalNavIcon] : null;
  const tooltip = item.showDot ? `${item.label} (pending)` : item.label;
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={active}
        tooltip={tooltip}
        className={cn(
          "h-10 rounded-xl px-3 text-muted-foreground",
          "hover:text-foreground",
          "data-active:rounded-xl data-active:bg-sidebar-accent data-active:font-semibold data-active:text-foreground",
          "group-data-[collapsible=icon]:rounded-lg",
        )}
      >
        <Link
          href={item.href}
          aria-label={item.showDot ? `${item.label}, has pending items` : undefined}
        >
          {Icon ? (
            <span className="relative inline-flex size-4 shrink-0 items-center justify-center">
              <Icon
                strokeWidth={1.75}
                className={cn("size-4", active && "text-accent")}
              />
              {item.showDot ? (
                <span
                  aria-hidden
                  className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-rose-500 ring-2 ring-sidebar"
                />
              ) : null}
            </span>
          ) : null}
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate">{item.label}</span>
            {item.showDot && !Icon ? (
              <span
                aria-hidden
                className="size-2 shrink-0 rounded-full bg-rose-500"
              />
            ) : null}
          </span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function PortalAppSidebar({
  title,
  homeHref,
  groups,
}: {
  title: string;
  homeHref: string;
  groups: PortalNavGroup[];
}) {
  const pathname = usePathname();
  const allHrefs = groups.flatMap((group) => group.items.map((item) => item.href));

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="border-sidebar-border">
      <SidebarHeader className="border-0 px-4 pt-5 pb-3">
        <div className="flex items-center justify-between gap-2">
          <Link
            href={homeHref}
            className="flex min-w-0 items-center gap-2.5 overflow-hidden group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:justify-center"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-sm font-bold text-accent-foreground">
              K
            </span>
            <span className="truncate text-base font-semibold tracking-tight text-foreground group-data-[collapsible=icon]:hidden">
              Knurdz
            </span>
          </Link>
          <SidebarCollapseButton className="hidden group-data-[collapsible=icon]:hidden md:inline-flex" />
        </div>
        <SidebarCollapseButton className="mx-auto mt-3 hidden group-data-[collapsible=icon]:inline-flex" />
      </SidebarHeader>

      <SidebarContent className="gap-2 px-3">
        {groups.map((group, index) => {
          const key = group.title ?? group.items.map((item) => item.href).join("-");
          if (!group.title) {
            return (
              <SidebarGroup key={key} className={cn("p-0", index < groups.length - 1 && "pb-2")}>
                <SidebarGroupContent>
                  <SidebarMenu className="gap-1">
                    {group.items.map((item) => (
                      <NavMenuItem
                        key={item.href}
                        item={item}
                        active={isActivePath(pathname, item.href, allHrefs)}
                      />
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          }

          return (
            <Collapsible key={key} defaultOpen className="group/collapsible">
              <SidebarGroup className="p-0">
                <SidebarGroupLabel
                  asChild
                  className="h-auto px-0 opacity-100 group-data-[collapsible=icon]:hidden"
                >
                  <CollapsibleTrigger
                    className={cn(
                      "flex h-11 w-full cursor-pointer items-center rounded-lg px-3.5 py-2.5 text-sm font-semibold text-foreground",
                      "hover:bg-sidebar-accent/60",
                      "[&[data-state=open]>svg]:rotate-180",
                    )}
                  >
                    <span>{group.title}</span>
                    <ChevronDown className="ml-auto size-4 text-muted-foreground transition-transform" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent className="pt-0.5">
                    <SidebarMenu className="gap-1">
                      {group.items.map((item) => (
                        <NavMenuItem
                          key={item.href}
                          item={item}
                          active={isActivePath(pathname, item.href, allHrefs)}
                        />
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border px-3 py-4">
        <SidebarMenu className="gap-1">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Storefront"
              className="h-10 rounded-xl px-3 text-muted-foreground hover:text-foreground"
            >
              <Link href="/">
                <ExternalLink strokeWidth={1.75} />
                <span>Storefront</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <form action={signOut}>
              <SidebarMenuButton
                asChild
                tooltip="Sign out"
                className="h-10 rounded-xl px-3 text-muted-foreground hover:text-foreground"
              >
                <button type="submit">
                  <LogOut strokeWidth={1.75} />
                  <span>Sign out</span>
                </button>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
        <p className="sr-only">{title} portal</p>
      </SidebarFooter>
    </Sidebar>
  );
}
