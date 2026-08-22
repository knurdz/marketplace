import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  headingAs?: "h1" | "h2";
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
  headingAs = "h1",
}: PageHeaderProps) {
  const Heading = headingAs;
  return (
    <header
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0 max-w-2xl">
        {eyebrow ? (
          <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
            {eyebrow}
          </p>
        ) : null}
        <Heading
          className={cn(
            "text-3xl font-bold tracking-tight sm:text-4xl",
            eyebrow ? "mt-2" : null,
          )}
        >
          {title}
        </Heading>
        {description ? (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
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
