"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Banknote,
  ChevronRight,
  Receipt,
  Store,
  Users,
  type LucideIcon,
} from "lucide-react";
import { PortalLineChart, type PortalLineSeries } from "@/components/charts/portal-line-chart";
import { Sparkline } from "@/components/charts/sparkline";
import { PortalPanel } from "@/components/layout/portal-panel";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  formatDayBucketLabel,
  formatMonthBucketLabel,
} from "@/lib/charts/format-bucket-label";
import type { SalesBucket, UserGrowthBucket } from "@/lib/services";
import { cn } from "@/lib/utils";

type RangeKey = "30d" | "12m";

type MetricKey = "users" | "sellers" | "orders" | "revenue";

type QueueItem = {
  title: string;
  body: string;
  href: string;
  cta: string;
};

type MetricCard = {
  key: MetricKey;
  label: string;
  value: string;
  hint?: string;
  href: string;
  icon: LucideIcon;
};

type AdminDashboardChartsProps = {
  metrics: {
    totalUsers: string;
    activeSellers: string;
    totalOrders: string;
    grossRevenue: string;
    currency: string;
  };
  sales30d: SalesBucket[];
  sales12m: SalesBucket[];
  growth30d: UserGrowthBucket[];
  growth12m: UserGrowthBucket[];
  queues: QueueItem[];
};

function formatCompactCurrency(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  } catch {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "LKR",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }
}

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

type DrawerState =
  | { kind: "metric"; metric: MetricKey }
  | { kind: "queue"; index: number }
  | null;

