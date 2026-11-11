import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PortalPageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

/** Section title below the welcome bar. */
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
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
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
