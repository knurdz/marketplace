"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Banknote,
  ChevronRight,
  Flag,
  LayoutList,
  Receipt,
  Store,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import { PortalAreaChart } from "@/components/charts/portal-area-chart";
import { PortalBarChart } from "@/components/charts/portal-bar-chart";
import { Sparkline } from "@/components/charts/sparkline";
import { PortalPanel } from "@/components/layout/portal-panel";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  formatDayBucketLabel,
  formatMonthBucketLabel,
} from "@/lib/charts/format-bucket-label";
import type { SalesBucket, UserGrowthBucket } from "@/lib/services";
import { cn } from "@/lib/utils";

type RangeKey = "30d" | "12m";

type QueueItem = {
  title: string;
  body: string;
  href: string;
  cta: string;
};

type MetricCard = {
  label: string;
  value: string;
  href: string;
  icon: LucideIcon;
  spark: { value: number }[];
  sparkColor: string;
};

type AdminDashboardChartsProps = {
  metrics: {
    totalUsers: string;
    activeSellers: string;
    totalOrders: string;
    grossRevenue: string;
  };
  sales30d: SalesBucket[];
  sales12m: SalesBucket[];
  growth30d: UserGrowthBucket[];
  growth12m: UserGrowthBucket[];
  queues: QueueItem[];
};

function labelSales(rows: SalesBucket[], range: RangeKey) {
  const labelFn = range === "12m" ? formatMonthBucketLabel : formatDayBucketLabel;
  return rows.map((row) => ({ ...row, label: labelFn(row.bucket) }));
}

function labelGrowth(rows: UserGrowthBucket[], range: RangeKey) {
  const labelFn = range === "12m" ? formatMonthBucketLabel : formatDayBucketLabel;
  return rows.map((row) => ({ ...row, label: labelFn(row.bucket) }));
}

function sparkFromSeries<T extends Record<string, unknown>>(
  rows: T[],
  key: keyof T,
): { value: number }[] {
  return rows.map((row) => {
    const raw = row[key];
    return { value: typeof raw === "number" && Number.isFinite(raw) ? raw : 0 };
  });
}

function MetricCardTile({ card }: { card: MetricCard }) {
  const hasSpark = card.spark.some((p) => p.value > 0);

  return (
    <Link
      href={card.href}
      className="group block rounded-xl border border-border bg-card p-4 shadow-xs transition-colors hover:border-foreground/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/25 text-foreground">
            <card.icon className="size-4" strokeWidth={1.75} aria-hidden />
          </span>
          <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
        </div>
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
        {card.value}
      </p>
      <div
        className={cn(
          "mt-3 h-10 w-full opacity-80 transition-opacity group-hover:opacity-100",
          !hasSpark && "opacity-30",
        )}
      >
        <Sparkline data={card.spark} color={card.sparkColor} className="h-full w-full" />
      </div>
    </Link>
  );
}

const QUEUE_ICONS: LucideIcon[] = [Store, LayoutList, Receipt, Flag];

