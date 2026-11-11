import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: LucideIcon;
  className?: string;
};

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 px-6 py-16 text-center",
        className,
      )}
    >
      <div
        aria-hidden
        className="mb-5 flex size-12 items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground"
      >
        <Icon className="size-5" strokeWidth={1.75} />
      </div>
      <p className="text-base font-medium tracking-tight">{title}</p>
      {description ? (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
