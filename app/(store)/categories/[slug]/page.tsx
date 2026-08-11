import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCatalogFilters } from "@/components/store/product-catalog-filters";
import { ProductList } from "@/components/store/product-list";
import { Button } from "@/components/ui/button";
import {
  getCategoryBySlug,
  listActiveProducts,
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
  const products = await listActiveProducts({
    categoryId: category.$id,
    limit: 24,
    minPrice: catalogParams.minPrice,
    maxPrice: catalogParams.maxPrice,
    sort: catalogParams.sort,
    invalidPriceRange: catalogParams.invalidPriceRange,
  });

  const hasActiveFilters =
    catalogParams.minPrice != null ||
    catalogParams.maxPrice != null ||
    catalogParams.sort !== "newest";

  return (
    <main className="relative mx-auto w-full max-w-5xl px-6 py-16 sm:px-10">
      <p className="font-mono text-sm text-accent">
        $ ./categories --slug={category.slug}
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        {category.name}
      </h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Active listings in this category via{" "}
        <code className="font-mono text-xs">listActiveProducts</code> — only{" "}
        <code className="font-mono text-xs">status=active</code>.
      </p>

      <ProductCatalogFilters
        action={`/categories/${category.slug}`}
        defaults={catalogParams}
      />

      {catalogParams.invalidPriceRange ? (
        <p className="mt-10 font-mono text-sm text-muted-foreground">
          Minimum price cannot be greater than maximum price.
        </p>
      ) : products.length === 0 ? (
        <p className="mt-10 font-mono text-sm text-muted-foreground">
          {hasActiveFilters
            ? `No active products in “${category.name}” match these filters.`
            : `No active products in “${category.name}” yet.`}
        </p>
      ) : (
        <>
          <p className="mt-8 font-mono text-xs text-muted-foreground">
            {products.length} listing{products.length === 1 ? "" : "s"}
          </p>
          <div className="mt-4">
            <ProductList products={products} />
          </div>
        </>
      )}

      <p className="mt-12 flex flex-wrap gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href="/categories">All categories</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/#active-listings">Back to listings</Link>
        </Button>
      </p>
    </main>
  );
}
