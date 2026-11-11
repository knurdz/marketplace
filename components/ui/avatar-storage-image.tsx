"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type AvatarStorageImageProps = {
  src: string;
  alt?: string;
  className?: string;
};

/** Avatar photo with pulse skeleton; on error renders nothing so AvatarFallback shows. */
export function AvatarStorageImage({
  src,
  alt = "",
  className,
}: AvatarStorageImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    <>
      {!loaded ? (
        <Skeleton
          className="absolute inset-0 size-full rounded-[inherit]"
          aria-hidden
        />
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element -- storage preview URL */}
      <img
        src={src}
        alt={alt}
        decoding="async"
        loading="lazy"
        referrerPolicy="no-referrer"
        onLoad={() => setLoaded(true)}
        onError={() => {
          setLoaded(true);
          setFailed(true);
        }}
        className={cn(
          "aspect-square size-full object-cover transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
      />
    </>
  );
}
