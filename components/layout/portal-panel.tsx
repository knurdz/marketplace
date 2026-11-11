import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** White bordered section on the portal canvas (charts, tables, queues). */
export function PortalPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border/80 bg-card p-6 shadow-none",
        className,
      )}
    >
      {children}
    </section>
  );
}
