import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCatalogFilters } from "@/components/store/product-catalog-filters";
import { ProductList } from "@/components/store/product-list";
import { RecentlyViewedSection } from "@/components/store/recently-viewed-section";
import {
  getSessionUser,
  listActiveProducts,
  listFeaturedProducts,
  listTrendingProducts,
  parseProductCatalogParams,
} from "@/lib/services";

type HomeProps = {
  searchParams: Promise<{
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const user = await getSessionUser();
  const params = await searchParams;
  const catalogParams = parseProductCatalogParams(params);
  const [products, trending, featured] = await Promise.all([
    listActiveProducts({
      limit: 24,
      minPrice: catalogParams.minPrice,
      maxPrice: catalogParams.maxPrice,
      sort: catalogParams.sort,
      invalidPriceRange: catalogParams.invalidPriceRange,
    }),
    listTrendingProducts({ limit: 8 }),
    listFeaturedProducts({ limit: 8 }),
  ]);

  const hasActiveFilters =
    catalogParams.minPrice != null ||
    catalogParams.maxPrice != null ||
    catalogParams.sort !== "newest";

  return (
    <main className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--background-alt)_0%,_transparent_55%)]"
      />

      <div className="relative mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-5xl flex-col justify-center px-6 py-16 sm:px-10">
        <p className="font-mono text-sm text-accent">
          $ ./marketplace --storefront
        </p>

        <h1 className="mt-6 text-5xl font-bold tracking-tight sm:text-7xl">
          Knurdz
          <span className="text-accent">.</span>
        </h1>

        <p className="mt-4 max-w-xl text-lg text-muted-foreground sm:text-xl">
          A marketplace for creators — browse listings, sell what you build, and
          check out with PayHere, bank transfer, or free.
        </p>

        <p className="mt-4 font-mono text-sm text-muted-foreground">
          {user ? `Signed in as ${user.email}` : "Signed out"}
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button size="lg" asChild>
            <Link href="#active-listings">Browse</Link>
          </Button>
          {user ? (
            <Button variant="outline" size="lg" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <Button variant="outline" size="lg" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </div>
      </div>

      {featured.length > 0 ? (
        <section className="relative mx-auto w-full max-w-5xl border-t border-border px-6 py-12 sm:px-10">
          <p className="font-mono text-sm text-accent">$ ./products --featured</p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight">Featured</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Hand-picked by the Knurdz team.
          </p>
          <div className="mt-6">
            <ProductList products={featured} />
          </div>
        </section>
      ) : null}

      {trending.length > 0 ? (
        <section className="relative mx-auto w-full max-w-5xl border-t border-border px-6 py-12 sm:px-10">
          <p className="font-mono text-sm text-accent">$ ./products --trending</p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight">Trending</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Popular picks from recent completed orders.
          </p>
          <div className="mt-6">
            <ProductList products={trending} />
          </div>
        </section>
      ) : null}

      <RecentlyViewedSection />

      <section
        id="active-listings"
        className="relative mx-auto w-full max-w-5xl border-t border-border px-6 py-16 sm:px-10"
      >
        <p className="font-mono text-sm text-accent">$ ./products --active</p>
        <h2 className="mt-3 text-2xl font-bold tracking-tight">
          Active listings
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Public catalog via{" "}
          <code className="font-mono text-xs">listActiveProducts</code> — only{" "}
          <code className="font-mono text-xs">status=active</code>.
        </p>

        <ProductCatalogFilters action="/" defaults={catalogParams} />

        {catalogParams.invalidPriceRange ? (
          <p className="mt-8 font-mono text-sm text-muted-foreground">
            Minimum price cannot be greater than maximum price.
          </p>
        ) : products.length === 0 ? (
          <p className="mt-8 font-mono text-sm text-muted-foreground">
            {hasActiveFilters
              ? "No active products match these filters."
              : "No active products yet. Seed lands in step 1.12."}
          </p>
        ) : (
          <div className="mt-8">
            <ProductList products={products} />
          </div>
        )}

        <p className="mt-8">
          <Button variant="outline" size="sm" asChild>
            <Link href="/categories">Browse categories</Link>
          </Button>
        </p>
      </section>
    </main>
  );
}
