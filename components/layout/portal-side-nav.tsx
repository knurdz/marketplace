"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type PortalNavItem = {
  href: string;
  label: string;
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
    <nav aria-label={label} className={cn("flex flex-col gap-5", className)}>
      {groups.map((group) => (
        <div key={group.title ?? group.items.map((item) => item.href).join("-")}>
          {group.title ? (
            <p className="px-3 pb-1.5 text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
              {group.title}
            </p>
          ) : null}
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = isActivePath(pathname, item.href, allHrefs);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm transition",
                    active
                      ? "bg-card text-foreground"
                      : "text-muted-foreground hover:bg-card hover:text-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
