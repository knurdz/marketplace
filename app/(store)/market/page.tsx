import { CatalogView } from "@/components/store/catalog-view";
import {
  listActiveProducts,
  listCategories,
  listCoverImagesByProductIds,
  parseProductCatalogParams,
} from "@/lib/services";

type MarketPageProps = {
  searchParams: Promise<{
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  }>;
};

export default async function MarketPage({ searchParams }: MarketPageProps) {
  const params = await searchParams;
  const catalogParams = parseProductCatalogParams(params);
  const [products, categories] = await Promise.all([
    listActiveProducts({
      limit: 48,
      minPrice: catalogParams.minPrice,
      maxPrice: catalogParams.maxPrice,
      sort: catalogParams.sort,
      invalidPriceRange: catalogParams.invalidPriceRange,
    }),
    listCategories(),
  ]);
  const covers = await listCoverImagesByProductIds(products.map((p) => p.$id));

  const hasActiveFilters =
    catalogParams.minPrice != null ||
    catalogParams.maxPrice != null ||
    catalogParams.sort !== "newest";

  return (
    <CatalogView
      title="Market"
      description="Active listings from approved sellers. Filter by price, sort, or jump into a category."
      categories={categories}
      products={products}
      covers={covers}
      filterAction="/market"
      catalogParams={catalogParams}
      resultLabel={`${products.length} listing${products.length === 1 ? "" : "s"}`}
      emptyTitle={hasActiveFilters ? "Nothing in this range" : "No listings yet"}
      emptyDescription={
        hasActiveFilters
          ? "Try widening the price range or clearing sort."
          : "Check back after sellers publish."
      }
      invalidPriceRange={catalogParams.invalidPriceRange}
    />
  );
}
