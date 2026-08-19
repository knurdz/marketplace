"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  cancelAdminOrderFormAction,
  refundAdminOrderFormAction,
  type AdminOrderActionState,
} from "@/lib/appwrite/admin-order-actions";
import { toast } from "@/lib/ui/toast";
import {
  canAdminCancelOrder,
  canAdminRefundOrder,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/types";

const initial: AdminOrderActionState = {};

function useOverrideToast(state: AdminOrderActionState, onSuccess?: () => void) {
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
        onSuccess?.();
        router.refresh();
      }
    }
  }, [state, onSuccess, router]);
}

function OverrideReasonForm({
  orderId,
  action,
  confirmMessage,
  submitLabel,
  pendingLabel,
  title,
}: {
  orderId: string;
  action: (
    prev: AdminOrderActionState,
    formData: FormData,
  ) => Promise<AdminOrderActionState>;
  confirmMessage: string;
  submitLabel: string;
  pendingLabel: string;
  title: string;
}) {
  const [showNote, setShowNote] = useState(false);
  const [state, formAction, pending] = useActionState(action, initial);
  useOverrideToast(state, () => setShowNote(false));

  if (!showNote) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setShowNote(true)}
      >
        {submitLabel}
      </Button>
    );
  }

  return (
    <form
      action={formAction}
      className="mt-3 space-y-2"
      onSubmit={(e) => {
        if (!window.confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="orderId" value={orderId} />
      <label className="block font-mono text-xs text-muted-foreground">
        {title}
        <textarea
          name="reason"
          required
          maxLength={500}
          rows={3}
          placeholder="Required — stored in the audit log"
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </label>
      <div className="flex gap-2">
        <Button type="submit" variant="outline" size="sm" disabled={pending}>
          {pending ? pendingLabel : `Confirm ${submitLabel.toLowerCase()}`}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={pending}
          onClick={() => setShowNote(false)}
        >
          Back
        </Button>
      </div>
    </form>
  );
}

export function AdminOrderOverrideActions({
  orderId,
  orderStatus,
  paymentStatus,
}: {
  orderId: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus | null;
}) {
  if (!paymentStatus) return null;

  const showCancel = canAdminCancelOrder(orderStatus, paymentStatus);
  const showRefund = canAdminRefundOrder(orderStatus, paymentStatus);
  if (!showCancel && !showRefund) return null;

  return (
    <div className="mt-4 flex flex-wrap items-start gap-3">
      {showCancel ? (
        <OverrideReasonForm
          orderId={orderId}
          action={cancelAdminOrderFormAction}
          confirmMessage="Cancel this unpaid order? The payment will be marked failed. This cannot be undone."
          submitLabel="Cancel"
          pendingLabel="Cancelling…"
          title="Cancel reason (required)"
        />
      ) : null}
      {showRefund ? (
        <OverrideReasonForm
          orderId={orderId}
          action={refundAdminOrderFormAction}
          confirmMessage="Refund this paid order on the platform ledger? Stock is not restored. Captured PayHere funds must be returned in the merchant dashboard if needed."
          submitLabel="Refund"
          pendingLabel="Refunding…"
          title="Refund reason (required)"
        />
      ) : null}
    </div>
  );
}
