import Link from "next/link";
import { MarketCategoryCircles } from "@/components/store/market/market-category-circles";
import { MarketFilters } from "@/components/store/market/market-filters";
import { InfiniteProductGrid } from "@/components/store/infinite-product-grid";
import { EmptyState } from "@/components/layout/empty-state";
import { SectionHeading } from "@/components/store/section-heading";
import { Button } from "@/components/ui/button";
import type { ProductCatalogSort, ProductCoverMap } from "@/lib/services/products";
import type { Category, Product } from "@/lib/types";

type HomeBrowseSharedProps = {
  category: string | null;
  categoryLabel: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  sort: ProductCatalogSort;
  invalidPriceRange: boolean;
};

/** Category circles + sort/price filters: place near the top of home. */
export function HomeBrowseControls({
  categoriesWithProducts,
  category,
  minPrice,
  maxPrice,
  sort,
  invalidPriceRange,
}: HomeBrowseSharedProps & {
  categoriesWithProducts: Category[];
}) {
  return (
    <div id="browse" className="scroll-mt-24 space-y-10">
      <MarketCategoryCircles
        categories={categoriesWithProducts}
        activeSlug={category}
      />
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

/** Filtered multi-row product grid from the live catalog. */
export function HomeBrowseListings({
  category,
  categoryLabel,
  minPrice,
  maxPrice,
  sort,
  invalidPriceRange,
  products,
  covers,
  totalCount,
  catalogNextCursor,
  categoryId,
}: HomeBrowseSharedProps & {
  products: Product[];
  covers?: ProductCoverMap;
  totalCount: number;
  catalogNextCursor: string | null;
  categoryId?: string;
}) {
  const hasFilters =
    category != null ||
    minPrice != null ||
    maxPrice != null ||
    sort !== "newest";

  return (
    <section className="space-y-5 pb-6">
      <SectionHeading
        title={categoryLabel ?? "All listings"}
        description={
          invalidPriceRange
            ? undefined
            : `${totalCount} listing${totalCount === 1 ? "" : "s"}`
        }
      />

      {invalidPriceRange ? (
        <EmptyState
          title="Check the price range"
          description="The minimum cannot be higher than the maximum."
        />
      ) : products.length === 0 ? (
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
        <InfiniteProductGrid
          key={`${category ?? "all"}-${sort}-${minPrice ?? ""}-${maxPrice ?? ""}`}
          initialProducts={products}
          initialCovers={covers ?? {}}
          totalCount={totalCount}
          source="catalog"
          categoryId={categoryId}
          minPrice={minPrice}
          maxPrice={maxPrice}
          sort={sort}
          invalidPriceRange={invalidPriceRange}
          initialCursor={catalogNextCursor}
        />
      )}
    </section>
  );
}
