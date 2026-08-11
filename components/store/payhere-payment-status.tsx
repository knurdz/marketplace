"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { pollPayHerePaymentStatusAction } from "@/lib/services/order-actions";
import type { OrderStatus, PaymentStatus } from "@/lib/types";

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 60_000;

type PayHerePaymentStatusProps = {
  orderId: string;
  initialOrderStatus: OrderStatus;
  initialPaymentStatus: PaymentStatus;
  variant: "return" | "cancel";
};

export function PayHerePaymentStatus({
  orderId,
  initialOrderStatus,
  initialPaymentStatus,
  variant,
}: PayHerePaymentStatusProps) {
  const [orderStatus, setOrderStatus] = useState(initialOrderStatus);
  const [paymentStatus, setPaymentStatus] = useState(initialPaymentStatus);
  const [timedOut, setTimedOut] = useState(false);
  const [pollError, setPollError] = useState<string | null>(null);
  const terminalRef = useRef(
    initialPaymentStatus === "paid" || initialPaymentStatus === "failed",
  );

  useEffect(() => {
    if (terminalRef.current) {
      return;
    }

    let cancelled = false;
    const startTime = Date.now();

    const tick = async () => {
      if (cancelled || terminalRef.current) {
        return;
      }

      if (Date.now() - startTime >= POLL_TIMEOUT_MS) {
        setTimedOut(true);
        cancelled = true;
        return;
      }

      const result = await pollPayHerePaymentStatusAction(orderId);
      if (cancelled) {
        return;
      }

      if (!result.ok) {
        setPollError(result.error ?? "Unable to check payment status.");
        return;
      }

      if (result.orderStatus) {
        setOrderStatus(result.orderStatus);
      }
      if (result.paymentStatus) {
        setPaymentStatus(result.paymentStatus);
        if (
          result.paymentStatus === "paid" ||
          result.paymentStatus === "failed"
        ) {
          terminalRef.current = true;
          cancelled = true;
        }
      }
    };

    void tick();
    const intervalId = setInterval(() => {
      void tick();
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [orderId]);

  if (paymentStatus === "paid") {
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

  if (paymentStatus === "failed") {
    return (
      <div className="mt-8 space-y-4">
        <p
          role="alert"
          className="rounded-md border border-border bg-card px-3 py-2 font-mono text-sm text-accent-bright"
        >
          Payment failed. You can return to checkout and try again.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/checkout/payhere?orderId=${orderId}`}>
              Try again
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/">Back to listings</Link>
          </Button>
        </div>
      </div>
    );
  }

  const pendingMessage =
    variant === "return"
      ? "Confirming your payment with PayHere…"
      : "Checking whether your payment completed…";

  return (
    <div className="mt-8 space-y-4">
      {!timedOut ? (
        <p role="status" aria-live="polite" className="text-muted-foreground">
          {pendingMessage}
        </p>
      ) : (
        <p role="status" aria-live="polite" className="text-muted-foreground">
          Payment confirmation is taking longer than expected. Your payment may
          still be processing — refresh this page in a moment or check your
          orders later. We only mark success once payment is confirmed in our
          system.
        </p>
      )}

      {pollError ? (
        <p
          role="alert"
          className="rounded-md border border-border bg-card px-3 py-2 font-mono text-sm text-accent-bright"
        >
          {pollError}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {variant === "cancel" ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/checkout/payhere?orderId=${orderId}`}>
              Return to PayHere checkout
            </Link>
          </Button>
        ) : null}
        <Button variant="outline" size="sm" asChild>
          <Link href="/">Back to listings</Link>
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Status: {orderStatus} · Payment: {paymentStatus}
      </p>
    </div>
  );
}
