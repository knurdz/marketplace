import Link from "next/link";
import { listCategories } from "@/lib/services";
import { Button } from "@/components/ui/button";

export default async function CategoriesPage() {
  const categories = await listCategories();

  return (
    <main className="relative mx-auto w-full max-w-5xl px-6 py-16 sm:px-10">
      <p className="font-mono text-sm text-accent">$ ./categories --list</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        Categories
      </h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Browse active listings by category via{" "}
        <code className="font-mono text-xs">listCategories</code>.
      </p>

      {categories.length === 0 ? (
        <p className="mt-10 font-mono text-sm text-muted-foreground">
          No categories yet. Seed lands in step 1.12.
        </p>
      ) : (
        <ul className="mt-10 space-y-3">
          {categories.map((category) => (
            <li
              key={category.$id}
              className="border-b border-border py-3"
            >
              <Link
                href={`/categories/${category.slug}`}
                className="font-medium tracking-tight text-foreground underline-offset-4 hover:underline"
              >
                {category.name}
              </Link>
              <span className="ml-3 font-mono text-xs text-muted-foreground">
                {category.slug}
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-12">
        <Button variant="outline" size="sm" asChild>
          <Link href="/#active-listings">Back to listings</Link>
        </Button>
      </p>
    </main>
  );
}
