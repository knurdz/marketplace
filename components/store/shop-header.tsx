"use client";

import { ShopReviewsSheet } from "@/components/store/shop-reviews-sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { PublicSellerInfo } from "@/lib/services/sellers";
import type { SellerReviewMetrics } from "@/lib/services/reviews";
import type { Review } from "@/lib/types";
import { StorageImage } from "@/components/ui/storage-image";

const VERIFIED_LABEL = "Verified seller on Knurdz Marketplace";

function VerifiedSellerMark() {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={VERIFIED_LABEL}
            className="mb-0.5 inline-flex size-5 shrink-0 items-center justify-center text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:mb-1 sm:size-6"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-full"
              aria-hidden
            >
              <path d="M10.007 2.10377C8.60544 1.65006 7.08181 2.28116 6.41156 3.59306L5.60578 5.17023C5.51004 5.35763 5.35763 5.51004 5.17023 5.60578L3.59306 6.41156C2.28116 7.08181 1.65006 8.60544 2.10377 10.007L2.64923 11.692C2.71404 11.8922 2.71404 12.1078 2.64923 12.308L2.10377 13.993C1.65006 15.3946 2.28116 16.9182 3.59306 17.5885L5.17023 18.3942C5.35763 18.49 5.51004 18.6424 5.60578 18.8298L6.41156 20.407C7.08181 21.7189 8.60544 22.35 10.007 21.8963L11.692 21.3508C11.8922 21.286 12.1078 21.286 12.308 21.3508L13.993 21.8963C15.3946 22.35 16.9182 21.7189 17.5885 20.407L18.3942 18.8298C18.49 18.6424 18.6424 18.49 18.8298 18.3942L20.407 17.5885C21.7189 16.9182 22.35 15.3946 21.8963 13.993L21.3508 12.308C21.286 12.1078 21.286 11.8922 21.3508 11.692L21.8963 10.007C22.35 8.60544 21.7189 7.08181 20.407 6.41156L18.8298 5.60578C18.6424 5.51004 18.49 5.35763 18.3942 5.17023L17.5885 3.59306C16.9182 2.28116 15.3946 1.65006 13.993 2.10377L12.308 2.64923C12.1078 2.71403 11.8922 2.71404 11.692 2.64923L10.007 2.10377ZM6.75977 11.7573L8.17399 10.343L11.0024 13.1715L16.6593 7.51465L18.0735 8.92886L11.0024 15.9999L6.75977 11.7573Z" />
            </svg>
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">{VERIFIED_LABEL}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function formatSellingSince(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  // UTC + fixed labels avoid SSR/client locale and timezone mismatches.
  return `${MONTHS_SHORT[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

type ShopHeaderProps = {
  seller: PublicSellerInfo;
  bannerUrl: string | null;
  listingCount: number;
  metrics: SellerReviewMetrics;
  reviews: Review[];
};

export function ShopHeader({
  seller,
  bannerUrl,
  listingCount,
  metrics,
  reviews,
}: ShopHeaderProps) {
  const initial = seller.shopName.trim().charAt(0).toUpperCase() || "?";
  const sellingSince = formatSellingSince(seller.$createdAt);

  return (
    <header className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
      {bannerUrl ? (
        <StorageImage
          src={bannerUrl}
          alt=""
          className="h-40 w-full sm:h-52"
          imgClassName="object-cover"
          priority
        />
      ) : (
        <div
          className="h-40 w-full bg-muted sm:h-52"
          aria-hidden
        />
      )}

      <div className="p-4 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: shop identity on the clean card surface */}
          <div className="flex min-w-0 items-center gap-4">
            <div
              className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/40 text-xl font-bold tracking-tight text-foreground sm:size-16 sm:text-2xl"
              aria-hidden
            >
              {initial}
            </div>
            <div className="min-w-0">
              <div className="flex min-w-0 items-end gap-1.5">
                <h1 className="min-w-0 truncate text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {seller.shopName}
                </h1>
                <VerifiedSellerMark />
              </div>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                @{seller.slug}
              </p>
              {seller.bio ? (
                <p className="mt-1.5 line-clamp-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  {seller.bio}
                </p>
              ) : null}
            </div>
          </div>

          {/* Right: 3-cell stat strip (Rating opens reviews sheet) */}
          <div className="grid shrink-0 grid-cols-3 divide-x divide-border overflow-hidden rounded-xl border border-border bg-background">
            <ShopReviewsSheet
              shopName={seller.shopName}
              metrics={metrics}
              reviews={reviews}
              triggerMode="stat-card"
            />

            <div className="flex flex-col justify-between px-4 py-3">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                Listings
              </span>
              <span className="mt-1 text-base font-semibold tabular-nums tracking-tight text-foreground">
                {listingCount}
              </span>
              <span className="mt-0.5 text-xs text-muted-foreground">
                Active now
              </span>
            </div>

            <div className="flex flex-col justify-between px-4 py-3">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                Joined
              </span>
              <span className="mt-1 text-base font-semibold tracking-tight text-foreground">
                {sellingSince ?? "-"}
              </span>
              <span className="mt-0.5 text-xs text-muted-foreground">
                Seller since
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
