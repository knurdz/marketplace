import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  href?: string;
};

/** Compact dashboard metric tile. Links when the metric has a drill-down page. */
export function StatCard({ label, value, hint, href }: StatCardProps) {
  const body = (
    <CardContent className="py-1">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        {href ? (
          <ArrowUpRight
            className="size-4 shrink-0 text-muted-foreground transition-colors group-hover/stat:text-accent"
            aria-hidden
          />
        ) : null}
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </CardContent>
  );

  const card = (
    <Card
      className={cn(
        "h-full",
        href
          ? "group/stat transition-colors hover:border-foreground/25 hover:bg-card-hover"
          : null,
      )}
    >
      {body}
    </Card>
  );

  if (!href) return card;

  return (
    <Link href={href} className="block">
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
    <div
      className={cn(
        "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}
