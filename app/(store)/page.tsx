import {
  HomeBrowseControls,
  HomeBrowseListings,
} from "@/components/store/home/home-browse";
import { HomeIntro } from "@/components/store/home/home-intro";
import { HomeListings } from "@/components/store/home/home-listings";
import { ScrollToBrowse } from "@/components/store/home/scroll-to-browse";
import {
  listActiveProducts,
  listActiveProductsPage,
  listCategoriesWithActiveProducts,
  listCoverImagesByProductIds,
  parseProductCatalogParams,
} from "@/lib/services";

/** One horizontal row of recent listings. */
const JUST_LISTED_LIMIT = 8;
/** Browse grid first page (infinite scroll loads the rest). */
const BROWSE_LIMIT = 12;

type HomePageProps = {
  searchParams: Promise<{
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const categoriesWithProducts = await listCategoriesWithActiveProducts();
  const categoryRaw = params.category?.trim() || null;
  const matchedCategory = categoryRaw
    ? categoriesWithProducts.find((entry) => entry.slug === categoryRaw) ?? null
    : null;
  const category = matchedCategory?.slug ?? null;
  const categoryLabel = matchedCategory?.name ?? null;
  const catalog = parseProductCatalogParams(params);

  const hasBrowseParams =
    category != null ||
    catalog.minPrice != null ||
    catalog.maxPrice != null ||
    catalog.sort !== "newest" ||
    catalog.invalidPriceRange;

  const [justListed, browsePage] = await Promise.all([
    hasBrowseParams
      ? Promise.resolve([])
      : listActiveProducts({
          limit: JUST_LISTED_LIMIT,
          sort: "newest",
        }),
    listActiveProductsPage({
      limit: BROWSE_LIMIT,
      categoryId: matchedCategory?.$id,
      minPrice: catalog.minPrice,
      maxPrice: catalog.maxPrice,
      sort: catalog.sort,
      invalidPriceRange: catalog.invalidPriceRange,
    }),
  ]);
  const browseProducts = browsePage.products;

  const covers = await listCoverImagesByProductIds([
    ...justListed.map((p) => p.$id),
    ...browseProducts.map((p) => p.$id),
  ]);

  const browseProps = {
    category,
    categoryLabel,
    minPrice: catalog.minPrice ?? null,
    maxPrice: catalog.maxPrice ?? null,
    sort: catalog.sort,
    invalidPriceRange: catalog.invalidPriceRange,
    products: browseProducts,
    covers,
    totalCount: browsePage.total,
    catalogNextCursor: browsePage.nextCursor,
    categoryId: matchedCategory?.$id,
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-12 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <ScrollToBrowse enabled={hasBrowseParams} />
      <HomeIntro />
      <HomeBrowseControls
        category={browseProps.category}
        categoryLabel={browseProps.categoryLabel}
        minPrice={browseProps.minPrice}
        maxPrice={browseProps.maxPrice}
        sort={browseProps.sort}
        invalidPriceRange={browseProps.invalidPriceRange}
        categoriesWithProducts={categoriesWithProducts}
      />
      {hasBrowseParams ? null : (
        <HomeListings products={justListed} covers={covers} />
      )}
      <HomeBrowseListings {...browseProps} />
    </main>
  );
}
