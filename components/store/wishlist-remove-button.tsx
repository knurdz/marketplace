"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { removeFromWishlist } from "@/lib/services/wishlist-actions";
import { toast } from "@/lib/ui/toast";

type WishlistRemoveButtonProps = {
  productId: string;
  productTitle: string | null;
};

export function WishlistRemoveButton({
  productId,
  productTitle,
}: WishlistRemoveButtonProps) {
  const [pending, startTransition] = useTransition();

  function handleRemove() {
    startTransition(async () => {
      const result = await removeFromWishlist(productId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(
        result.success ??
          `Removed${productTitle ? ` “${productTitle}”` : ""} from wishlist.`,
      );
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={handleRemove}
      aria-label={
        productTitle
          ? `Remove ${productTitle} from wishlist`
          : "Remove from wishlist"
      }
    >
      {pending ? "Removing…" : "Remove"}
    </Button>
  );
}
