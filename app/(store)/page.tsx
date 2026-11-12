import type { Metadata } from "next";
import {
  HomeBrowseControls,
  HomeBrowseListings,
} from "@/components/store/home/home-browse";
import { HomeIntro } from "@/components/store/home/home-intro";
import { HomeListings } from "@/components/store/home/home-listings";
import { ScrollToBrowse } from "@/components/store/home/scroll-to-browse";
import {
  buildPublicMetadata,
  SITE_DESCRIPTION,
  SITE_TITLE_DEFAULT,
} from "@/lib/seo/metadata";
import {
  getCategoryBySlug,
  listActiveProductsPage,
  listJustListedProducts,
  listCategoriesWithActiveProducts,
  listCoverImagesByProductIds,
  parseProductCatalogParams,
} from "@/lib/services";

/** One horizontal row of listings created in the last 9 days. */
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

export async function generateMetadata({
  searchParams,
}: HomePageProps): Promise<Metadata> {
  const params = await searchParams;
  const categorySlug = params.category?.trim() || null;
  const catalog = parseProductCatalogParams(params);
  const hasFacetParams =
    categorySlug != null ||
    catalog.minPrice != null ||
    catalog.maxPrice != null ||
    catalog.sort !== "newest" ||
    catalog.invalidPriceRange;

  if (categorySlug) {
    const matchedCategory = await getCategoryBySlug(categorySlug);
    if (matchedCategory) {
      return buildPublicMetadata({
        title: `${matchedCategory.name} Listings`,
        description: `Browse ${matchedCategory.name} listings from community sellers on Knurdz Marketplace. Connect directly with sellers with zero platform fees.`,
        canonicalPath: `/categories/${matchedCategory.slug}`,
        noIndex: true,
        follow: true,
      });
    }
  }

  return buildPublicMetadata({
    title: SITE_TITLE_DEFAULT,
    description: SITE_DESCRIPTION,
    canonicalPath: "/",
    noIndex: hasFacetParams,
    follow: true,
  });
}

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
      : listJustListedProducts({ limit: JUST_LISTED_LIMIT }),
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
