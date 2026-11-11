"use client";

import type { ComponentProps, ReactNode } from "react";
import { StarRating } from "@/components/seller/star-rating";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { SellerReviewMetrics } from "@/lib/services/reviews";
import type { Review } from "@/lib/types";

function formatReviewDate(iso?: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function DistributionBars({
  distribution,
  count,
}: {
  distribution: SellerReviewMetrics["distribution"];
  count: number;
}) {
  if (count === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Rating breakdown appears after the first approved review.
      </p>
    );
  }

  return (
    <ul className="space-y-2.5">
      {[...distribution].reverse().map((row) => (
        <li
          key={row.stars}
          className="grid grid-cols-[3.5rem_1fr_2.5rem] items-center gap-3 text-sm"
        >
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

type ShopReviewsSheetProps = {
  shopName: string;
  metrics: SellerReviewMetrics;
  reviews: Review[];
  triggerVariant?: ComponentProps<typeof Button>["variant"];
  triggerSize?: ComponentProps<typeof Button>["size"];
  triggerClassName?: string;
  triggerLabel?: ReactNode;
};

export function ShopReviewsSheet({
  shopName,
  metrics,
  reviews,
  triggerVariant = "secondary",
  triggerSize = "sm",
  triggerClassName,
  triggerLabel = "See reviews",
}: ShopReviewsSheetProps) {
  const averageLabel =
    metrics.count > 0 && metrics.average != null
      ? metrics.average.toFixed(1)
      : "—";

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant={triggerVariant}
          size={triggerSize}
          className={triggerClassName}
        >
          {triggerLabel}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto sm:max-w-md"
      >
        <SheetHeader className="border-b border-border">
          <SheetTitle>Seller reviews</SheetTitle>
          <SheetDescription>
            Admin-approved ratings for {shopName}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-8 p-4">
          <div className="rounded-xl border border-border bg-muted/15 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Average rating
            </p>
            <p className="mt-2 text-4xl font-semibold tabular-nums tracking-tight text-foreground">
              {averageLabel}
            </p>
            {metrics.count > 0 && metrics.average != null ? (
              <StarRating
                rating={Math.round(metrics.average)}
                size="md"
                className="mt-3"
              />
            ) : null}
            <p className="mt-2 text-sm text-muted-foreground">
              {metrics.count}{" "}
              {metrics.count === 1 ? "review" : "reviews"}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Rating breakdown
            </h3>
            <div className="mt-4">
              <DistributionBars
                distribution={metrics.distribution}
                count={metrics.count}
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Reviews
            </h3>
            {reviews.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                No approved reviews yet.
              </p>
            ) : (
              <ul className="mt-4 space-y-4">
                {reviews.map((review) => (
                  <li
                    key={review.$id}
                    className="rounded-xl border border-border bg-card px-4 py-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <StarRating rating={review.rating} showValue />
                      {review.$createdAt ? (
                        <time
                          dateTime={review.$createdAt}
                          className="text-xs text-muted-foreground"
                        >
                          {formatReviewDate(review.$createdAt)}
                        </time>
                      ) : null}
                    </div>
                    <p className="mt-2 text-xs font-medium text-muted-foreground">
                      Verified buyer
                    </p>
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
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
