import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
};

/** Compact catalog section header. Storefront rails, not marketing pages. */
export function SectionHeading({
  title,
  description,
  href,
  linkLabel = "View all",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn("flex flex-wrap items-end justify-between gap-3", className)}
    >
      <div className="min-w-0">
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl text-foreground">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {href ? (
        <Link
          href={href}
          className="group/link inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-accent"
        >
          {linkLabel}
          <ArrowRight className="size-4 transition-transform duration-200 group-hover/link:translate-x-1" aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}
