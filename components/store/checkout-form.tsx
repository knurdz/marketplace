"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createOrder,
  type CreateOrderActionState,
} from "@/lib/services/order-actions";
import type { CartView } from "@/lib/types";
import { PAYMENT_METHODS } from "@/lib/types";
import { toast } from "@/lib/ui/toast";

const initialState: CreateOrderActionState = {};

type CheckoutFormProps = {
  cartView: CartView;
  payhereEnabled: boolean;
};

const METHOD_LABELS: Record<(typeof PAYMENT_METHODS)[number], string> = {
  payhere: "PayHere (sandbox — test only)",
  bank_transfer: "Bank transfer",
  free: "Free checkout",
  cod: "Cash on delivery",
};

export function CheckoutForm({ cartView, payhereEnabled }: CheckoutFormProps) {
  const [state, formAction, pending] = useActionState(createOrder, initialState);
  const lastToast = useRef<string | null>(null);

  const { lines, subtotal, hasIssues, cart } = cartView;
  const currency = lines[0]?.productCurrency ?? "LKR";
  const isFreeOrder = subtotal === 0;
  const canSubmit =
    lines.length > 0 &&
    !hasIssues &&
    Boolean(cart?.sellerId) &&
    !pending;

  useEffect(() => {
    if (state.error) {
      const key = `e:${state.error}`;
      if (key !== lastToast.current) {
        lastToast.current = key;
        toast.error(state.error);
      }
    }
  }, [state]);

  const defaultMethod = isFreeOrder ? "free" : "bank_transfer";
  const paidMethods = (
    payhereEnabled
      ? (["bank_transfer", "cod", "payhere"] as const)
      : (["bank_transfer", "cod"] as const)
  );
  const availableMethods = isFreeOrder ? (["free"] as const) : paidMethods;

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:gap-16">
      <form action={formAction} className="space-y-10">
        <section className="space-y-5">
          <h2 className="text-xl font-bold tracking-tight">Shipping address</h2>

          {state.error ? (
            <p
              role="alert"
              aria-live="polite"
              className="rounded-md border border-border bg-card px-3 py-2 font-mono text-sm text-accent-bright"
            >
              {state.error}
            </p>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="line1">Street / building</Label>
            <Input
              id="line1"
              name="line1"
              required
              autoComplete="address-line1"
              disabled={!canSubmit}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="line2">
              Apartment / landmark{" "}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="line2"
              name="line2"
              autoComplete="address-line2"
              disabled={!canSubmit}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                required
                autoComplete="address-level2"
                disabled={!canSubmit}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">District</Label>
              <Input
                id="district"
                name="district"
                required
                autoComplete="address-level1"
                disabled={!canSubmit}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal code</Label>
            <Input
              id="postalCode"
              name="postalCode"
              required
              autoComplete="postal-code"
              disabled={!canSubmit}
            />
          </div>
        </section>

        {!isFreeOrder ? (
          <section className="space-y-5">
            <h2 className="text-xl font-bold tracking-tight">Coupon code</h2>
            <div className="space-y-2">
              <Label htmlFor="couponCode">
                Code <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="couponCode"
                name="couponCode"
                autoComplete="off"
                maxLength={32}
                placeholder="SAVE10"
                disabled={!canSubmit}
                className="font-mono uppercase"
              />
              <p className="text-xs text-muted-foreground">
                Discount is calculated on the server when you place the order.
              </p>
            </div>
          </section>
        ) : null}

        <section className="space-y-5">
          <h2 className="text-xl font-bold tracking-tight">Payment method</h2>

          <fieldset className="space-y-3" disabled={!canSubmit}>
            <legend className="sr-only">Payment method</legend>
            {availableMethods.map((method) => (
              <label
                key={method}
                className="flex cursor-pointer items-start gap-3 border-b border-border py-3 last:border-b-0"
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method}
                  defaultChecked={method === defaultMethod}
                  required
                  data-testid={`checkout-method-${method}`}
                  className="mt-1"
                />
                <span>
                  <span className="block font-medium">{METHOD_LABELS[method]}</span>
                  {method === "free" ? (
                    <span className="mt-1 block text-sm text-muted-foreground">
                      All items in this order are free.
                    </span>
                  ) : null}
                  {method === "cod" ? (
                    <span className="mt-1 block text-sm text-muted-foreground">
                      Pay cash when your order is delivered. Confirm here to
                      accept the order; the seller can fulfill once accepted.
                    </span>
                  ) : null}
                  {method === "payhere" ? (
                    <span className="mt-1 block text-sm text-muted-foreground">
                      Sandbox card checkout for testing. Live PayHere is not
                      available until merchant authorization.
                    </span>
                  ) : null}
                </span>
              </label>
            ))}
          </fieldset>
        </section>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={!canSubmit} data-testid="checkout-place-order">
            {pending ? "Placing order…" : "Place order"}
          </Button>
          <Button type="button" variant="outline" size="sm" asChild>
            <Link href="/cart">Back to cart</Link>
          </Button>
        </div>
      </form>

      <aside className="space-y-6">
        <div>
          <h2 className="mt-2 text-xl font-bold tracking-tight">Order summary</h2>
        </div>

        <ul className="divide-y divide-border">
          {lines.map((line) => (
            <li key={line.item.$id} className="py-4 first:pt-0">
              <p className="font-medium">
                {line.productTitle ?? "Unknown product"}
              </p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                Qty {line.item.quantity} · {line.productCurrency}{" "}
                {line.lineTotal.toFixed(2)}
              </p>
            </li>
          ))}
        </ul>

        <p className="border-t border-border pt-4 font-mono text-lg">
          Total: {currency} {subtotal.toFixed(2)}
        </p>

        {hasIssues ? (
          <p className="text-sm text-destructive" role="alert">
            Some items need attention before checkout. Return to your cart.
          </p>
        ) : null}

        {!cart?.sellerId && lines.length > 0 ? (
          <p className="text-sm text-destructive" role="alert">
            Seller information is missing for this cart.
          </p>
        ) : null}
      </aside>
    </div>
  );
}
