"use client";

import { useEffect, useState, type ReactNode } from "react";

type PortalChartShellProps = {
  height: number;
  emptyMessage?: string;
  hasRows: boolean;
  hasValues: boolean;
  children: ReactNode;
};

/** Client-only mount + empty states for Recharts. */
export function PortalChartShell({
  height,
  emptyMessage = "No data for this period yet.",
  hasRows,
  hasValues,
  children,
}: PortalChartShellProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!hasRows) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  if (!mounted) {
    return (
      <div
        className="w-full animate-pulse rounded-lg bg-muted/50"
        style={{ height }}
        aria-hidden
      />
    );
  }

  if (!hasValues) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-dashed border-border bg-muted/15 text-sm text-muted-foreground"
        style={{ height }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      {children}
    </div>
  );
}
