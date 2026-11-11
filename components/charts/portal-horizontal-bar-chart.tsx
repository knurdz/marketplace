"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PortalChartShell } from "@/components/charts/portal-chart-shell";

type PortalHorizontalBarChartProps<T extends Record<string, unknown>> = {
  data: T[];
  labelKey: string;
  valueKey: string;
  valueName?: string;
  color?: string;
  height?: number;
  emptyMessage?: string;
};

export function PortalHorizontalBarChart<T extends Record<string, unknown>>({
  data,
  labelKey,
  valueKey,
  valueName = "Views",
  color = "var(--accent)",
  height = 240,
  emptyMessage = "No listing views yet.",
}: PortalHorizontalBarChartProps<T>) {
  const rows = Array.isArray(data) ? data : [];
  const hasValues = rows.some((row) => {
    const value = row[valueKey];
    return typeof value === "number" && value > 0;
  });

  const chartHeight = Math.max(height, rows.length * 36 + 48);

  return (
    <PortalChartShell
      height={chartHeight}
      emptyMessage={emptyMessage}
      hasRows={rows.length > 0}
      hasValues={hasValues}
    >
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        <BarChart
          layout="vertical"
          data={rows}
          margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
        >
          <CartesianGrid horizontal={false} strokeDasharray="4 4" className="stroke-border/80" />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey={labelKey}
            width={120}
            tick={{ fontSize: 11, fill: "var(--foreground)" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.12 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const row = payload[0];
              return (
                <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-sm">
                  <p className="font-medium text-foreground">{row?.payload?.[labelKey]}</p>
                  <p className="mt-1 text-muted-foreground">
                    {valueName}:{" "}
                    <span className="font-medium tabular-nums text-foreground">
                      {row?.value ?? 0}
                    </span>
                  </p>
                </div>
              );
            }}
          />
          <Bar
            dataKey={valueKey}
            name={valueName}
            fill={color}
            radius={[0, 4, 4, 0]}
            maxBarSize={20}
            isAnimationActive={hasValues}
          />
        </BarChart>
      </ResponsiveContainer>
    </PortalChartShell>
  );
}
