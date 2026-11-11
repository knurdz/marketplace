"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  CheckCircle2,
  Clock,
  Eye,
  Package,
  ShoppingBag,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { PortalAreaChart } from "@/components/charts/portal-area-chart";
import { PortalBarChart } from "@/components/charts/portal-bar-chart";
import { PortalHorizontalBarChart } from "@/components/charts/portal-horizontal-bar-chart";
import { Sparkline } from "@/components/charts/sparkline";
import { PortalPanel } from "@/components/layout/portal-panel";
import { formatDayBucketLabel } from "@/lib/charts/format-bucket-label";
import type {
  SellerDashboardSnapshot,
  SellerRequestDayBucket,
  SellerSalesBucket,
} from "@/lib/services/seller-dashboard";
import type { SellerMetrics } from "@/lib/services/seller-metrics";
import { SellerReviewsPanel } from "@/components/seller/seller-reviews-panel";
import type { OwnSellerReviewInsights } from "@/lib/services/reviews";
import type { SellerViewInsights } from "@/lib/services/view-stats";
import { cn } from "@/lib/utils";

type SellerDashboardChartsProps = {
  metrics: SellerMetrics;
  listingCounts: SellerDashboardSnapshot["listingCounts"];
  views: SellerViewInsights;
  earningsSeries: SellerSalesBucket[];
  requestSeries: SellerRequestDayBucket[];
  viewProducts: Array<{ productId: string; title: string; count: number }>;
  shopName: string | null;
  reviewInsights: OwnSellerReviewInsights;
  /** When false, metric cards are static (admin shop detail). */
  linkMetrics?: boolean;
  /** Override for reviews summary “All reviews” link. */
  reviewsHref?: string | null;
};

function formatCount(value: number): string {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
  }).format(value);
}

type MetricCard = {
  label: string;
  value: string;
  href: string | null;
  icon: LucideIcon;
  spark: { value: number }[];
  sparkColor: string;
};

function MetricCardTile({ card }: { card: MetricCard }) {
  const hasSpark = card.spark.some((p) => p.value > 0);
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/25 text-foreground">
            <card.icon className="size-4" strokeWidth={1.75} aria-hidden />
          </span>
          <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
        </div>
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
        {card.value}
      </p>
      <div
        className={cn(
          "mt-3 h-10 w-full opacity-80 transition-opacity group-hover:opacity-100",
          !hasSpark && "opacity-30",
        )}
      >
        <Sparkline data={card.spark} color={card.sparkColor} className="h-full w-full" />
      </div>
    </>
  );

  if (!card.href) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
        {body}
      </div>
    );
  }

  return (
    <Link
      href={card.href}
      className="group block rounded-xl border border-border bg-card p-4 shadow-xs transition-colors hover:border-foreground/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {body}
    </Link>
  );
}

function mergeTrafficRows(views: SellerViewInsights) {
  const byBucket = new Map<
    string,
    { bucket: string; shopViews: number; listingViews: number; label: string }
  >();

  for (const row of views.shopSeries) {
    byBucket.set(row.bucket, {
      bucket: row.bucket,
      shopViews: row.count,
      listingViews: 0,
      label: formatDayBucketLabel(row.bucket),
    });
  }

  for (const row of views.productSeries) {
    const existing = byBucket.get(row.bucket);
    if (existing) {
      existing.listingViews = row.count;
    } else {
      byBucket.set(row.bucket, {
        bucket: row.bucket,
        shopViews: 0,
        listingViews: row.count,
        label: formatDayBucketLabel(row.bucket),
      });
    }
  }

  return [...byBucket.values()].sort((a, b) => a.bucket.localeCompare(b.bucket));
}

function mergeRequestRows(
  requestSeries: SellerRequestDayBucket[],
  earningsSeries: SellerSalesBucket[],
) {
  const byBucket = new Map(
    requestSeries.map((row) => [
      row.bucket,
      {
        ...row,
        label: formatDayBucketLabel(row.bucket),
        sold: row.sold,
      },
    ]),
  );

  for (const row of earningsSeries) {
    const existing = byBucket.get(row.bucket);
    if (existing) {
      existing.sold = Math.max(existing.sold, row.orderCount);
    } else {
      byBucket.set(row.bucket, {
        bucket: row.bucket,
        newRequests: 0,
        sold: row.orderCount,
        label: formatDayBucketLabel(row.bucket),
      });
    }
  }

  return [...byBucket.values()].sort((a, b) => a.bucket.localeCompare(b.bucket));
}

