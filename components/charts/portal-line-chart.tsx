"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type PortalLineSeries = {
  dataKey: string;
  name: string;
  color: string;
  yAxisId?: "left" | "right";
  strokeDasharray?: string;
};

type PortalLineChartProps<T extends object> = {
  data: T[];
  xDataKey?: string;
  series: PortalLineSeries[];
  height?: number;
  emptyMessage?: string;
  formatLeftTick?: (value: number) => string;
  formatRightTick?: (value: number) => string;
};

function hasSeriesData<T extends object>(
  data: T[],
  series: PortalLineSeries[],
): boolean {
  return series.some((line) =>
    data.some((row) => {
      const value = row[line.dataKey as keyof T];
      return typeof value === "number" && value > 0;
    }),
  );
}

export function PortalLineChart<T extends object>({
  data,
  xDataKey = "label",
  series,
  height = 256,
  emptyMessage = "No data for this period yet.",
  formatLeftTick,
  formatRightTick,
}: PortalLineChartProps<T>) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const rows = Array.isArray(data) ? data : [];
  const showChart = rows.length > 0;
  const hasData = hasSeriesData(rows, series);
  const usesRightAxis = series.some((line) => line.yAxisId === "right");

  if (!showChart) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  if (!mounted) {
    return (
      <div
        className="w-full animate-pulse rounded-lg bg-muted/60"
        style={{ height }}
        aria-hidden
      />
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={0}
        minHeight={0}
        initialDimension={{ width: 640, height }}
      >
        <LineChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey={xDataKey}
            tick={{ fontSize: 11 }}
            interval="preserveStartEnd"
          />
          <YAxis
            yAxisId="left"
            allowDecimals={false}
            tick={{ fontSize: 11 }}
            width={40}
            tickFormatter={formatLeftTick}
          />
          {usesRightAxis ? (
            <YAxis
              yAxisId="right"
              orientation="right"
              allowDecimals
              tick={{ fontSize: 11 }}
              width={56}
              tickFormatter={formatRightTick}
            />
          ) : null}
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--card)",
              boxShadow: "none",
              fontSize: 12,
            }}
          />
          {series.length > 1 ? <Legend /> : null}
          {series.map((line) => (
            <Line
              key={line.dataKey}
              yAxisId={line.yAxisId ?? "left"}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color}
              strokeWidth={2}
              strokeDasharray={line.strokeDasharray}
              dot={false}
              isAnimationActive={hasData}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
