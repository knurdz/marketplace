import { redirect } from "next/navigation";
import { CatalogView } from "@/components/store/catalog-view";
import {
  listCategories,
  listCoverImagesByProductIds,
  normalizeProductSearchQuery,
  parseProductCatalogParams,
  searchActiveProducts,
} from "@/lib/services";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const rawQ = typeof params.q === "string" ? params.q : "";
  const normalized = normalizeProductSearchQuery(rawQ);
  if (!normalized) {
    redirect("/market");
  }

  const catalogParams = parseProductCatalogParams(params);
  const [products, categories] = await Promise.all([
    catalogParams.invalidPriceRange
      ? Promise.resolve([])
      : searchActiveProducts(normalized, {
          limit: 48,
          minPrice: catalogParams.minPrice,
          maxPrice: catalogParams.maxPrice,
          sort: catalogParams.sort,
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
      eyebrow="Search"
      title={`“${normalized}”`}
      description="Active listings matching the title."
      categories={categories}
      products={products}
      covers={covers}
      filterAction="/search"
      catalogParams={catalogParams}
      preserve={{ q: normalized }}
      resultLabel={`${products.length} result${products.length === 1 ? "" : "s"}`}
      emptyTitle={hasActiveFilters ? "No matches in this range" : "No matches"}
      emptyDescription={`Nothing active matched “${normalized}”.`}
      invalidPriceRange={catalogParams.invalidPriceRange}
    />
  );
}
