"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { requestPayHereCheckout } from "@/lib/services/payhere";
import type { Order, Payment } from "@/lib/types";
import {
  isPayHereSandboxActionUrl,
  type PayHereCheckoutPayload,
} from "@/lib/types/payhere";
import { toast } from "@/lib/ui/toast";

const LIVE_REFUSED = "PayHere checkout is not configured yet.";

function submitPayHereCheckoutForm(payload: PayHereCheckoutPayload): boolean {
  if (!isPayHereSandboxActionUrl(payload.actionUrl)) {
    return false;
  }

  const form = document.createElement("form");
  form.method = "POST";
  form.action = payload.actionUrl;

  for (const [key, value] of Object.entries(payload.fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
  return true;
}

type PayHereCheckoutFormProps = {
  order: Order;
  payment: Payment;
};

export function PayHereCheckoutForm({ order, payment }: PayHereCheckoutFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const alreadyPaid = payment.status === "paid";

  if (alreadyPaid) {
    return (
      <div className="mt-8 space-y-4">
        <p
          role="status"
          className="rounded-md border border-border bg-card px-3 py-2 font-mono text-sm text-accent-bright"
        >
          Payment confirmed — your order is paid.
        </p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/">Back to listings</Link>
        </Button>
      </div>
    );
  }

  const handleContinue = () => {
    setError(null);
    startTransition(async () => {
      const result = await requestPayHereCheckout(order.$id);
      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      if (!submitPayHereCheckoutForm(result.payload)) {
        setError(LIVE_REFUSED);
        toast.error(LIVE_REFUSED);
      }
    });
  };

  return (
    <div className="mt-8 space-y-6">
      {error ? (
        <p
          role="alert"
          aria-live="polite"
          className="rounded-md border border-border bg-card px-3 py-2 font-mono text-sm text-accent-bright"
        >
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={handleContinue} disabled={isPending} data-testid="payhere-continue">
          {isPending ? "Redirecting to PayHere…" : "Continue to PayHere"}
        </Button>
        <Button type="button" variant="outline" size="sm" asChild>
          <Link href="/">Back to listings</Link>
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Status: {order.status} · Payment: {payment.status}
      </p>
    </div>
  );
}
