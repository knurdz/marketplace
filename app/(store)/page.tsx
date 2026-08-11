import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductList } from "@/components/store/product-list";
import { getSessionUser, listActiveProducts } from "@/lib/services";

export default async function Home() {
  const user = await getSessionUser();
  const products = await listActiveProducts({ limit: 8 });

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
              <Link href="/account">Account</Link>
            </Button>
          ) : (
            <Button variant="outline" size="lg" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </div>
      </div>

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

        {products.length === 0 ? (
          <p className="mt-8 font-mono text-sm text-muted-foreground">
            No active products yet. Seed lands in step 1.12.
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