function RangeTabs({
  range,
  onRangeChange,
}: {
  range: RangeKey;
  onRangeChange: (value: RangeKey) => void;
}) {
  return (
    <Tabs value={range} onValueChange={(value) => onRangeChange(value as RangeKey)}>
      <TabsList>
        <TabsTrigger value="30d">30 days</TabsTrigger>
        <TabsTrigger value="12m">12 months</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

export function AdminDashboardCharts({
  metrics,
  sales30d = [],
  sales12m = [],
  growth30d = [],
  growth12m = [],
  queues = [],
}: AdminDashboardChartsProps) {
  const [range, setRange] = useState<RangeKey>("30d");
  const [drawer, setDrawer] = useState<DrawerState>(null);

  const salesSeries = range === "30d" ? sales30d : sales12m;
  const growthSeries = range === "30d" ? growth30d : growth12m;
  const sales = Array.isArray(salesSeries) ? salesSeries : [];
  const growth = Array.isArray(growthSeries) ? growthSeries : [];
  const currency =
    sales.find((row) => row.currency)?.currency ?? metrics?.currency ?? "LKR";

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
      key: "users",
      label: "Total users",
      value: metrics.totalUsers,
      href: "/admin/buyers",
      icon: Users,
    },
    {
      key: "sellers",
      label: "Active sellers",
      value: metrics.activeSellers,
      href: "/admin/sellers/performance",
      icon: Store,
    },
    {
      key: "orders",
      label: "Open requests",
      value: metrics.totalOrders,
      href: "/admin/requests?filter=requested",
      icon: Receipt,
    },
    {
      key: "revenue",
      label: "Sold requests",
      value: metrics.grossRevenue,
      hint: "Completed sales",
      href: "/admin/requests?filter=sold",
      icon: Banknote,
    },
  ];

  function sparkValues(card: MetricCard): { value: number }[] {
    switch (card.key) {
      case "users":
        return sparkFromSeries(sparkGrowth, "newUsers");
      case "sellers":
        return sparkFromSeries(sparkGrowth, "newSellers");
      case "orders":
        return sparkFromSeries(sparkSales, "orderCount");
      case "revenue":
        return sparkFromSeries(sparkSales, "revenue");
    }
  }

  function metricDrawerChart(metric: MetricKey): ReactNode {
    if (metric === "users" || metric === "sellers") {
      const series: PortalLineSeries[] =
        metric === "users"
          ? [{ dataKey: "newUsers", name: "New users", color: "var(--accent)" }]
          : [
              {
                dataKey: "newSellers",
                name: "New sellers",
                color: "var(--chart-3)",
              },
            ];
      return (
        <PortalLineChart
          data={growthData}
          series={series}
          height={220}
          emptyMessage="No signup activity in this range yet."
        />
      );
    }

    if (metric === "orders") {
      return (
        <PortalLineChart
          data={salesData}
          series={[
            {
              dataKey: "orderCount",
              name: "Orders",
              color: "var(--accent)",
            },
          ]}
          height={220}
          emptyMessage="No orders in this range yet."
        />
      );
    }

    return (
      <PortalLineChart
        data={salesData}
        series={[
          {
            dataKey: "revenue",
            name: "Revenue",
            color: "var(--foreground)",
          },
        ]}
        height={220}
        formatLeftTick={(v) => formatCompactCurrency(v, currency)}
        emptyMessage="No paid revenue in this range yet."
      />
    );
  }

  const activeMetric =
    drawer?.kind === "metric"
      ? metricCards.find((card) => card.key === drawer.metric)
      : null;
  const activeQueue =
    drawer?.kind === "queue" ? queues[drawer.index] ?? null : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => setDrawer({ kind: "metric", metric: card.key })}
              className={cn(
                "rounded-2xl border border-border/80 bg-card p-5 text-left shadow-none transition-colors",
                "hover:border-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              <div className="flex items-center gap-2.5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
                  <Icon className="size-4" strokeWidth={1.75} aria-hidden />
                </span>
                <p className="text-sm font-semibold tracking-tight">{card.label}</p>
              </div>
              <p className="mt-5 text-3xl font-semibold tracking-tight tabular-nums">
                {card.value}
              </p>
              {card.hint ? (
                <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
              ) : null}
              <Sparkline
                data={sparkValues(card)}
                className="mt-4 h-12 w-full"
                color={
                  card.key === "sellers" ? "var(--chart-3)" : "var(--accent)"
                }
              />
            </button>
          );
        })}
      </div>

      <PortalPanel>
        <Tabs defaultValue="sales" className="gap-4">
          <TabsList>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="signups">Signups</TabsTrigger>
            <TabsTrigger value="queues">Queues</TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="mt-2 flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Paid revenue and orders created ·{" "}
                {range === "30d" ? "daily" : "monthly"} buckets.
              </p>
              <RangeTabs range={range} onRangeChange={setRange} />
            </div>
            <PortalLineChart
              data={salesData}
              series={[
                {
                  dataKey: "orderCount",
                  name: "Orders",
                  color: "var(--accent)",
                  yAxisId: "left",
                },
                {
                  dataKey: "revenue",
                  name: "Revenue",
                  color: "var(--foreground)",
                  yAxisId: "right",
                },
              ]}
              formatRightTick={(v) => formatCompactCurrency(v, currency)}
            />
          </TabsContent>

          <TabsContent value="signups" className="mt-2 flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                New accounts and approved sellers ·{" "}
                {range === "30d" ? "daily" : "monthly"} buckets.
              </p>
              <RangeTabs range={range} onRangeChange={setRange} />
            </div>
            <PortalLineChart
              data={growthData}
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
                  strokeDasharray: "4 4",
                },
              ]}
            />
          </TabsContent>

          <TabsContent value="queues" className="mt-2">
            <ul className="divide-y divide-border rounded-xl border border-border/80">
              {queues.map((queue, index) => (
                <li key={queue.href}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/60"
                    onClick={() => setDrawer({ kind: "queue", index })}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold tracking-tight">
                        {queue.title}
                      </p>
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">
                        {queue.body}
                      </p>
                    </div>
                    <ChevronRight
                      className="size-4 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                  </button>
                </li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>
      </PortalPanel>

      <Drawer
        contained
        direction="bottom"
        open={drawer !== null}
        onOpenChange={(open) => {
          if (!open) setDrawer(null);
        }}
      >
        <DrawerContent>
          {activeMetric ? (
            <>
              <DrawerHeader>
                <DrawerTitle>{activeMetric.label}</DrawerTitle>
                <DrawerDescription>
                  {activeMetric.value}
                  {activeMetric.hint ? ` · ${activeMetric.hint}` : null}
                  {" · "}
                  {range === "30d" ? "Last 30 days" : "Last 12 months"}
                </DrawerDescription>
              </DrawerHeader>
              <div className="flex-1 overflow-y-auto px-6 pb-2">
                {metricDrawerChart(activeMetric.key)}
              </div>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button size="sm" variant="outline">
                    Close
                  </Button>
                </DrawerClose>
                <Button size="sm" asChild>
                  <Link href={activeMetric.href}>Open page</Link>
                </Button>
              </DrawerFooter>
            </>
          ) : null}

          {activeQueue ? (
            <>
              <DrawerHeader>
                <DrawerTitle>{activeQueue.title}</DrawerTitle>
                <DrawerDescription>{activeQueue.body}</DrawerDescription>
              </DrawerHeader>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button size="sm" variant="outline">
                    Close
                  </Button>
                </DrawerClose>
                <Button size="sm" asChild>
                  <Link href={activeQueue.href}>{activeQueue.cta}</Link>
                </Button>
              </DrawerFooter>
            </>
          ) : null}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
