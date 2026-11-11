"use client";

import type { ReactNode } from "react";
import { StorageImage } from "@/components/ui/storage-image";
import { BUCKET_CATEGORIES } from "@/lib/backend/config";
import { getFileViewUrl } from "@/lib/backend/storage-urls";
import { categoryImagePath } from "@/lib/store/category-catalog";
import { cn } from "@/lib/utils";

function categoryInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

type CategoryImageProps = {
  name: string;
  slug: string;
  imageFileId?: string | null;
  className?: string;
  imgClassName?: string;
  fallbackClassName?: string;
  children?: ReactNode;
};

/** Uploaded category image, then catalog asset, then initial-letter fallback. */
export function CategoryImage({
  name,
  slug,
  imageFileId,
  className,
  imgClassName,
  fallbackClassName,
}: CategoryImageProps) {
  const uploadedId = imageFileId?.trim() || null;
  const src = uploadedId
    ? getFileViewUrl(BUCKET_CATEGORIES, uploadedId)
    : categoryImagePath(slug);

  if (src) {
    return (
      <StorageImage
        src={src}
        alt=""
        className={cn("size-full", className)}
        imgClassName={cn("object-cover", imgClassName)}
        fallback={
          <span
            className={cn(
              "flex size-full items-center justify-center text-base font-semibold",
              fallbackClassName,
            )}
            aria-hidden
          >
            {categoryInitial(name)}
          </span>
        }
      />
    );
  }

  return (
    <span
      className={cn(
        "flex size-full items-center justify-center text-base font-semibold",
        fallbackClassName,
        className,
      )}
      aria-hidden
    >
      {categoryInitial(name)}
    </span>
  );
}
