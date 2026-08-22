"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ShopPoint = { bucket: string; count: number };

function formatDay(bucket: string): string {
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

export function SellerShopViewsChart({ series }: { series: ShopPoint[] }) {
  const data = series.map((row) => ({
    ...row,
    label: formatDay(row.bucket),
  }));
  const hasData = series.some((row) => row.count > 0);

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={36} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="count"
            name="Shop views"
            stroke="var(--accent)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={hasData}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
