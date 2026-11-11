"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/ui/toast";
import { cn } from "@/lib/utils";

const WISHLIST_KEY = "knurdz_showcase_wishlist";

function readWishlist(): string[] {
  try {
    const raw = sessionStorage.getItem(WISHLIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

function writeWishlist(ids: string[]) {
  sessionStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
}

type ShowcaseActionButtonsProps = {
  showcaseId: string;
  title: string;
  isLoggedIn: boolean;
  loginHref: string;
};

export function ShowcaseActionButtons({
  showcaseId,
  title,
  isLoggedIn,
  loginHref,
}: ShowcaseActionButtonsProps) {
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setSaved(readWishlist().includes(showcaseId));
  }, [showcaseId]);

  function toggleWishlist() {
    startTransition(() => {
      const current = readWishlist();
      const next = current.includes(showcaseId)
        ? current.filter((id) => id !== showcaseId)
        : [...current, showcaseId];
      writeWishlist(next);
      const nowSaved = next.includes(showcaseId);
      setSaved(nowSaved);
      toast.success(
        nowSaved ? "Saved to your wishlist." : "Removed from your wishlist.",
      );
    });
  }

  if (!isLoggedIn) {
    return (
      <div className="grid w-full grid-cols-2 gap-3">
        <Button asChild className="h-11 w-full font-semibold shadow-xs">
          <Link href={loginHref}>Buy</Link>
        </Button>
        <Button variant="secondary" asChild className="h-11 w-full">
          <Link href={loginHref}>
            <Heart className="mr-1.5 size-4" aria-hidden />
            Wishlist
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid w-full grid-cols-2 gap-3">
      <Button asChild className="h-11 w-full font-semibold shadow-xs">
        <Link href={`/products/${showcaseId}`}>Buy</Link>
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={cn("h-11 w-full")}
        disabled={pending}
        onClick={toggleWishlist}
        aria-pressed={saved}
        aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      >
        <Heart
          className={cn(
            "mr-1.5 size-4",
            saved && "fill-current text-accent",
          )}
          aria-hidden
        />
        {pending ? "Updating…" : saved ? "Saved" : "Wishlist"}
      </Button>
    </div>
  );
}
