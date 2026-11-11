import {
  HomeBrowseControls,
  HomeBrowseListings,
} from "@/components/store/home/home-browse";
import { HomeIntro } from "@/components/store/home/home-intro";
import { HomeListings } from "@/components/store/home/home-listings";
import { ScrollToBrowse } from "@/components/store/home/scroll-to-browse";
import { listCategoriesWithActiveProducts } from "@/lib/services";
import {
  HOME_LISTINGS,
  type MarketListingSort,
} from "@/lib/store/home-demo";

/** One horizontal row of recent listings. */
const JUST_LISTED_LIMIT = 8;

type HomePageProps = {
  searchParams: Promise<{
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  }>;
};

function parseOptionalPrice(raw: string | undefined): number | null {
  if (raw == null || raw.trim() === "") return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) return null;
  return value;
}

function parseSort(raw: string | undefined): MarketListingSort {
  if (raw === "price_asc" || raw === "price_desc") return raw;
  return "newest";
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
  const minPrice = parseOptionalPrice(params.minPrice);
  const maxPrice = parseOptionalPrice(params.maxPrice);
  const sort = parseSort(params.sort);
  const invalidPriceRange =
    minPrice != null && maxPrice != null && minPrice > maxPrice;

  const browseProps = {
    category,
    categoryLabel,
    minPrice,
    maxPrice,
    sort,
    invalidPriceRange,
  };

  const hasBrowseParams =
    category != null ||
    minPrice != null ||
    maxPrice != null ||
    sort !== "newest" ||
    invalidPriceRange;

  return (
    <main className="mx-auto w-full max-w-7xl space-y-12 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <ScrollToBrowse enabled={hasBrowseParams} />
      <HomeIntro />
      <HomeBrowseControls
        {...browseProps}
        categoriesWithProducts={categoriesWithProducts}
      />
      <HomeListings listings={HOME_LISTINGS.slice(0, JUST_LISTED_LIMIT)} />
      <HomeBrowseListings {...browseProps} />
    </main>
  );
}
