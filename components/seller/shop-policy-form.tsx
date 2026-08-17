"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  updateOwnShopPolicies,
  type ShopProfileActionState,
} from "@/lib/appwrite/seller-application-actions";
import type { SellerProfile } from "@/lib/types";
import { toast } from "@/lib/ui/toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const initial: ShopProfileActionState = {};

function useActionToasts(state: ShopProfileActionState) {
  const last = useRef<string | null>(null);
  useEffect(() => {
    const key = state.error
      ? `e:${state.error}`
      : state.success
        ? `s:${state.success}`
        : null;
    if (!key || key === last.current) return;
    last.current = key;
    if (state.error) toast.error(state.error);
    else if (state.success) toast.success(state.success);
  }, [state.error, state.success]);
}

const textareaClassName =
  "w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type ShopPolicyFormProps = {
  profile: Pick<SellerProfile, "returnPolicy" | "shippingPolicy" | "slug">;
};

export function ShopPolicyForm({ profile }: ShopPolicyFormProps) {
  const [state, action, pending] = useActionState(updateOwnShopPolicies, initial);
  useActionToasts(state);

  return (
    <form action={action} className="mt-8 max-w-lg space-y-5">
      <p className="font-mono text-sm text-accent">$ ./shop --policies</p>
      <h2 className="text-xl font-bold tracking-tight">Shop policies</h2>
      <p className="text-sm text-muted-foreground">
        Optional return and shipping text shown on your public shop page and on
        product listings. Leave blank to hide.
      </p>

      {state.error ? (
        <p
          role="alert"
          className="rounded-md border border-border bg-card px-3 py-2 font-mono text-sm text-accent-bright"
        >
          {state.error}
        </p>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="returnPolicy">Return policy</Label>
        <textarea
          id="returnPolicy"
          name="returnPolicy"
          rows={5}
          maxLength={2000}
          defaultValue={profile.returnPolicy ?? ""}
          placeholder="e.g. Returns accepted within 7 days if unused."
          className={textareaClassName}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="shippingPolicy">Shipping policy</Label>
        <textarea
          id="shippingPolicy"
          name="shippingPolicy"
          rows={5}
          maxLength={2000}
          defaultValue={profile.shippingPolicy ?? ""}
          placeholder="e.g. Ships within 2 business days via courier."
          className={textareaClassName}
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save policies"}
      </Button>
    </form>
  );
}
