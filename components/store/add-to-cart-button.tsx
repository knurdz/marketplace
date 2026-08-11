"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  addToCart,
  clearCartAndAdd,
} from "@/lib/services/cart-actions";
import { CART_ERROR_CODES } from "@/lib/services/cart-errors";
import { toast } from "@/lib/ui/toast";

type AddToCartButtonProps = {
  productId: string;
  maxStock: number;
  isLoggedIn: boolean;
  loginHref: string;
};

export function AddToCartButton({
  productId,
  maxStock,
  isLoggedIn,
  loginHref,
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [pending, startTransition] = useTransition();
  const [showClearPrompt, setShowClearPrompt] = useState(false);

  if (!isLoggedIn) {
    return (
      <Button asChild size="sm">
        <Link href={loginHref}>Sign in to add to cart</Link>
      </Button>
    );
  }

  function handleResult(result: Awaited<ReturnType<typeof addToCart>>) {
    if (result.error) {
      if (result.errorCode === CART_ERROR_CODES.SELLER_MISMATCH) {
        setShowClearPrompt(true);
        toast.error(result.error);
        return;
      }
      toast.error(result.error);
      return;
    }
    setShowClearPrompt(false);
    toast.success(result.success ?? "Added to cart.");
  }

  function onAdd() {
    const qty = Math.min(Math.max(1, quantity), maxStock);
    startTransition(async () => {
      const result = await addToCart(productId, qty);
      handleResult(result);
    });
  }

  function onClearAndAdd() {
    const qty = Math.min(Math.max(1, quantity), maxStock);
    startTransition(async () => {
      const result = await clearCartAndAdd(productId, qty);
      handleResult(result);
    });
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="font-mono text-xs text-muted-foreground" htmlFor="qty">
          Qty
        </label>
        <Input
          id="qty"
          type="number"
          min={1}
          max={maxStock}
          value={quantity}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (!Number.isFinite(n)) return;
            setQuantity(Math.min(Math.max(1, Math.floor(n)), maxStock));
          }}
          className="h-9 w-20 font-mono text-sm"
          disabled={pending}
        />
        <Button type="button" size="sm" onClick={onAdd} disabled={pending}>
          {pending ? "Adding…" : "Add to cart"}
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/cart">View cart</Link>
        </Button>
      </div>

      {showClearPrompt ? (
        <div className="space-y-2 border border-border px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Clear your cart and add this item from a different seller?
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClearAndAdd}
            disabled={pending}
          >
            Clear cart and add
          </Button>
        </div>
      ) : null}
    </div>
  );
}
