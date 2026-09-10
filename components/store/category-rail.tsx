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
              "group/pill inline-flex h-9 shrink-0 snap-start items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-all duration-200",
              !activeSlug
                ? "border-accent bg-accent text-accent-foreground shadow-[0_0_16px_-2px_rgba(21,156,85,0.3)]"
                : "border-border bg-card text-foreground/80 hover:border-accent/50 hover:bg-card-hover hover:text-foreground hover:-translate-y-0.5 shadow-xs",
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full transition-colors",
                !activeSlug ? "bg-accent-foreground" : "bg-muted-foreground group-hover/pill:bg-accent",
              )}
            />
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
                  "group/pill inline-flex h-9 shrink-0 snap-start items-center gap-1.5 rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-all duration-200",
                  active
                    ? "border-accent bg-accent text-accent-foreground shadow-[0_0_16px_-2px_rgba(21,156,85,0.3)]"
                    : "border-border bg-card text-foreground/80 hover:border-accent/50 hover:bg-card-hover hover:text-foreground hover:-translate-y-0.5 shadow-xs",
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full transition-colors",
                    active ? "bg-accent-foreground" : "bg-muted-foreground group-hover/pill:bg-accent",
                  )}
                />
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
