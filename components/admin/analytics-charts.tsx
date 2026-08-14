"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SalesBucket, UserGrowthBucket } from "@/lib/services";

type AnalyticsChartsProps = {
  sales: SalesBucket[];
  growth: UserGrowthBucket[];
  currency: string;
  bucketLabel: string;
};

function formatBucketLabel(bucket: string, isMonthly: boolean): string {
  if (isMonthly) {
    const [year, month] = bucket.split("-");
    if (!year || !month) return bucket;
    try {
      return new Intl.DateTimeFormat(undefined, {
        month: "short",
        year: "2-digit",
        timeZone: "UTC",
      }).format(new Date(Date.UTC(Number(year), Number(month) - 1, 1)));
    } catch {
      return bucket;
    }
  }

  try {
    const [year, month, day] = bucket.split("-").map(Number);
    if (!year || !month || !day) return bucket;
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(year, month - 1, day)));
  } catch {
    return bucket;
  }
}

function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "LKR",
      maximumFractionDigits: 2,
    }).format(amount);
  }
}

type SalesTooltipProps = {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: SalesBucket }>;
  currency: string;
};

function SalesTooltip({ active, payload, currency }: SalesTooltipProps) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-sm">
      <p className="font-mono text-muted-foreground">{row.bucket}</p>
      <p className="mt-1">Orders: {row.orderCount}</p>
      <p>Revenue: {formatCurrency(row.revenue, currency)}</p>
    </div>
  );
}

type GrowthTooltipProps = {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: UserGrowthBucket }>;
};

function GrowthTooltip({ active, payload }: GrowthTooltipProps) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-sm">
      <p className="font-mono text-muted-foreground">{row.bucket}</p>
      <p className="mt-1">New users: {row.newUsers}</p>
      <p>New sellers: {row.newSellers}</p>
    </div>
  );
}

export function AnalyticsCharts({
  sales,
  growth,
  currency,
  bucketLabel,
}: AnalyticsChartsProps) {
  const isMonthly = bucketLabel === "month";
  const salesData = sales.map((row) => ({
    ...row,
    label: formatBucketLabel(row.bucket, isMonthly),
  }));
  const growthData = growth.map((row) => ({
    ...row,
    label: formatBucketLabel(row.bucket, isMonthly),
  }));

  const hasSales = sales.some((row) => row.orderCount > 0 || row.revenue > 0);
  const hasGrowth = growth.some(
    (row) => row.newUsers > 0 || row.newSellers > 0,
  );

  return (
    <div className="mt-10 space-y-12">
      <section>
        <h3 className="font-mono text-sm text-accent">Sales over time</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Order volume and paid revenue per {isMonthly ? "month" : "day"}.
          Aggregate counts only — no individual orders.
        </p>
        <div className="mt-6 h-72 w-full">
          {salesData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data for this range.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={salesData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  interval={isMonthly ? 0 : "preserveStartEnd"}
                />
                <YAxis
                  yAxisId="orders"
                  allowDecimals={false}
                  tick={{ fontSize: 11 }}
                  width={40}
                />
                <YAxis
                  yAxisId="revenue"
                  orientation="right"
                  tick={{ fontSize: 11 }}
                  width={72}
                  tickFormatter={(v: number) =>
                    new Intl.NumberFormat(undefined, {
                      notation: "compact",
                      maximumFractionDigits: 1,
                    }).format(v)
                  }
                />
                <Tooltip content={<SalesTooltip currency={currency} />} />
                <Legend />
                <Bar
                  yAxisId="orders"
                  dataKey="orderCount"
                  name="Orders"
                  fill="var(--accent)"
                  radius={[2, 2, 0, 0]}
                  isAnimationActive={hasSales}
                />
                <Line
                  yAxisId="revenue"
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="var(--foreground)"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={hasSales}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section>
        <h3 className="font-mono text-sm text-accent">User growth</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          New signups and approved sellers per {isMonthly ? "month" : "day"}.
          No names or account identifiers.
        </p>
        <div className="mt-6 h-72 w-full">
          {growthData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data for this range.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={growthData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  interval={isMonthly ? 0 : "preserveStartEnd"}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={40} />
                <Tooltip content={<GrowthTooltip />} />
                <Legend />
                <Bar
                  dataKey="newUsers"
                  name="New users"
                  fill="var(--accent)"
                  radius={[2, 2, 0, 0]}
                  isAnimationActive={hasGrowth}
                />
                <Line
                  type="monotone"
                  dataKey="newSellers"
                  name="New sellers"
                  stroke="var(--foreground)"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={hasGrowth}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>
    </div>
  );
}
