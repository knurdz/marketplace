import { notFound } from "next/navigation";
import { CatalogView } from "@/components/store/catalog-view";
import {
  getCategoryBySlug,
  listActiveProducts,
  listCategories,
  listCoverImagesByProductIds,
  parseProductCatalogParams,
} from "@/lib/services";

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
  const [products, categories] = await Promise.all([
    listActiveProducts({
      categoryId: category.$id,
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
      title={category.name}
      description={`Items people listed in ${category.name}.`}
      categories={categories}
      activeSlug={category.slug}
      products={products}
      covers={covers}
      filterAction={`/categories/${category.slug}`}
      catalogParams={catalogParams}
      resultLabel={`${products.length} listing${products.length === 1 ? "" : "s"}`}
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
