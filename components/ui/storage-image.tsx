"use client";

import type { ReactNode } from "react";
import { useLayoutEffect, useRef, useState } from "react";
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

function syncFromImgElement(img: HTMLImageElement | null): {
  loaded: boolean;
  failed: boolean;
} {
  if (!img) return { loaded: false, failed: false };
  if (img.naturalWidth > 0) return { loaded: true, failed: false };
  if (img.complete) return { loaded: true, failed: true };
  return { loaded: false, failed: false };
}

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
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useLayoutEffect(() => {
    setLoaded(false);
    setFailed(false);
    const synced = syncFromImgElement(imgRef.current);
    if (synced.loaded) setLoaded(true);
    if (synced.failed) setFailed(true);
  }, [src]);

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
      {/* eslint-disable-next-line @next/next/no-img-element -- storage preview via /api/files */}
      <img
        ref={imgRef}
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
