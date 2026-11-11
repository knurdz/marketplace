import { notFound } from "next/navigation";
import { CatalogView } from "@/components/store/catalog-view";
import {
  getCategoryBySlug,
  listActiveProductsPage,
  listCategories,
  listCoverImagesByProductIds,
  parseProductCatalogParams,
} from "@/lib/services";
import { CATALOG_PAGE_SIZE } from "@/lib/services/products";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  }>;
};

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
