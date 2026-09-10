import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PortalPageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

/**
 * Dashboard-density header for `/admin` and `/seller`.
 * Storefront and auth pages keep the larger `PageHeader`.
 */
export function PortalPageHeader({
  title,
  description,
  actions,
  className,
}: PortalPageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}
