"use client";

import { useActionState } from "react";
import {
  archiveOwnProduct,
  type ArchiveProductActionState,
} from "@/lib/appwrite/seller-product-actions";
import { Button } from "@/components/ui/button";

const initialState: ArchiveProductActionState = {};

type ArchiveListingButtonProps = {
  productId: string;
  productTitle: string;
  className?: string;
};

export function ArchiveListingButton({
  productId,
  productTitle,
  className,
}: ArchiveListingButtonProps) {
  const [, formAction, pending] = useActionState(archiveOwnProduct, initialState);

  return (
    <form
      action={formAction}
      className={className}
      onSubmit={(event) => {
        const ok = confirm(
          `Archive "${productTitle}"? It will be removed from the storefront.`,
        );
        if (!ok) event.preventDefault();
      }}
    >
      <input type="hidden" name="productId" value={productId} />
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending ? "Archiving…" : "Archive"}
      </Button>
    </form>
  );
}
