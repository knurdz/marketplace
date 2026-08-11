"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  clearCart,
  removeCartItem,
  updateCartItemQuantity,
} from "@/lib/services/cart-actions";
import type { CartView } from "@/lib/types";
import { toast } from "@/lib/ui/toast";

function issueLabel(issue: CartView["lines"][number]["issue"]): string {
  switch (issue) {
    case "out_of_stock":
      return "Out of stock or quantity exceeds available stock.";
    case "unavailable":
      return "This item is temporarily unavailable.";
    case "inactive":
      return "This listing is no longer active.";
    case "missing":
      return "This product could not be found.";
    default:
      return "";
  }
}

type CartLineRowProps = {
  line: CartView["lines"][number];
};

function CartLineRow({ line }: CartLineRowProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { item } = line;
  const warning = issueLabel(line.issue);

  function refresh() {
    router.refresh();
  }

  function onUpdateQuantity(nextQty: number) {
    startTransition(async () => {
      const result = await updateCartItemQuantity(item.$id, nextQty);
      if (result.error) toast.error(result.error);
      else toast.success(result.success ?? "Updated.");
      refresh();
    });
  }

  function onRemove() {
    startTransition(async () => {
      const result = await removeCartItem(item.$id);
      if (result.error) toast.error(result.error);
      else toast.success(result.success ?? "Removed.");
      refresh();
    });
  }

  return (
    <li className="border-b border-border py-6 last:border-b-0">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Link
            href={`/products/${item.productId}`}
            className="font-medium hover:text-accent"
          >
            {line.productTitle ?? "Unknown product"}
          </Link>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {line.productCurrency} {item.unitPrice.toFixed(2)} each
            {line.productStock > 0
              ? ` · ${line.productStock} in stock`
              : " · out of stock"}
          </p>
          {warning ? (
            <p className="mt-2 text-sm text-destructive" role="alert">
              {warning}
            </p>
          ) : null}
        </div>

        <p className="font-mono text-sm tabular-nums">
          {line.productCurrency} {line.lineTotal.toFixed(2)}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label
          className="font-mono text-xs text-muted-foreground"
          htmlFor={`qty-${item.$id}`}
        >
          Qty
        </label>
        <Input
          id={`qty-${item.$id}`}
          type="number"
          min={1}
          max={Math.max(1, line.productStock)}
          defaultValue={item.quantity}
          key={`${item.$id}-${item.quantity}`}
          className="h-8 w-20 font-mono text-sm"
          disabled={pending || !line.purchasable}
          onBlur={(e) => {
            const n = Number(e.target.value);
            if (!Number.isFinite(n)) return;
            const next = Math.floor(n);
            if (next !== item.quantity && next >= 1) {
              onUpdateQuantity(next);
            }
          }}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          disabled={pending}
        >
          Remove
        </Button>
      </div>
    </li>
  );
}

type CartContentsProps = {
  cartView: CartView;
};

export function CartContents({ cartView }: CartContentsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { lines, subtotal, hasIssues, itemCount } = cartView;
  const currency = lines[0]?.productCurrency ?? "LKR";

  function onClear() {
    startTransition(async () => {
      const result = await clearCart();
      if (result.error) toast.error(result.error);
      else toast.success(result.success ?? "Cart cleared.");
      router.refresh();
    });
  }

  if (lines.length === 0) {
    return (
      <div className="mt-10 space-y-4">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/">Browse listings</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-10 space-y-8">
      <ul className="divide-y divide-border">
        {lines.map((line) => (
          <CartLineRow key={line.item.$id} line={line} />
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
        <p className="font-mono text-sm text-muted-foreground">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </p>
        <p className="font-mono text-lg">
          Subtotal: {currency} {subtotal.toFixed(2)}
        </p>
      </div>

      {hasIssues ? (
        <p className="text-sm text-destructive" role="alert">
          Some items need attention before checkout. Update quantities or remove
          unavailable items.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {hasIssues ? (
          <Button type="button" variant="outline" size="sm" disabled>
            Checkout
          </Button>
        ) : (
          <Button type="button" variant="outline" size="sm" asChild>
            <Link href="/checkout">Checkout</Link>
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClear}
          disabled={pending}
        >
          {pending ? "Clearing…" : "Clear cart"}
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/">Continue shopping</Link>
        </Button>
      </div>
    </div>
  );
}
