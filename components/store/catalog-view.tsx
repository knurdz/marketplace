import { ProductCatalogFilters } from "@/components/store/product-catalog-filters";
import { CategoryRail } from "@/components/store/category-rail";
import { ProductGrid } from "@/components/store/product-grid";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import type { ProductCatalogParams, ProductCoverMap } from "@/lib/services/products";
import type { Category, Product } from "@/lib/types";
import Link from "next/link";

type CatalogViewProps = {
  title: string;
  description?: string;
  eyebrow?: string;
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
  eyebrow = "Market",
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
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />

      <div className="mt-8 space-y-6">
        <CategoryRail categories={categories} activeSlug={activeSlug} />
        <ProductCatalogFilters
          action={filterAction}
          defaults={catalogParams}
          preserve={preserve}
        />
        <p className="font-mono text-xs tabular-nums text-muted-foreground">
          {invalidPriceRange ? "Minimum price cannot be greater than maximum." : resultLabel}
        </p>
      </div>

      {invalidPriceRange ? (
        <EmptyState
          className="mt-8"
          title="Check the price range"
          description="The minimum cannot be higher than the maximum."
        />
      ) : products.length === 0 ? (
        <EmptyState
          className="mt-8"
          title={emptyTitle}
          description={emptyDescription}
          action={
            <Button asChild>
              <Link href="/market">Browse all listings</Link>
            </Button>
          }
        />
      ) : (
        <div className="mt-8">
          <ProductGrid products={products} covers={covers} />
        </div>
      )}
    </main>
  );
}
