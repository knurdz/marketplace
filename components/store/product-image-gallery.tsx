"use client";

import { useState } from "react";
import { BUCKET_PRODUCT_IMAGES } from "@/lib/appwrite/config";
import { getFilePreviewUrl } from "@/lib/appwrite/storage-urls";
import type { ProductImage } from "@/lib/types";
import { cn } from "@/lib/utils";

type ProductImageGalleryProps = {
  images: ProductImage[];
  productTitle: string;
};

export function ProductImageGallery({
  images,
  productTitle,
}: ProductImageGalleryProps) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  if (!current) {
    return (
      <div
        className="flex aspect-[4/5] w-full items-center justify-center rounded-xl border border-dashed border-border bg-muted/30"
        aria-label="No product images"
      >
        <span className="size-12 rounded-lg border border-border bg-card" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-border bg-muted/20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getFilePreviewUrl(BUCKET_PRODUCT_IMAGES, current.fileId, {
            width: 960,
            height: 1200,
          })}
          alt={current.alt ?? productTitle}
          className="h-full w-full object-cover"
        />
      </div>
      {images.length > 1 ? (
        <ul className="grid grid-cols-5 gap-2 sm:grid-cols-6">
          {images.map((image, index) => (
            <li key={image.$id}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show image ${index + 1}`}
                aria-pressed={index === active}
                className={cn(
                  "relative aspect-square w-full overflow-hidden rounded-lg border transition-colors",
                  index === active
                    ? "border-foreground"
                    : "border-border hover:border-foreground/30",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getFilePreviewUrl(BUCKET_PRODUCT_IMAGES, image.fileId, {
                    width: 160,
                    height: 160,
                  })}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
