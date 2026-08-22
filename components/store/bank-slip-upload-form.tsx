"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  submitBankSlipAction,
  type SubmitBankSlipActionState,
} from "@/lib/services/order-actions";
import type { Order, Payment } from "@/lib/types";
import { toast } from "@/lib/ui/toast";

const initialState: SubmitBankSlipActionState = {};

const ACCEPT_SLIP =
  "image/jpeg,image/png,image/webp,application/pdf,.jpg,.jpeg,.png,.webp,.pdf";

type BankSlipUploadFormProps = {
  order: Order;
  payment: Payment;
};

export function BankSlipUploadForm({ order, payment }: BankSlipUploadFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    submitBankSlipAction,
    initialState,
  );
  const lastToast = useRef<string | null>(null);

  const awaitingVerification =
    payment.status === "awaiting_verification" ||
    state.paymentStatus === "awaiting_verification";

  useEffect(() => {
    if (state.error) {
      const key = `e:${state.error}`;
      if (key !== lastToast.current) {
        lastToast.current = key;
        toast.error(state.error);
      }
      return;
    }

    if (state.ok && state.paymentStatus === "awaiting_verification") {
      const key = "s:awaiting";
      if (key !== lastToast.current) {
        lastToast.current = key;
        toast.success("Bank slip uploaded. Awaiting seller verification.");
      }
      router.refresh();
    }
  }, [state, router]);

  const canUpload =
    !pending &&
    (payment.status === "pending" || payment.status === "awaiting_verification");

  if (payment.status === "paid") {
    return (
      <p
        role="status"
        className="mt-8 rounded-md border border-border bg-card px-3 py-2 font-mono text-sm text-accent-bright"
      >
        This order has already been paid.
      </p>
    );
  }

  return (
    <section className="mt-10 space-y-5">
      <h2 className="text-xl font-bold tracking-tight">Upload bank slip</h2>

      {awaitingVerification ? (
        <p className="text-sm text-muted-foreground" role="status">
          Your slip is awaiting seller verification. You may upload a replacement
          if needed.
        </p>
      ) : null}

      {state.error ? (
        <p
          role="alert"
          aria-live="polite"
          className="rounded-md border border-border bg-card px-3 py-2 font-mono text-sm text-accent-bright"
        >
          {state.error}
        </p>
      ) : null}

      <form action={formAction} className="space-y-5" encType="multipart/form-data">
        <input type="hidden" name="orderId" value={order.$id} />

        <div className="space-y-2">
          <Label htmlFor="slip">Bank slip (JPEG, PNG, WebP, or PDF)</Label>
          <input
            id="slip"
            name="slip"
            type="file"
            accept={ACCEPT_SLIP}
            required={!awaitingVerification}
            disabled={!canUpload}
            className="block w-full text-sm file:mr-4 file:rounded-md file:border file:border-border file:bg-card file:px-3 file:py-2 file:font-medium"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={!canUpload} data-testid="bank-slip-upload">
            {pending ? "Uploading…" : "Upload bank slip"}
          </Button>
          <Button type="button" variant="outline" size="sm" asChild>
            <Link href="/market">Back to listings</Link>
          </Button>
        </div>
      </form>

      <p className="text-sm text-muted-foreground">
        Status: {state.orderStatus ?? order.status} · Payment:{" "}
        {state.paymentStatus ?? payment.status}
      </p>
    </section>
  );
}
