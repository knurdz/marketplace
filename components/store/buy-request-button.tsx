"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { createPurchaseRequestAction } from "@/lib/services/purchase-request-actions";
import {
  PURCHASE_REQUEST_ERROR_CODES,
  type PurchaseRequestActionState,
} from "@/lib/services/purchase-request-errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/ui/toast";
import { FormGuardFields } from "@/components/security/form-guard-fields";

type BuyRequestButtonProps = {
  productId: string;
  maxStock: number;
  isLoggedIn: boolean;
  loginHref: string;
  buyerHasPhone: boolean;
  sellerHasPhone: boolean;
};

const initialState: PurchaseRequestActionState = {};

export function BuyRequestButton({
  productId,
  maxStock,
  isLoggedIn,
  loginHref,
  buyerHasPhone,
  sellerHasPhone,
}: BuyRequestButtonProps) {
  const [state, formAction, pending] = useActionState(
    createPurchaseRequestAction,
    initialState,
  );

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  if (!isLoggedIn) {
    return (
      <Button asChild data-testid="buy-request">
        <Link href={loginHref}>Sign in to buy</Link>
      </Button>
    );
  }

  if (!buyerHasPhone) {
    return (
      <div className="space-y-2" data-testid="buy-request-phone-required">
        <p className="text-sm text-muted-foreground">
          Add a phone number to your account so the seller can contact you.
        </p>
        <Button asChild variant="secondary">
          <Link href="/account">Add phone number</Link>
        </Button>
      </div>
    );
  }

  if (!sellerHasPhone) {
    return (
      <p className="text-sm text-muted-foreground" data-testid="buy-request-seller-phone">
        This seller has not added a phone number yet.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <FormGuardFields action="purchase-request.create" />
      <input type="hidden" name="productId" value={productId} />
      <div className="space-y-1.5">
        <Label htmlFor="buy-quantity">Quantity</Label>
        <Input
          id="buy-quantity"
          name="quantity"
          type="number"
          min={1}
          max={maxStock}
          defaultValue={1}
          required
          className="w-24"
          data-testid="buy-quantity"
        />
      </div>
      <Button type="submit" disabled={pending} data-testid="buy-request">
        {pending ? "Sending…" : "Buy"}
      </Button>
      {state.errorCode === PURCHASE_REQUEST_ERROR_CODES.INSUFFICIENT_STOCK ? (
        <p className="basis-full text-sm text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}
