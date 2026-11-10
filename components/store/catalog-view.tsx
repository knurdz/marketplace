import { ProductCatalogFilters } from "@/components/store/product-catalog-filters";
import { CategoryRail } from "@/components/store/category-rail";
import { ProductGrid } from "@/components/store/product-grid";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import type { ProductCatalogParams, ProductCoverMap } from "@/lib/services/products";
import type { Category, Product } from "@/lib/types";
import Link from "next/link";

type CatalogViewProps = {
  title: string;
  description?: string;
  categories: Category[];
  activeSlug?: string;
  products: Product[];
  covers: ProductCoverMap;
  filterAction: string;
  catalogParams: ProductCatalogParams;
  preserve?: Record<string, string>;
  resultLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  invalidPriceRange: boolean;
};

export function CatalogView({
  title,
  description,
  categories,
  activeSlug,
  products,
  covers,
  filterAction,
  catalogParams,
  preserve,
  resultLabel,
  emptyTitle,
  emptyDescription,
  invalidPriceRange,
}: CatalogViewProps) {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-10 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <section
        aria-labelledby="catalog-heading"
        className="mx-auto max-w-2xl space-y-2 text-center"
      >
        <h1
          id="catalog-heading"
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
        >
          {title}
        </h1>
        {description ? (
          <p className="text-base text-muted-foreground sm:text-lg">
            {description}
          </p>
        ) : null}
      </section>

      <div className="space-y-5">
        <CategoryRail categories={categories} activeSlug={activeSlug} />
        <ProductCatalogFilters
          action={filterAction}
          defaults={catalogParams}
          preserve={preserve}
        />
        <p className="text-sm text-muted-foreground">
          {invalidPriceRange
            ? "Minimum price cannot be greater than maximum."
            : resultLabel}
        </p>
      </div>

      {invalidPriceRange ? (
        <EmptyState
          title="Check the price range"
          description="The minimum cannot be higher than the maximum."
        />
      ) : products.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          action={
            <Button asChild>
              <Link href="/#browse">Browse listings</Link>
            </Button>
          }
        />
      ) : (
        <div className="pb-6">
          <ProductGrid products={products} covers={covers} />
        </div>
      )}
    </main>
  );
}