export function SellerDashboardCharts({
  metrics,
  listingCounts,
  views,
  earningsSeries,
  requestSeries,
  viewProducts,
  shopName,
  reviewInsights,
  linkMetrics = true,
  reviewsHref = "/seller/reviews",
}: SellerDashboardChartsProps) {
  const trafficData = useMemo(() => mergeTrafficRows(views), [views]);
  const requestData = useMemo(
    () => mergeRequestRows(requestSeries, earningsSeries),
    [requestSeries, earningsSeries],
  );

  const sparkNewRequests = useMemo(
    () => requestData.map((row) => ({ value: row.newRequests })),
    [requestData],
  );
  const sparkSold = useMemo(
    () => requestData.map((row) => ({ value: row.sold })),
    [requestData],
  );
  const sparkListingViews = useMemo(
    () => trafficData.map((row) => ({ value: row.listingViews })),
    [trafficData],
  );

  const topProductRows = useMemo(
    () =>
      viewProducts.slice(0, 6).map((row) => ({
        title:
          row.title.length > 28 ? `${row.title.slice(0, 27)}…` : row.title,
        views: row.count,
      })),
    [viewProducts],
  );

  const metricCards: MetricCard[] = [
    {
      label: "Open requests",
      value: formatCount(metrics.openCount),
      href: linkMetrics ? "/seller/requests?filter=open" : null,
      icon: Clock,
      spark: sparkNewRequests,
      sparkColor: "var(--chart-3)",
    },
    {
      label: "Sold",
      value: formatCount(metrics.soldCount),
      href: linkMetrics ? "/seller/requests" : null,
      icon: CheckCircle2,
      spark: sparkSold,
      sparkColor: "var(--accent)",
    },
    {
      label: "Cancelled",
      value: formatCount(metrics.cancelledCount),
      href: linkMetrics ? "/seller/requests" : null,
      icon: XCircle,
      spark: sparkSold.map(() => ({ value: 0 })),
      sparkColor: "var(--destructive)",
    },
    {
      label: "Active listings",
      value: formatCount(listingCounts.active),
      href: linkMetrics ? "/seller/listings" : null,
      icon: Package,
      spark: sparkListingViews,
      sparkColor: "var(--chart-2)",
    },
  ];

  const trafficTotal = views.shopTotal + views.productTotal;

  return (
    <div className="mt-4 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <MetricCardTile key={card.label} card={card} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <PortalPanel>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold tracking-tight">
                Storefront traffic
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {shopName ? `${shopName} · ` : ""}
                {formatCount(trafficTotal)} views in the last 30 days
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Eye className="size-3.5" aria-hidden />
              Shop + listings
            </div>
          </div>
          <div className="mt-6">
            <PortalAreaChart
              data={trafficData}
              height={300}
              emptyMessage="Views appear after buyers open your shop or listings."
              series={[
                {
                  dataKey: "shopViews",
                  name: "Shop page",
                  color: "var(--accent)",
                },
                {
                  dataKey: "listingViews",
                  name: "Listing pages",
                  color: "var(--chart-2)",
                },
              ]}
            />
          </div>
        </PortalPanel>

        <PortalPanel>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold tracking-tight">
                Request activity
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                New buyer requests vs completed sales per day
              </p>
            </div>
            <ShoppingBag className="size-4 text-muted-foreground" aria-hidden />
          </div>
          <div className="mt-6">
            <PortalBarChart
              data={requestData}
              height={300}
              emptyMessage="Charts fill in as buyers request and you mark sales."
              series={[
                {
                  dataKey: "newRequests",
                  name: "New requests",
                  color: "var(--chart-3)",
                  radius: 3,
                },
                {
                  dataKey: "sold",
                  name: "Marked sold",
                  color: "var(--accent)",
                  radius: 3,
                },
              ]}
            />
          </div>
        </PortalPanel>
      </div>

      <SellerReviewsPanel
        metrics={reviewInsights.metrics}
        reviews={reviewInsights.reviews.slice(0, 2)}
        shopSlug={null}
        variant="summary"
        allReviewsHref={reviewsHref}
      />

      {topProductRows.length > 0 ? (
        <PortalPanel>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold tracking-tight">
                Top listings by views
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Last 30 days · product detail page traffic
              </p>
            </div>
          </div>
          <div className="mt-6">
            <PortalHorizontalBarChart
              data={topProductRows}
              labelKey="title"
              valueKey="views"
              valueName="Views"
              height={200}
            />
          </div>
        </PortalPanel>
      ) : null}
    </div>
  );
}
