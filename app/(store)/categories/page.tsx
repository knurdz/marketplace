import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { listCategories } from "@/lib/services";

export default async function CategoriesPage() {
  const categories = await listCategories();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Browse"
        title="Categories"
        description="Jump into a shelf. Every category only shows active listings."
        actions={
          <Button asChild>
            <Link href="/market">All listings</Link>
          </Button>
        }
      />

      {categories.length === 0 ? (
        <EmptyState
          className="mt-10"
          title="No categories yet"
          description="Categories appear here once they are published."
        />
      ) : (
        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <li key={category.$id}>
              <Link
                href={`/categories/${category.slug}`}
                className="flex min-h-24 flex-col justify-between rounded-xl border border-border bg-card px-5 py-4 transition-colors hover:border-foreground/20 hover:bg-card-hover"
              >
                <span className="text-lg font-semibold tracking-tight">
                  {category.name}
                </span>
                <span className="mt-3 font-mono text-xs text-muted-foreground">
                  {category.slug}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
