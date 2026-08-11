"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  cancelOrderAction,
  type CancelOrderActionState,
} from "@/lib/services/order-actions";
import { toast } from "@/lib/ui/toast";

const initialState: CancelOrderActionState = {};

type OrderCancelFormProps = {
  orderId: string;
};

export function OrderCancelForm({ orderId }: OrderCancelFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    cancelOrderAction,
    initialState,
  );
  const lastToast = useRef<string | null>(null);

  useEffect(() => {
    if (state.error) {
      const key = `e:${state.error}`;
      if (key !== lastToast.current) {
        lastToast.current = key;
        toast.error(state.error);
      }
      return;
    }

    if (state.ok && state.orderStatus === "cancelled") {
      const key = "s:cancelled";
      if (key !== lastToast.current) {
        lastToast.current = key;
        toast.success("Your order has been cancelled.");
      }
      router.refresh();
    }
  }, [state, router]);

  if (state.ok && state.orderStatus === "cancelled") {
    return (
      <p
        role="status"
        className="rounded-md border border-border bg-card px-3 py-2 font-mono text-sm text-accent-bright"
      >
        This order has been cancelled.
      </p>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      {state.error ? (
        <p
          role="alert"
          aria-live="polite"
          className="rounded-md border border-border bg-card px-3 py-2 font-mono text-sm text-accent-bright"
        >
          {state.error}
        </p>
      ) : null}

      <form action={formAction}>
        <input type="hidden" name="orderId" value={orderId} />
        <Button type="submit" variant="outline" disabled={pending}>
          {pending ? "Cancelling…" : "Cancel order"}
        </Button>
      </form>
    </div>
  );
}
