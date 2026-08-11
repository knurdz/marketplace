import Link from "next/link";
import {
  normalizeProductSearchQuery,
  searchActiveProducts,
} from "@/lib/services";
import { ProductList } from "@/components/store/product-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const rawQ = typeof params.q === "string" ? params.q : "";
  const normalized = normalizeProductSearchQuery(rawQ);
  const products = normalized
    ? await searchActiveProducts(normalized, { limit: 24 })
    : [];

  return (
    <main className="relative mx-auto w-full max-w-5xl px-6 py-16 sm:px-10">
      <p className="font-mono text-sm text-accent">$ ./products --search</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        Search
      </h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Active listings by title via{" "}
        <code className="font-mono text-xs">searchActiveProducts</code>.
      </p>

      <form
        action="/search"
        method="get"
        className="mt-8 flex max-w-md flex-col gap-3 sm:flex-row sm:items-center"
      >
        <Input
          type="search"
          name="q"
          defaultValue={normalized ?? ""}
          placeholder="Search products…"
          maxLength={64}
          aria-label="Search products"
          className="flex-1"
        />
        <Button type="submit" size="sm">
          Search
        </Button>
      </form>

      {!normalized ? (
        <p className="mt-10 font-mono text-sm text-muted-foreground">
          Enter a query to search active products.
        </p>
      ) : products.length === 0 ? (
        <p className="mt-10 font-mono text-sm text-muted-foreground">
          No active products matched “{normalized}”.
        </p>
      ) : (
        <>
          <p className="mt-8 font-mono text-xs text-muted-foreground">
            {products.length} result{products.length === 1 ? "" : "s"} for “
            {normalized}”
          </p>
          <div className="mt-4">
            <ProductList products={products} />
          </div>
        </>
      )}

      <p className="mt-12">
        <Button variant="outline" size="sm" asChild>
          <Link href="/#active-listings">Back to listings</Link>
        </Button>
      </p>
    </main>
  );
}
