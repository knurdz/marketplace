"use client";

import { useState } from "react";
import { unsplashUrl } from "@/lib/store/home-demo";
import { cn } from "@/lib/utils";

type ShowcaseGalleryProps = {
  photoIds: string[];
  title: string;
  discount: number | null;
};

export function ShowcaseGallery({
  photoIds,
  title,
  discount,
}: ShowcaseGalleryProps) {
  const [active, setActive] = useState(0);
  const current = photoIds[active] ?? photoIds[0];
  if (!current) return null;

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element -- static remote showcase image */}
        <img
          src={unsplashUrl(current, 1200)}
          alt={title}
          className="h-full w-full object-cover"
        />
        {discount ? (
          <span className="absolute top-4 left-4 rounded-lg bg-red-600 px-3 py-1 text-sm font-semibold text-white">
            -{discount}%
          </span>
        ) : null}
      </div>

      {photoIds.length > 1 ? (
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          role="listbox"
          aria-label="More photos of this item"
        >
          {photoIds.map((photoId, index) => {
            const selected = index === active;
            return (
              <button
                key={`${photoId}-${index}`}
                type="button"
                role="option"
                aria-selected={selected}
                aria-label={`Show photo ${index + 1}`}
                onClick={() => setActive(index)}
                className={cn(
                  "relative size-16 shrink-0 overflow-hidden rounded-lg border bg-muted sm:size-[4.5rem]",
                  selected
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border hover:border-foreground/30",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- static remote showcase image */}
                <img
                  src={unsplashUrl(photoId, 200)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
