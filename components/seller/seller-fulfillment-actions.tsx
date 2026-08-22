"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  updateSellerOrderStatus,
  type SellerFulfillmentActionState,
} from "@/lib/appwrite/seller-order-actions";
import {
  sellerFulfillmentNextStatuses,
  type OrderStatus,
} from "@/lib/types";
import { toast } from "@/lib/ui/toast";

const initial: SellerFulfillmentActionState = {};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Pending payment",
  payment_review: "Payment review",
  paid: "Paid",
  processing: "Start processing",
  shipped: "Mark shipped",
  ready_pickup: "Ready for pickup",
  completed: "Mark completed",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

type SellerFulfillmentButtonProps = {
  orderId: string;
  nextStatus: OrderStatus;
};

function SellerFulfillmentButton({
  orderId,
  nextStatus,
}: SellerFulfillmentButtonProps) {
  const [state, formAction, pending] = useActionState(
    updateSellerOrderStatus,
    initial,
  );
  const lastToast = useRef<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (state.error) {
      const key = `e:${state.error}`;
      if (key !== lastToast.current) {
        lastToast.current = key;
        toast.error(state.error);
      }
      return;
    }

    if (state.success) {
      const key = `s:${state.success}`;
      if (key !== lastToast.current) {
        lastToast.current = key;
        toast.success(state.success);
        router.refresh();
      }
    }
  }, [state, router]);

  return (
    <form action={formAction}>
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="nextStatus" value={nextStatus} />
      <Button type="submit" size="sm" disabled={pending} data-testid={`fulfill-${nextStatus}`}>
        {pending ? "Updating…" : STATUS_LABELS[nextStatus]}
      </Button>
    </form>
  );
}

type SellerFulfillmentActionsProps = {
  orderId: string;
  currentStatus: OrderStatus;
  paymentPaid: boolean;
};

export function SellerFulfillmentActions({
  orderId,
  currentStatus,
  paymentPaid,
}: SellerFulfillmentActionsProps) {
  if (!paymentPaid) {
    return (
      <section className="mt-10 space-y-4">
        <h3 className="text-xl font-bold tracking-tight">Fulfillment</h3>
        <p className="text-sm text-muted-foreground">
          Fulfillment starts after this order is marked paid.
        </p>
      </section>
    );
  }

  const nextStatuses = sellerFulfillmentNextStatuses(currentStatus);
  if (nextStatuses.length === 0) return null;

  return (
    <section className="mt-10 space-y-4">
      <h3 className="text-xl font-bold tracking-tight">Fulfillment</h3>
      <div className="flex flex-wrap gap-2">
        {nextStatuses.map((next) => (
          <SellerFulfillmentButton
            key={next}
            orderId={orderId}
            nextStatus={next}
          />
        ))}
      </div>
    </section>
  );
}
