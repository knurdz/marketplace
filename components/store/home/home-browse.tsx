import Link from "next/link";
import { DemoListingCard } from "@/components/store/demo-listing-card";
import { MarketCategoryCircles } from "@/components/store/market/market-category-circles";
import { MarketFilters } from "@/components/store/market/market-filters";
import { EmptyState } from "@/components/layout/empty-state";
import { SectionHeading } from "@/components/store/section-heading";
import { Button } from "@/components/ui/button";
import {
  filterMarketListings,
  MARKET_CATEGORIES,
  type MarketListingSort,
} from "@/lib/store/home-demo";

type HomeBrowseSharedProps = {
  category: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  sort: MarketListingSort;
  invalidPriceRange: boolean;
};

/** Category circles + sort/price filters: place near the top of home. */
export function HomeBrowseControls({
  category,
  minPrice,
  maxPrice,
  sort,
  invalidPriceRange,
}: HomeBrowseSharedProps) {
  return (
    <div id="browse" className="scroll-mt-24 space-y-10">
      <MarketCategoryCircles activeSlug={category} />
      <MarketFilters
        category={category}
        minPrice={minPrice}
        maxPrice={maxPrice}
        sort={sort}
        invalidPriceRange={invalidPriceRange}
      />
    </div>
  );
}

/** Filtered multi-row product grid. */
export function HomeBrowseListings({
  category,
  minPrice,
  maxPrice,
  sort,
  invalidPriceRange,
}: HomeBrowseSharedProps) {
  const listings = invalidPriceRange
    ? []
    : filterMarketListings({ category, minPrice, maxPrice, sort });

  const hasFilters =
    category != null ||
    minPrice != null ||
    maxPrice != null ||
    sort !== "newest";
  const categoryLabel =
    MARKET_CATEGORIES.find((entry) => entry.slug === category)?.label ?? null;

  return (
    <section className="space-y-5 pb-6">
      <SectionHeading
        title={categoryLabel ?? "All listings"}
        description={
          invalidPriceRange
            ? undefined
            : `${listings.length} listing${listings.length === 1 ? "" : "s"}`
        }
      />

      {invalidPriceRange ? (
        <EmptyState
          title="Check the price range"
          description="The minimum cannot be higher than the maximum."
        />
      ) : listings.length === 0 ? (
        <EmptyState
          title={hasFilters ? "Nothing in this range" : "No listings yet"}
          description={
            hasFilters
              ? "Try another category or clear the price filter."
              : "Check back after people publish listings."
          }
          action={
            <Button asChild>
              <Link href="/#browse">Clear filters</Link>
            </Button>
          }
        />
      ) : (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {listings.map((listing) => (
            <DemoListingCard
              key={`${listing.categorySlug}-${listing.id}`}
              listing={listing}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