export function AdminDashboardCharts({
  metrics,
  sales30d = [],
  sales12m = [],
  growth30d = [],
  growth12m = [],
  queues = [],
}: AdminDashboardChartsProps) {
  const [range, setRange] = useState<RangeKey>("30d");

  const salesSeries = range === "30d" ? sales30d : sales12m;
  const growthSeries = range === "30d" ? growth30d : growth12m;
  const sales = Array.isArray(salesSeries) ? salesSeries : [];
  const growth = Array.isArray(growthSeries) ? growthSeries : [];

  const salesData = useMemo(() => labelSales(sales, range), [sales, range]);
  const growthData = useMemo(() => labelGrowth(growth, range), [growth, range]);

  const sparkSales = useMemo(
    () => labelSales(Array.isArray(sales30d) ? sales30d : [], "30d"),
    [sales30d],
  );
  const sparkGrowth = useMemo(
    () => labelGrowth(Array.isArray(growth30d) ? growth30d : [], "30d"),
    [growth30d],
  );

  const metricCards: MetricCard[] = [
    {
      label: "Total users",
      value: metrics.totalUsers,
      href: "/admin/buyers",
      icon: Users,
      spark: sparkFromSeries(sparkGrowth, "newUsers"),
      sparkColor: "var(--accent)",
    },
    {
      label: "Active sellers",
      value: metrics.activeSellers,
      href: "/admin/sellers/performance",
      icon: Store,
      spark: sparkFromSeries(sparkGrowth, "newSellers"),
      sparkColor: "var(--chart-3)",
    },
    {
      label: "Open requests",
      value: metrics.totalOrders,
      href: "/admin/requests?filter=requested",
      icon: Receipt,
      spark: sparkFromSeries(sparkSales, "orderCount"),
      sparkColor: "var(--chart-2)",
    },
    {
      label: "Sold requests",
      value: metrics.grossRevenue,
      href: "/admin/requests?filter=sold",
      icon: Banknote,
      spark: sparkFromSeries(sparkSales, "orderCount"),
      sparkColor: "var(--accent)",
    },
  ];

  const rangeLabel = range === "30d" ? "Last 30 days" : "Last 12 months";
  const bucketLabel = range === "30d" ? "daily" : "monthly";

  return (
    <div className="mt-4 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <MetricCardTile key={card.label} card={card} />
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Trends · {rangeLabel} · {bucketLabel} buckets
        </p>
        <Tabs
          value={range}
          onValueChange={(value) => setRange(value as RangeKey)}
        >
          <TabsList>
            <TabsTrigger value="30d">30 days</TabsTrigger>
            <TabsTrigger value="12m">12 months</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <PortalPanel>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold tracking-tight">Signups</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                New accounts and approved sellers per {bucketLabel === "daily" ? "day" : "month"}
              </p>
            </div>
            <UserPlus className="size-4 text-muted-foreground" aria-hidden />
          </div>
          <div className="mt-6">
            <PortalAreaChart
              data={growthData}
              height={300}
              emptyMessage="Signups appear as buyers and sellers join the platform."
              series={[
                {
                  dataKey: "newUsers",
                  name: "New users",
                  color: "var(--accent)",
                },
                {
                  dataKey: "newSellers",
                  name: "New sellers",
                  color: "var(--chart-3)",
                },
              ]}
            />
          </div>
        </PortalPanel>

        <PortalPanel>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold tracking-tight">
                Sold requests
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Completed sales marked by sellers · aggregate counts only
              </p>
            </div>
            <Banknote className="size-4 text-muted-foreground" aria-hidden />
          </div>
          <div className="mt-6">
            <PortalBarChart
              data={salesData}
              height={300}
              emptyMessage="Charts fill in as sellers mark requests sold."
              series={[
                {
                  dataKey: "orderCount",
                  name: "Sold",
                  color: "var(--accent)",
                  radius: 3,
                },
              ]}
            />
          </div>
        </PortalPanel>
      </div>

      {queues.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {queues.map((queue, index) => {
            const Icon = QUEUE_ICONS[index] ?? ChevronRight;
            return (
              <Link
                key={queue.href}
                href={queue.href}
                className="group flex flex-col rounded-xl border border-border bg-card p-4 shadow-xs transition-colors hover:border-foreground/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/25 text-foreground">
                    <Icon className="size-4" strokeWidth={1.75} aria-hidden />
                  </span>
                  <ChevronRight
                    className="size-4 shrink-0 text-muted-foreground opacity-60 transition-opacity group-hover:opacity-100"
                    aria-hidden
                  />
                </div>
                <p className="mt-3 text-sm font-semibold tracking-tight">
                  {queue.title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{queue.body}</p>
                <p className="mt-3 text-xs font-medium text-accent">{queue.cta}</p>
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
