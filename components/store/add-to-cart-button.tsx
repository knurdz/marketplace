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

import { cn } from "@/lib/utils";

type AddToCartButtonProps = {
  productId: string;
  maxStock: number;
  isLoggedIn: boolean;
  loginHref: string;
  className?: string;
};

export function AddToCartButton({
  productId,
  maxStock,
  isLoggedIn,
  loginHref,
  className,
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [pending, startTransition] = useTransition();
  const [showClearPrompt, setShowClearPrompt] = useState(false);

  if (!isLoggedIn) {
    return (
      <Button asChild className={cn("h-10 px-5 font-semibold shadow-xs", className)}>
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
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-muted-foreground" htmlFor="qty">
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
          className="h-10 w-20 font-mono text-sm text-center"
          disabled={pending}
        />
        <Button
          type="button"
          onClick={onAdd}
          disabled={pending}
          data-testid="add-to-cart"
          className="h-10 font-semibold shadow-xs"
        >
          {pending ? "Adding…" : "Add to cart"}
        </Button>
        <Button variant="secondary" asChild className="h-10">
          <Link href="/cart">View cart</Link>
        </Button>
      </div>

      {showClearPrompt ? (
        <div className="space-y-3 rounded-xl border border-border bg-card px-4 py-4">
          <p className="text-sm text-muted-foreground">
            Clear your cart and add this item from a different seller?
          </p>
          <Button
            type="button"
            variant="secondary"
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
