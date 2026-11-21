import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { CategoryImage } from "@/components/store/category-image";
import { HorizontalFadeScroll } from "@/components/store/horizontal-fade-scroll";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

type CategoryRailProps = {
  categories: Category[];
  activeSlug?: string;
  searchQuery?: string;
  className?: string;
};

export function CategoryRail({
  categories,
  activeSlug,
  searchQuery,
  className,
}: CategoryRailProps) {
  if (categories.length === 0) return null;

  const trimmedQuery = searchQuery?.trim();
  const allHref = trimmedQuery
    ? `/search?q=${encodeURIComponent(trimmedQuery)}`
    : "/";

  return (
    <nav aria-label="Categories">
      <HorizontalFadeScroll
        className={className}
        trackClassName="overscroll-x-contain scroll-smooth pb-1 pr-8"
      >
        <div className="flex w-max min-w-full snap-x snap-mandatory gap-4">
        <Link
          href={allHref}
          className="group flex w-20 shrink-0 snap-start flex-col items-center gap-2"
        >
          <span
            className={cn(
              "flex size-16 items-center justify-center rounded-full border transition",
              !activeSlug
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-muted text-foreground group-hover:border-accent/50 group-hover:bg-card-hover",
            )}
          >
            <LayoutGrid className="size-6" />
          </span>
          <span
            className={cn(
              "text-center text-xs font-medium",
              !activeSlug
                ? "text-foreground"
                : "text-muted-foreground group-hover:text-foreground",
            )}
          >
            All
          </span>
        </Link>
        {categories.map((category) => {
          const active = category.slug === activeSlug;
          const categoryHref = trimmedQuery
            ? `/search?q=${encodeURIComponent(trimmedQuery)}&category=${encodeURIComponent(category.slug)}`
            : `/categories/${category.slug}`;
          return (
            <Link
              key={category.$id}
              href={categoryHref}
              aria-current={active ? "page" : undefined}
              className="group flex w-20 shrink-0 snap-start flex-col items-center gap-2"
            >
              <span
                className={cn(
                  "flex size-16 items-center justify-center overflow-hidden rounded-full border transition",
                  active
                    ? "border-accent outline outline-2 outline-accent -outline-offset-2"
                    : "border-border group-hover:border-accent/50",
                )}
              >
                <CategoryImage
                  name={category.name}
                  slug={category.slug}
                  imageFileId={category.imageFileId}
                  priority
                  imgClassName="transition duration-300 group-hover:scale-105"
                  fallbackClassName={
                    active
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-foreground group-hover:bg-card-hover"
                  }
                />
              </span>
              <span
                className={cn(
                  "line-clamp-2 text-center text-xs font-medium",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              >
                {category.name}
              </span>
            </Link>
          );
        })}
        </div>
      </HorizontalFadeScroll>
    </nav>
  );
}
