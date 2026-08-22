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
import type { SellerSalesBucket } from "@/lib/services";

type SellerEarningsChartProps = {
  series: SellerSalesBucket[];
  currency: string;
  range: "30d" | "12m";
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

function SalesTooltip({
  active,
  payload,
  currency,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: SellerSalesBucket }>;
  currency: string;
}) {
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

export function SellerEarningsChart({
  series,
  currency,
  range,
}: SellerEarningsChartProps) {
  const isMonthly = range === "12m";
  const data = series.map((row) => ({
    ...row,
    label: formatBucketLabel(row.bucket, isMonthly),
  }));
  const hasSales = series.some((row) => row.orderCount > 0 || row.revenue > 0);

  return (
    <div className="h-64 w-full">
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground">No data for this range.</p>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
              width={36}
            />
            <YAxis
              yAxisId="revenue"
              orientation="right"
              tick={{ fontSize: 11 }}
              width={64}
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
  );
}
