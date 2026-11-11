import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogView } from "@/components/store/catalog-view";
import { BUCKET_CATEGORIES } from "@/lib/backend/config";
import { getFileViewUrl } from "@/lib/backend/storage-urls";
import { buildNoIndexMetadata, buildPublicMetadata } from "@/lib/seo/metadata";
import {
  getCategoryBySlug,
  listActiveProductsPage,
  listCategories,
  listCoverImagesByProductIds,
  parseProductCatalogParams,
} from "@/lib/services";
import { CATALOG_PAGE_SIZE } from "@/lib/services/products";
import { categoryImagePath } from "@/lib/store/category-catalog";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: CategoryPageProps): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const category = await getCategoryBySlug(slug);
  if (!category) {
    return buildNoIndexMetadata("Category not found");
  }

  const catalogParams = parseProductCatalogParams(query);
  const hasFacetFilters =
    catalogParams.minPrice != null ||
    catalogParams.maxPrice != null ||
    catalogParams.sort !== "newest" ||
    catalogParams.invalidPriceRange;

  const uploadedId = category.imageFileId?.trim() || null;
  const imageUrl = uploadedId
    ? getFileViewUrl(BUCKET_CATEGORIES, uploadedId)
    : categoryImagePath(category.slug);

  return buildPublicMetadata({
    title: category.name,
    description: `Browse active ${category.name} listings on Knurdz Marketplace. Connect directly with verified community sellers and pay zero platform fees.`,
    canonicalPath: `/categories/${category.slug}`,
    image: imageUrl
      ? {
          url: imageUrl,
          alt: `${category.name} category on Knurdz Marketplace`,
        }
      : null,
    noIndex: hasFacetFilters,
    follow: true,
  });
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const catalogParams = parseProductCatalogParams(query);
  const [catalogPage, categories] = await Promise.all([
    listActiveProductsPage({
      categoryId: category.$id,
      limit: CATALOG_PAGE_SIZE,
      minPrice: catalogParams.minPrice,
      maxPrice: catalogParams.maxPrice,
      sort: catalogParams.sort,
      invalidPriceRange: catalogParams.invalidPriceRange,
    }),
    listCategories(),
  ]);
  const products = catalogPage.products;
  const covers = await listCoverImagesByProductIds(products.map((p) => p.$id));

  const hasActiveFilters =
    catalogParams.minPrice != null ||
    catalogParams.maxPrice != null ||
    catalogParams.sort !== "newest";

  return (
    <CatalogView
      title={category.name}
      description={`Items people listed in ${category.name}.`}
      categories={categories}
      activeSlug={category.slug}
      products={products}
      covers={covers}
      totalCount={catalogPage.total}
      catalogNextCursor={catalogPage.nextCursor}
      categoryId={category.$id}
      filterAction={`/categories/${category.slug}`}
      catalogParams={catalogParams}
      resultLabel={`${catalogPage.total} listing${catalogPage.total === 1 ? "" : "s"}`}
      emptyTitle={
        hasActiveFilters
          ? `Nothing in ${category.name} for this range`
          : `No listings in ${category.name} yet`
      }
      emptyDescription="Try another category or browse All Products."
      invalidPriceRange={catalogParams.invalidPriceRange}
    />
  );
}
