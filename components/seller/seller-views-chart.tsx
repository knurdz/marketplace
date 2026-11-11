"use client";

import { PortalLineChart } from "@/components/charts/portal-line-chart";
import { formatDayBucketLabel } from "@/lib/charts/format-bucket-label";

type ShopPoint = { bucket: string; count: number };

export function SellerShopViewsChart({ series }: { series: ShopPoint[] }) {
  const data = series.map((row) => ({
    ...row,
    label: formatDayBucketLabel(row.bucket),
  }));

  return (
    <PortalLineChart
      data={data}
      height={220}
      series={[
        {
          dataKey: "count",
          name: "Shop views",
          color: "var(--accent)",
        },
      ]}
      emptyMessage="Shop views appear after buyers open your storefront."
    />
  );
}
