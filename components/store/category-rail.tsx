"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CategoryImage } from "@/components/store/category-image";
import type { Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CategoryRailProps = {
  categories: Category[];
  activeSlug?: string;
  className?: string;
};

const SCROLL_STEP = 280;

export function CategoryRail({
  categories,
  activeSlug,
  className,
}: CategoryRailProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollStart, setCanScrollStart] = useState(false);
  const [canScrollEnd, setCanScrollEnd] = useState(false);

  const syncArrows = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    setCanScrollStart(track.scrollLeft > 4);
    setCanScrollEnd(track.scrollLeft < max - 4);
  }, []);

  useEffect(() => {
    syncArrows();
    const track = trackRef.current;
    if (!track) return;
    const observer = new ResizeObserver(syncArrows);
    observer.observe(track);
    return () => observer.disconnect();
  }, [syncArrows, categories.length]);

  const scrollBy = (direction: -1 | 1) => {
    trackRef.current?.scrollBy({
      left: direction * SCROLL_STEP,
      behavior: "smooth",
    });
  };

  if (categories.length === 0) return null;

  return (
    <div className={cn("relative", className)}>
      <Button
        type="button"
        variant="secondary"
        size="icon-sm"
        aria-label="Scroll categories left"
        onClick={() => scrollBy(-1)}
        className={cn(
          "absolute top-1/2 left-0 z-10 hidden -translate-y-1/2 rounded-full md:inline-flex",
          canScrollStart ? null : "invisible",
        )}
      >
        <ChevronLeft className="size-4" aria-hidden />
      </Button>

      <nav aria-label="Categories">
        <div
          ref={trackRef}
          onScroll={syncArrows}
          className="scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-1 md:px-11"
        >
          <Link
            href="/"
            className="group flex w-20 shrink-0 snap-start flex-col items-center gap-2"
          >
            <span
              className={cn(
                "flex size-16 items-center justify-center rounded-full border text-sm font-semibold transition",
                !activeSlug
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border bg-muted text-foreground group-hover:border-accent/50 group-hover:bg-card-hover",
              )}
            >
              All
            </span>
            <span
              className={cn(
                "text-center text-xs font-medium",
                !activeSlug ? "text-foreground" : "text-muted-foreground group-hover:text-foreground",
              )}
            >
              All
            </span>
          </Link>
          {categories.map((category) => {
            const active = category.slug === activeSlug;
            return (
              <Link
                key={category.$id}
                href={`/categories/${category.slug}`}
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
                    active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground",
                  )}
                >
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <Button
        type="button"
        variant="secondary"
        size="icon-sm"
        aria-label="Scroll categories right"
        onClick={() => scrollBy(1)}
        className={cn(
          "absolute top-1/2 right-0 z-10 hidden -translate-y-1/2 rounded-full md:inline-flex",
          canScrollEnd ? null : "invisible",
        )}
      >
        <ChevronRight className="size-4" aria-hidden />
      </Button>
    </div>
  );
}
