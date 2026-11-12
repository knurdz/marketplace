"use client";

import { useState } from "react";
import { AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

type AvatarStorageImageProps = {
  src: string;
  alt?: string;
  className?: string;
};

type ImageStatus = "loading" | "loaded" | "error";

/** Avatar photo with pulse skeleton; on error renders nothing so AvatarFallback shows. */
export function AvatarStorageImage({
  src,
  alt = "",
  className,
}: AvatarStorageImageProps) {
  const [status, setStatus] = useState<ImageStatus>("loading");

  const handleLoadingStatusChange = (
    next: "idle" | "loading" | "loaded" | "error",
  ) => {
    if (next === "error") setStatus("error");
    else if (next === "loaded") setStatus("loaded");
    else setStatus("loading");
  };

  if (status === "error") return null;

  return (
    <>
      {status === "loading" ? (
        <Skeleton
          className="absolute inset-0 z-0 size-full rounded-[inherit]"
          aria-hidden
        />
      ) : null}
      <AvatarImage
        src={src}
        alt={alt}
        className={className}
        onLoadingStatusChange={handleLoadingStatusChange}
      />
    </>
  );
}
