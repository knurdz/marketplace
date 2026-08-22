import Link from "next/link";
import { AnalyticsCharts } from "@/components/admin/analytics-charts";
import { cn } from "@/lib/utils";
import {
  getSalesOverTime,
  getUserGrowthOverTime,
  parseAnalyticsRange,
} from "@/lib/services";

type PageProps = {
  searchParams: Promise<{ range?: string }>;
};

function rangeHref(range: "30d" | "12m"): string {
  return range === "12m" ? "/admin/analytics?range=12m" : "/admin/analytics?range=30d";
}

export default async function AdminAnalyticsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const range = parseAnalyticsRange(params.range);

  const [sales, growth] = await Promise.all([
    getSalesOverTime({ range }),
    getUserGrowthOverTime({ range }),
  ]);

  const currency = sales.find((row) => row.currency)?.currency ?? "LKR";
  const bucketLabel = range === "12m" ? "month" : "day";
  const rangeTitle = range === "12m" ? "Last 12 months" : "Last 30 days";

  return (
    <div className="mx-auto max-w-5xl">
      <h2 className="mt-3 text-3xl font-bold tracking-tight">Analytics</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Aggregate platform trends only. Charts show counts and totals — never
        individual users, orders, or sellers.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href={rangeHref("30d")}
          className={cn(
            "rounded-md border px-3 py-1.5 font-mono text-sm transition",
            range === "30d"
              ? "border-accent bg-accent/10 text-foreground"
              : "border-border text-muted-foreground hover:bg-card hover:text-foreground",
          )}
        >
          Last 30 days
        </Link>
        <Link
          href={rangeHref("12m")}
          className={cn(
            "rounded-md border px-3 py-1.5 font-mono text-sm transition",
            range === "12m"
              ? "border-accent bg-accent/10 text-foreground"
              : "border-border text-muted-foreground hover:bg-card hover:text-foreground",
          )}
        >
          Last 12 months
        </Link>
      </div>

      <p className="mt-4 font-mono text-xs text-muted-foreground">
        Viewing: {rangeTitle} · {bucketLabel === "day" ? "Daily" : "Monthly"} buckets
      </p>

      <AnalyticsCharts
        sales={sales}
        growth={growth}
        currency={currency}
        bucketLabel={bucketLabel}
      />
    </div>
  );
}
