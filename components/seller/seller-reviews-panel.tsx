import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { PortalHorizontalBarChart } from "@/components/charts/portal-horizontal-bar-chart";
import { StarRating } from "@/components/seller/star-rating";
import { PortalPanel } from "@/components/layout/portal-panel";
import { Button } from "@/components/ui/button";
import type { Review } from "@/lib/types";
import type {
  SellerReviewDistributionRow,
  SellerReviewMetrics,
} from "@/lib/services/reviews";

function formatReviewDate(iso?: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function DistributionBars({
  distribution,
  count,
}: {
  distribution: SellerReviewDistributionRow[];
  count: number;
}) {
  if (count === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Rating breakdown appears after your first approved review.
      </p>
    );
  }

  return (
    <ul className="space-y-2.5">
      {[...distribution].reverse().map((row) => (
        <li key={row.stars} className="grid grid-cols-[3.5rem_1fr_2.5rem] items-center gap-3 text-sm">
          <span className="text-muted-foreground">{row.stars}★</span>
          <div className="h-2 overflow-hidden rounded-full bg-muted/50">
            <div
              className="h-full rounded-full bg-accent transition-[width]"
              style={{ width: `${row.percent}%` }}
            />
          </div>
          <span className="text-right tabular-nums text-muted-foreground">
            {row.count}
          </span>
        </li>
      ))}
    </ul>
  );
}

type SellerReviewsPanelProps = {
  metrics: SellerReviewMetrics;
  reviews: Review[];
  shopSlug: string | null;
  variant?: "page" | "summary";
};

export function SellerReviewsPanel({
  metrics,
  reviews,
  shopSlug,
  variant = "page",
}: SellerReviewsPanelProps) {
  const chartRows = metrics.distribution
    .filter((row) => row.count > 0)
  .map((row) => ({
    label: `${row.stars} stars`,
    count: row.count,
  }));

  if (variant === "summary") {
    return (
      <PortalPanel>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold tracking-tight">
              Seller ratings
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Public averages from admin-approved reviews only
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/seller/reviews">All reviews</Link>
          </Button>
        </div>

        {metrics.count === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">
            No approved reviews yet. Buyers can rate you after a sold request;
            admins approve before they appear on your shop.
          </p>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,200px)_minmax(0,1fr)]">
            <div className="rounded-xl border border-border bg-muted/15 p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Average
              </p>
              <p className="mt-2 text-4xl font-semibold tabular-nums tracking-tight text-foreground">
                {metrics.average?.toFixed(1) ?? "—"}
              </p>
              <StarRating
                rating={Math.round(metrics.average ?? 0)}
                size="md"
                className="mt-3"
              />
              <p className="mt-2 text-sm text-muted-foreground">
                {metrics.count}{" "}
                {metrics.count === 1 ? "review" : "reviews"}
              </p>
            </div>
            <div className="min-w-0 space-y-4">
              <DistributionBars
                distribution={metrics.distribution}
                count={metrics.count}
              />
              {reviews.length > 0 ? (
                <ul className="space-y-3 border-t border-border pt-4">
                  {reviews.slice(0, 2).map((review) => (
                    <li key={review.$id} className="text-sm">
                      <StarRating rating={review.rating} showValue />
                      <p className="mt-1 line-clamp-2 text-muted-foreground">
                        {review.comment?.trim() || "No written comment"}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        )}
      </PortalPanel>
    );
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
          <aside className="border-b border-border bg-muted/15 p-6 lg:border-b-0 lg:border-r">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Average rating
            </p>
            <p className="mt-2 text-5xl font-semibold tabular-nums tracking-tight text-foreground">
              {metrics.count === 0 ? "—" : metrics.average?.toFixed(1)}
            </p>
            {metrics.count > 0 ? (
              <StarRating
                rating={Math.round(metrics.average ?? 0)}
                size="md"
                className="mt-3"
              />
            ) : null}
            <p className="mt-3 text-sm text-muted-foreground">
              {metrics.count} approved{" "}
              {metrics.count === 1 ? "review" : "reviews"}
            </p>
            {shopSlug ? (
              <Button variant="outline" size="sm" className="mt-5 w-full" asChild>
                <Link href={`/shop/${shopSlug}`} target="_blank" rel="noopener noreferrer">
                  View on shop
                  <ExternalLink data-icon="inline-end" className="size-3.5" />
                </Link>
              </Button>
            ) : null}
          </aside>

          <div className="p-6">
            <h3 className="text-sm font-semibold text-foreground">
              Rating breakdown
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Share of each star rating among approved reviews
            </p>
            <div className="mt-5">
              <DistributionBars
                distribution={metrics.distribution}
                count={metrics.count}
              />
            </div>
            {chartRows.length > 0 ? (
              <div className="mt-8 hidden xl:block">
                <PortalHorizontalBarChart
                  data={chartRows}
                  labelKey="label"
                  valueKey="count"
                  valueName="Reviews"
                  height={180}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <PortalPanel>
        <h3 className="text-base font-semibold tracking-tight">
          Approved reviews
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Only reviews approved by admins are shown here and on your storefront.
        </p>

        {reviews.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">
            Nothing to show yet. Pending or rejected reviews are not listed.
          </p>
        ) : (
          <ul className="mt-6 space-y-4">
            {reviews.map((review) => (
              <li
                key={review.$id}
                className="rounded-xl border border-border bg-background px-4 py-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <StarRating rating={review.rating} showValue />
                  <time
                    dateTime={review.$createdAt}
                    className="text-xs text-muted-foreground"
                  >
                    {formatReviewDate(review.$createdAt)}
                  </time>
                </div>
                {review.comment ? (
                  <p className="mt-3 text-sm leading-relaxed text-foreground">
                    {review.comment}
                  </p>
                ) : (
                  <p className="mt-3 text-sm italic text-muted-foreground">
                    No written comment
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </PortalPanel>
    </div>
  );
}
