"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

const AUTOPLAY_MS = 6000;
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
  });
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
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
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="overflow-hidden rounded-2xl border border-border" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="relative min-w-0 flex-[0_0_100%]"
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${slides.length}`}
            >
              <div className="relative h-[320px] w-full overflow-hidden bg-background-alt sm:h-[380px] lg:h-[440px]">
                {slide.imageUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element -- Appwrite Storage preview URL */}
                    <img
                      src={slide.imageUrl}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                      loading={index === 0 ? "eager" : "lazy"}
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/10"
                    />
                  </>
                ) : (
                  <div
                    aria-hidden
                    className="bg-grid-faint absolute inset-0 opacity-50"
                  />
                )}

                <div
                  className={cn(
                    "relative flex h-full max-w-xl flex-col justify-center gap-4 px-6 sm:px-10 lg:px-14",
                    slide.imageUrl ? "text-white" : "text-foreground",
                  )}
                >
                  <p
                    className={cn(
                      "font-mono text-xs tracking-wide uppercase",
                      slide.imageUrl ? "text-white/75" : "text-accent",
                    )}
                  >
                    {slide.eyebrow}
                  </p>
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                    {slide.title}
                  </h2>
                  <p
                    className={cn(
                      "max-w-md text-base",
                      slide.imageUrl ? "text-white/85" : "text-muted-foreground",
                    )}
                  >
                    {slide.detail}
                  </p>
                  <div className="mt-2">
                    <Button
                      size="lg"
                      asChild
                      className={
                        slide.imageUrl
                          ? "bg-white text-black hover:bg-white/85"
                          : undefined
                      }
                    >
                      <Link href={slide.href}>{slide.ctaLabel}</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {multiple ? (
        <>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label="Previous slide"
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute top-1/2 left-3 hidden -translate-y-1/2 rounded-full sm:inline-flex"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label="Next slide"
            onClick={() => emblaApi?.scrollNext()}
            className="absolute top-1/2 right-3 hidden -translate-y-1/2 rounded-full sm:inline-flex"
          >
            <ChevronRight className="size-4" aria-hidden />
          </Button>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === selected}
                className={cn(
                  "h-2 rounded-full transition-all",
                  index === selected
                    ? "w-6 bg-accent"
                    : "w-2 bg-foreground/30 hover:bg-foreground/50",
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
