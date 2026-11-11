"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PortalChartShell } from "@/components/charts/portal-chart-shell";
import { cn } from "@/lib/utils";

export type PortalAreaSeries = {
  dataKey: string;
  name: string;
  color: string;
  fillOpacity?: number;
};

type PortalAreaChartProps<T extends object> = {
  data: T[];
  series: PortalAreaSeries[];
  xDataKey?: string;
  height?: number;
  emptyMessage?: string;
  className?: string;
};

type TooltipRow = { name?: string; value?: number; color?: string };

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipRow[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-sm">
      {label ? (
        <p className="font-medium text-foreground">{label}</p>
      ) : null}
      <ul className="mt-1 space-y-0.5">
        {payload.map((row) => (
          <li
            key={row.name}
            className="flex items-center justify-between gap-4 text-muted-foreground"
          >
            <span className="flex items-center gap-1.5">
              <span
                className="size-2 rounded-full"
                style={{ background: row.color }}
              />
              {row.name}
            </span>
            <span className="font-medium tabular-nums text-foreground">
              {row.value ?? 0}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function hasSeriesData<T extends object>(
  data: T[],
  series: PortalAreaSeries[],
): boolean {
  return series.some((line) =>
    data.some((row) => {
      const value = row[line.dataKey as keyof T];
      return typeof value === "number" && value > 0;
    }),
  );
}

export function PortalAreaChart<T extends object>({
  data,
  series,
  xDataKey = "label",
  height = 280,
  emptyMessage,
  className,
}: PortalAreaChartProps<T>) {
  const rows = Array.isArray(data) ? data : [];
  const hasValues = hasSeriesData(rows, series);

  return (
    <PortalChartShell
      height={height}
      emptyMessage={emptyMessage}
      hasRows={rows.length > 0}
      hasValues={hasValues}
    >
      <div className={cn("size-full", className)}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <AreaChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              {series.map((line) => (
                <linearGradient
                  key={line.dataKey}
                  id={`gradient-${line.dataKey}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={line.color}
                    stopOpacity={line.fillOpacity ?? 0.35}
                  />
                  <stop offset="100%" stopColor={line.color} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              vertical={false}
              strokeDasharray="4 4"
              className="stroke-border/80"
            />
            <XAxis
              dataKey={xDataKey}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={24}
            />
            <YAxis
              allowDecimals={false}
              width={36}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<ChartTooltip />} />
            {series.length > 1 ? (
              <Legend
                verticalAlign="top"
                height={28}
                iconType="circle"
                wrapperStyle={{ fontSize: 12 }}
              />
            ) : null}
            {series.map((line) => (
              <Area
                key={line.dataKey}
                type="monotone"
                dataKey={line.dataKey}
                name={line.name}
                stroke={line.color}
                strokeWidth={2}
                fill={`url(#gradient-${line.dataKey})`}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
                isAnimationActive={hasValues}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </PortalChartShell>
  );
}
