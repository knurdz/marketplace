import { ShopReviewsSheet } from "@/components/store/shop-reviews-sheet";
import type { PublicSellerInfo } from "@/lib/services/sellers";
import type { SellerReviewMetrics } from "@/lib/services/reviews";
import type { Review } from "@/lib/types";

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

  const stats: string[] = [
    `${listingCount} ${listingCount === 1 ? "listing" : "listings"}`,
  ];
  if (sellingSince) {
    stats.push(`Selling since ${sellingSince}`);
  }

  return (
    <header className="overflow-hidden rounded-xl border border-border bg-card">
      {bannerUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- Storage preview URL
        <img
          src={bannerUrl}
          alt=""
          className="h-40 w-full object-cover sm:h-56"
        />
      ) : (
        <div
          className="h-40 w-full bg-muted sm:h-56"
          aria-hidden
        />
      )}

      <div className="px-4 pb-6 pt-0 sm:px-6">
        {/* Monogram alone overlaps the banner; name/handle sit on the card. */}
        <div className="-mt-8 sm:-mt-10">
          <div
            className="flex size-16 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-2xl font-bold tracking-tight text-foreground shadow-sm sm:size-20 sm:text-3xl"
            aria-hidden
          >
            {initial}
          </div>
        </div>

        <div className="mt-3 min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
            {seller.shopName}
          </h1>
          <p className="mt-1 font-mono text-sm text-accent">@{seller.slug}</p>
        </div>

        <div className="mt-4">
          <ShopReviewsSheet
            shopName={seller.shopName}
            metrics={metrics}
            reviews={reviews}
            triggerMode="rating-pill"
          />
        </div>

        <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
          {stats.map((stat, index) => (
            <span key={stat} className="inline-flex items-center gap-3">
              {index > 0 ? (
                <span
                  className="hidden h-1 w-1 rounded-full bg-muted-foreground/50 sm:inline-block"
                  aria-hidden
                />
              ) : null}
              {stat}
            </span>
          ))}
        </p>
      </div>
    </header>
  );
}
