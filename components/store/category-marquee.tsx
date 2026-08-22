"use client";

import Link from "next/link";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

type CategoryMarqueeProps = {
  categories: Category[];
};

export function CategoryMarquee({ categories }: CategoryMarqueeProps) {
  if (categories.length === 0) return null;

  const loop = [...categories, ...categories];

  return (
    <div className="pause-on-hover mask-fade-x overflow-hidden">
      <ul className="animate-marquee flex w-max gap-2 py-1">
        {loop.map((category, index) => (
          <li key={`${category.$id}-${index}`}>
            <Link
              href={`/categories/${category.slug}`}
              className={cn(
                "inline-flex h-10 items-center rounded-full border border-border bg-card px-4 text-sm text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground",
              )}
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
