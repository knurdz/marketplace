"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
          className="scrollbar-none flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth pb-1 md:px-11"
        >
          <Link
            href="/market"
            className={cn(
              "inline-flex h-9 shrink-0 snap-start items-center rounded-full border px-4 text-sm transition-colors",
              !activeSlug
                ? "border-foreground bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground",
            )}
          >
            All
          </Link>
          {categories.map((category) => {
            const active = category.slug === activeSlug;
            return (
              <Link
                key={category.$id}
                href={`/categories/${category.slug}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 shrink-0 snap-start items-center rounded-full border px-4 text-sm whitespace-nowrap transition-colors",
                  active
                    ? "border-foreground bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                )}
              >
                {category.name}
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
