import type { ReactNode } from "react";
import { categoryImagePath } from "@/lib/store/category-catalog";
import { cn } from "@/lib/utils";

function categoryInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

type CategoryImageProps = {
  name: string;
  slug: string;
  className?: string;
  imgClassName?: string;
  fallbackClassName?: string;
  children?: ReactNode;
};

/** Local catalog photo when present; otherwise initial-letter fallback. */
export function CategoryImage({
  name,
  slug,
  className,
  imgClassName,
  fallbackClassName,
}: CategoryImageProps) {
  const src = categoryImagePath(slug);

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- static public category asset
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
