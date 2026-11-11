import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CatalogView } from "@/components/store/catalog-view";
import { buildPublicMetadata } from "@/lib/seo/metadata";
import {
  listCategories,
  listCoverImagesByProductIds,
  normalizeProductSearchQuery,
  parseProductCatalogParams,
  searchActiveProducts,
} from "@/lib/services";
import { CATALOG_PAGE_SIZE } from "@/lib/services/products";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  }>;
};

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const rawQ = typeof params.q === "string" ? params.q : "";
  const normalized = normalizeProductSearchQuery(rawQ);
  const title = normalized ? `Search “${normalized}”` : "Search Listings";

  return buildPublicMetadata({
    title,
    description: normalized
      ? `Search results for “${normalized}” on Knurdz Marketplace.`
      : "Search active listings on Knurdz Marketplace.",
    canonicalPath: "/search",
    noIndex: true,
    follow: true,
  });
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const rawQ = typeof params.q === "string" ? params.q : "";
  const normalized = normalizeProductSearchQuery(rawQ);
  if (!normalized) {
    redirect("/");
  }

  const catalogParams = parseProductCatalogParams(params);
  const [searchResult, categories] = await Promise.all([
    searchActiveProducts(normalized, {
      limit: CATALOG_PAGE_SIZE,
      minPrice: catalogParams.minPrice,
      maxPrice: catalogParams.maxPrice,
      sort: catalogParams.sort,
      invalidPriceRange: catalogParams.invalidPriceRange,
    }),
    listCategories(),
  ]);

  const products = searchResult.ok ? searchResult.products : [];
  const covers = await listCoverImagesByProductIds(products.map((p) => p.$id));

  const hasActiveFilters =
    catalogParams.minPrice != null ||
    catalogParams.maxPrice != null ||
    catalogParams.sort !== "newest";

  let emptyTitle = "No matches";
  let emptyDescription = `Nothing active matched “${normalized}”.`;
  const searchTotal = searchResult.ok ? searchResult.total : 0;
  let resultLabel = `${searchTotal} result${searchTotal === 1 ? "" : "s"}`;

  if (!searchResult.ok) {
    if (searchResult.reason === "too_short") {
      emptyTitle = "Add a longer search";
      emptyDescription =
        "Use at least one word with 2 or more characters.";
      resultLabel = "0 results";
    } else if (
      searchResult.reason === "failed" ||
      searchResult.reason === "unavailable"
    ) {
      emptyTitle = "Search unavailable";
      emptyDescription =
        "We could not run that search right now. Try again in a moment.";
      resultLabel = "Search failed";
    } else if (searchResult.reason === "invalid_range") {
      emptyTitle = "Check the price range";
      emptyDescription = "The minimum cannot be higher than the maximum.";
    }
  } else if (hasActiveFilters && products.length === 0) {
    emptyTitle = "No matches in this range";
    emptyDescription = `Nothing active matched “${normalized}” with these filters.`;
  }

  return (
    <CatalogView
      title={`“${normalized}”`}
      description="Listings matching your search."
      categories={categories}
      products={products}
      covers={covers}
      totalCount={searchTotal}
      catalogNextCursor={null}
      catalogMode="search"
      searchQuery={normalized}
      searchNextOffset={
        searchResult.ok ? searchResult.nextOffset : null
      }
      filterAction="/search"
      catalogParams={catalogParams}
      preserve={{ q: normalized }}
      resultLabel={resultLabel}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      invalidPriceRange={catalogParams.invalidPriceRange}
    />
  );
}
