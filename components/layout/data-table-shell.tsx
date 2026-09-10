import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Bordered, horizontally scrollable frame for portal `Table`s. */
export function DataTableShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-xl border border-border bg-card",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DataTableEmpty({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground",
        className,
      )}
    >
      {message}
    </div>
  );
}

/** Segmented filter links used above portal tables. */
export function FilterTabs({
  tabs,
  className,
}: {
  tabs: { href: string; label: string; active: boolean }[];
  className?: string;
}) {
  return (
    <nav
      aria-label="Filter"
      className={cn(
        "scrollbar-none inline-flex max-w-full gap-1 overflow-x-auto rounded-lg border border-border bg-card p-1",
        className,
      )}
    >
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          aria-current={tab.active ? "page" : undefined}
          className={cn(
            "shrink-0 rounded-md px-3 py-1.5 text-sm whitespace-nowrap transition-colors",
            tab.active
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-card-hover hover:text-foreground",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

export function LoadMoreLink({
  href,
  label = "Load more",
}: {
  href: string;
  label?: string;
}) {
  return (
    <div className="mt-6">
      <Button variant="secondary" size="sm" asChild>
        <Link href={href}>{label}</Link>
      </Button>
    </div>
  );
}
