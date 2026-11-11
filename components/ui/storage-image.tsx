"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type StorageImageProps = {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  /** Eager load for above-the-fold hero images. */
  priority?: boolean;
  fallback?: ReactNode;
};

/**
 * Remote storage or CDN image with a pulse skeleton until load.
 * On error, renders optional fallback (caller supplies icon/initial UI).
 */
export function StorageImage({
  src,
  alt,
  className,
  imgClassName,
  priority = false,
  fallback = null,
}: StorageImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={cn("relative flex size-full items-center justify-center", className)}>
        {fallback}
      </div>
    );
  }

  return (
    <div className={cn("relative size-full overflow-hidden", className)}>
      {!loaded ? (
        <Skeleton className="absolute inset-0 size-full rounded-none" aria-hidden />
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element -- Appwrite/storage preview URLs */}
      <img
        src={src}
        alt={alt}
        decoding="async"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setLoaded(true);
          setFailed(true);
        }}
        className={cn(
          "size-full transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          imgClassName,
        )}
      />
    </div>
  );
}
