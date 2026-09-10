"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PromoSlide = {
  id: string;
  eyebrow: string;
  title: string;
  detail: string;
  href: string;
  ctaLabel: string;
  imageUrl: string | null;
};

const AUTOPLAY_MS = 3800;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void): () => void {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

export function PromoCarousel({ slides }: { slides: PromoSlide[] }) {
  const multiple = slides.length > 1;
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: multiple,
    align: "start",
    watchDrag: multiple,
    slidesToScroll: 1,
  });
  const [selected, setSelected] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [paused, setPaused] = useState(false);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    const onInit = () => {
      setScrollSnaps(emblaApi.scrollSnapList());
      onSelect();
    };

    requestAnimationFrame(onInit);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onInit);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onInit);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi || !multiple || paused || reduceMotion) return;
    const timer = window.setInterval(() => {
      emblaApi.scrollNext();
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [emblaApi, multiple, paused, reduceMotion]);

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi],
  );

  if (slides.length === 0) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured listings"
      className="relative group/carousel select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Top Header Row with Navigation Arrows */}
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Featured Listings
          </h2>
          <span className="hidden font-mono text-xs text-muted-foreground sm:inline-block">
            Curated Community Drops
          </span>
        </div>

        {multiple ? (
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              aria-label="Previous listing"
              onClick={() => emblaApi?.scrollPrev()}
              className="rounded-full border border-border/80 hover:border-accent/40 hover:bg-card-hover"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              aria-label="Next listing"
              onClick={() => emblaApi?.scrollNext()}
              className="rounded-full border border-border/80 hover:border-accent/40 hover:bg-card-hover"
            >
              <ChevronRight className="size-4" aria-hidden />
            </Button>
          </div>
        ) : null}
      </div>

      {/* Moving Cards Track */}
      <div className="overflow-hidden py-1" ref={emblaRef}>
        <div className="flex -ml-4">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="min-w-0 shrink-0 pl-4 basis-[86%] sm:basis-[48%] lg:basis-[32%]"
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${slides.length}`}
            >
              <div className="group/featured relative flex h-full min-h-[380px] flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-accent/50 hover:bg-card-hover hover:shadow-[0_12px_30px_rgba(0,199,88,0.16)]">
                {/* Card Media Preview */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-background-alt">
                  {slide.imageUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element -- Appwrite Storage preview URL */}
                      <img
                        src={slide.imageUrl}
                        alt={slide.title}
                        className="hover-zoom h-full w-full object-cover"
                        loading={index < 3 ? "eager" : "lazy"}
                      />
                      <div
                        aria-hidden
                        className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"
                      />
                    </>
                  ) : (
                    <div
                      aria-hidden
                      className="bg-grid-faint relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-card via-background-alt to-muted/40 p-4"
                    >
                      <div className="flex size-11 items-center justify-center rounded-xl border border-border/80 bg-card/80 text-accent shadow-xs transition-transform duration-300 group-hover/featured:scale-110">
                        <Package className="size-5" />
                      </div>
                      <span className="mt-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                        Knurdz Curated
                      </span>
                    </div>
                  )}

                  {/* Overlaid Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                    <span className="inline-flex items-center rounded-md bg-accent px-2 py-0.5 font-mono text-[11px] font-semibold text-accent-foreground shadow-xs">
                      Featured
                    </span>
                  </div>
                </div>

                {/* Card Information */}
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <p className="font-mono text-xs font-semibold uppercase tracking-wider text-accent">
                      {slide.eyebrow}
                    </p>
                    <h3 className="mt-1 line-clamp-1 text-lg font-bold tracking-tight text-foreground transition-colors group-hover/featured:text-accent">
                      {slide.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {slide.detail}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-3.5">
                    <Button
                      size="sm"
                      asChild
                      className="group/btn bg-accent text-accent-foreground font-semibold shadow-xs transition-all hover:bg-accent-bright hover:shadow-[0_0_16px_rgba(0,199,88,0.3)]"
                    >
                      <Link href={slide.href}>
                        {slide.ctaLabel}
                        <ChevronRight className="ml-1 size-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                      </Link>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Link href="/market">Explore</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slide Indicators */}
      {multiple && scrollSnaps.length > 1 ? (
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {scrollSnaps.map((_, index) => (
            <button
              key={`snap-${index}`}
              type="button"
              onClick={() => scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === selected}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                index === selected
                  ? "w-6 bg-accent"
                  : "w-1.5 bg-foreground/25 hover:bg-foreground/45",
              )}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
