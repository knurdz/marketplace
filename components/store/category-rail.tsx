import Link from "next/link";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

type CategoryRailProps = {
  categories: Category[];
  activeSlug?: string;
  className?: string;
};

export function CategoryRail({
  categories,
  activeSlug,
  className,
}: CategoryRailProps) {
  if (categories.length === 0) return null;

  return (
    <nav aria-label="Categories" className={cn("overflow-x-auto", className)}>
      <ul className="flex w-max gap-2 pb-1">
        <li>
          <Link
            href="/market"
            className={cn(
              "inline-flex h-9 items-center rounded-full border px-3.5 text-sm transition-colors",
              !activeSlug
                ? "border-foreground bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground",
            )}
          >
            All
          </Link>
        </li>
        {categories.map((category) => {
          const active = category.slug === activeSlug;
          return (
            <li key={category.$id}>
              <Link
                href={`/categories/${category.slug}`}
                className={cn(
                  "inline-flex h-9 items-center rounded-full border px-3.5 text-sm whitespace-nowrap transition-colors",
                  active
                    ? "border-foreground bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground",
                )}
              >
                {category.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
