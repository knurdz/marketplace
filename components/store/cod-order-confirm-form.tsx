"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  confirmCodOrderAction,
  type ConfirmCodOrderActionState,
} from "@/lib/services/order-actions";
import type { Order, Payment } from "@/lib/types";
import { toast } from "@/lib/ui/toast";

const initialState: ConfirmCodOrderActionState = {};

type CodOrderConfirmFormProps = {
  order: Order;
  payment: Payment;
};

export function CodOrderConfirmForm({
  order,
  payment,
}: CodOrderConfirmFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    confirmCodOrderAction,
    initialState,
  );
  const lastToast = useRef<string | null>(null);

  const alreadyPaid = payment.status === "paid";

  useEffect(() => {
    if (state.error) {
      const key = `e:${state.error}`;
      if (key !== lastToast.current) {
        lastToast.current = key;
        toast.error(state.error);
      }
      return;
    }

    if (state.ok && state.paymentStatus === "paid") {
      const key = "s:paid";
      if (key !== lastToast.current) {
        lastToast.current = key;
        toast.success("Your cash on delivery order is confirmed.");
      }
      router.refresh();
    }
  }, [state, router]);

  if (alreadyPaid || (state.ok && state.paymentStatus === "paid")) {
    return (
      <div className="mt-8 space-y-4">
        <p
          role="status"
          className="rounded-md border border-border bg-card px-3 py-2 font-mono text-sm text-accent-bright"
        >
          Order accepted — pay cash on delivery. The seller can fulfill your
          order.
        </p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/market">Back to listings</Link>
        </Button>
      </div>
    );
  }

  const canConfirm = !pending;

  return (
    <div className="mt-8 space-y-6">
      {state.error ? (
        <p
          role="alert"
          aria-live="polite"
          className="rounded-md border border-border bg-card px-3 py-2 font-mono text-sm text-accent-bright"
        >
          {state.error}
        </p>
      ) : null}

      {state.pendingConfirmation ? (
        <p className="text-sm text-muted-foreground" role="status">
          Confirmation is still processing. Refresh this page shortly to check
          your order status.
        </p>
      ) : null}

      <form action={formAction} className="flex flex-wrap gap-3">
        <input type="hidden" name="orderId" value={order.$id} />
        <Button type="submit" disabled={!canConfirm} data-testid="cod-confirm">
          {pending ? "Confirming…" : "Confirm cash on delivery"}
        </Button>
        <Button type="button" variant="outline" size="sm" asChild>
          <Link href="/market">Back to listings</Link>
        </Button>
      </form>

      <p className="text-sm text-muted-foreground">
        Status: {state.orderStatus ?? order.status} · Payment:{" "}
        {state.paymentStatus ?? payment.status}
      </p>
    </div>
  );
}
