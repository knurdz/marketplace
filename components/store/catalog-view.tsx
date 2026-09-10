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
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="min-w-0">
        <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
          {eyebrow}
        </p>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      <div className="mt-6 space-y-4">
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
        <div className="mt-6">
          <ProductGrid products={products} covers={covers} />
        </div>
      )}
    </main>
  );
}
