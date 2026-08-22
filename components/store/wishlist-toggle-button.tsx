"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toggleWishlistProduct } from "@/lib/services/wishlist-actions";
import { toast } from "@/lib/ui/toast";

type WishlistToggleButtonProps = {
  productId: string;
  initialSaved: boolean;
  isLoggedIn: boolean;
  loginHref: string;
};

export function WishlistToggleButton({
  productId,
  initialSaved,
  isLoggedIn,
  loginHref,
}: WishlistToggleButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();

  if (!isLoggedIn) {
    return (
      <Button variant="secondary" asChild className="mt-4">
        <Link href={loginHref}>
          <Heart className="mr-1.5 size-4" aria-hidden />
          Sign in to save
        </Link>
      </Button>
    );
  }

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleWishlistProduct(productId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      const nextSaved = result.saved ?? !saved;
      setSaved(nextSaved);
      toast.success(
        result.success ??
          (nextSaved ? "Saved to your wishlist." : "Removed from your wishlist."),
      );
    });
  }

  return (
    <Button
      type="button"
      variant="secondary"
      className="mt-4"
      disabled={pending}
      onClick={handleToggle}
      aria-pressed={saved}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
    >
      <Heart
        className={`mr-1.5 size-4 ${saved ? "fill-current text-accent" : ""}`}
        aria-hidden
      />
      {pending ? "Updating…" : saved ? "Saved" : "Save"}
    </Button>
  );
}
