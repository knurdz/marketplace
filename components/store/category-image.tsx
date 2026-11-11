import type { ReactNode } from "react";
import { BUCKET_CATEGORIES } from "@/lib/appwrite/config";
import { getFileViewUrl } from "@/lib/appwrite/storage-urls";
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
      // eslint-disable-next-line @next/next/no-img-element -- remote storage or static public asset
      <img
        src={src}
        alt=""
        loading="lazy"
        className={cn("size-full object-cover", imgClassName, className)}
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
