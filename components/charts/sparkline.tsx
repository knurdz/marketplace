"use client";

import { useEffect, useState } from "react";
import { Line, LineChart, ResponsiveContainer } from "recharts";

type SparklineProps = {
  data: { value: number }[];
  color?: string;
  className?: string;
};

/** Compact trend stroke for metric cards. No axes or legend. */
export function Sparkline({
  data,
  color = "var(--accent)",
  className,
}: SparklineProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const rows = Array.isArray(data) ? data : [];
  if (rows.length === 0) {
    return <div className={className} aria-hidden />;
  }

  if (!mounted) {
    return <div className={className} aria-hidden />;
  }

  return (
    <div className={className}>
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={0}
        minHeight={0}
        initialDimension={{ width: 240, height: 48 }}
      >
        <LineChart data={rows} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.75}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
