import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  href?: string;
  icon?: LucideIcon;
};

export function StatCard({ label, value, hint, href, icon: Icon }: StatCardProps) {
  const card = (
    <Card
      className={cn(
        "h-full rounded-2xl border-border/80 shadow-none",
        href && "transition-colors hover:border-foreground/20",
      )}
    >
      <CardHeader className="gap-0 px-6 py-6">
        <div className="flex items-center gap-2.5">
          {Icon ? (
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
              <Icon className="size-4" strokeWidth={1.75} aria-hidden />
            </span>
          ) : null}
          <CardDescription className="text-sm font-semibold text-foreground">
            {label}
          </CardDescription>
        </div>
        <CardTitle className="mt-5 text-3xl font-semibold tabular-nums">{value}</CardTitle>
        {hint ? <CardDescription className="mt-2 text-sm">{hint}</CardDescription> : null}
      </CardHeader>
    </Card>
  );

  if (!href) return card;

  return (
    <Link
      href={href}
      className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {card}
    </Link>
  );
}

export function StatCardGrid({
  cards,
  className,
}: {
  cards: StatCardProps[];
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}
