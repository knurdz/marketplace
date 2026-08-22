import Link from "next/link";
import { notFound } from "next/navigation";
import { BankSlipImage } from "@/components/bank-slip/bank-slip-preview";
import { SellerBankSlipReviewActions } from "@/components/seller/seller-bank-slip-review-actions";
import { SellerFulfillmentActions } from "@/components/seller/seller-fulfillment-actions";
import { OpenSellerThreadButton } from "@/components/messaging/open-seller-thread-button";
import { OrderTimeline } from "@/components/store/order-timeline";
import { Button } from "@/components/ui/button";
import {
  formatOrderStatus,
  formatPaymentMethod,
} from "@/lib/order-display";
import {
  getSellerOrder,
  getSellerOrderItems,
  getSellerPaymentForOrder,
} from "@/lib/services";
import {
  getBankSlipReviewUrl,
  getPendingBankSlipForSellerOrder,
} from "@/lib/services/bank-slip-review";
import { isMessagingAllowedForOrder } from "@/lib/services/threads";

type SellerOrderDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ msgError?: string }>;
};

export default async function SellerOrderDetailPage({
  params,
  searchParams,
}: SellerOrderDetailPageProps) {
  const { id } = await params;
  const { msgError } = await searchParams;

  const order = await getSellerOrder(id);
  if (!order) {
    notFound();
  }

  const [items, payment] = await Promise.all([
    getSellerOrderItems(id),
    getSellerPaymentForOrder(id),
  ]);

  const needsSlipReview =
    order.paymentMethod === "bank_transfer" &&
    (order.status === "payment_review" ||
      payment?.status === "awaiting_verification");
  const pendingSlip = needsSlipReview
    ? await getPendingBankSlipForSellerOrder(id)
    : null;
  const slipUrl = pendingSlip
    ? await getBankSlipReviewUrl(pendingSlip.fileId)
    : "";

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="mt-3 text-3xl font-bold tracking-tight">Order details</h2>
      {msgError ? (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {msgError}
        </p>
      ) : null}
      <p className="mt-2 text-sm text-muted-foreground">
        Order{" "}
        <span className="font-mono text-foreground">{order.$id}</span> ·{" "}
        {formatOrderStatus(order.status)}
      </p>

      <section className="mt-10 space-y-4">
        <h3 className="text-xl font-bold tracking-tight">Summary</h3>
        <dl className="space-y-2 text-sm">
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-muted-foreground">Total</dt>
            <dd className="font-mono tabular-nums">
              {order.currency} {order.totalAmount.toFixed(2)}
            </dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-muted-foreground">Payment method</dt>
            <dd>{formatPaymentMethod(order.paymentMethod)}</dd>
          </div>
          {payment ? (
            <div className="flex flex-wrap justify-between gap-2">
              <dt className="text-muted-foreground">Payment status</dt>
              <dd className="font-mono">{payment.status}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section className="mt-10 space-y-4">
        <h3 className="text-xl font-bold tracking-tight">Items</h3>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No line items found.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.$id}
                className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-3 text-sm last:border-b-0"
              >
                <span>
                  {item.title} × {item.quantity}
                </span>
                <span className="font-mono tabular-nums">
                  {order.currency} {item.lineTotal.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10 space-y-4">
        <h3 className="text-xl font-bold tracking-tight">Shipping address</h3>
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
          {order.shippingAddress}
        </p>
      </section>

      <OrderTimeline status={order.status} />

      {pendingSlip ? (
        <section className="mt-10 space-y-4">
          <h3 className="text-xl font-bold tracking-tight">Bank slip review</h3>
          <p className="text-sm text-muted-foreground">
            Approve to mark this payment paid, or reject so the buyer can retry.
          </p>
          <SellerBankSlipReviewActions bankSlipId={pendingSlip.$id} />
          {slipUrl ? (
            <BankSlipImage
              src={slipUrl}
              alt={`Bank slip for order ${order.$id}`}
            />
          ) : null}
        </section>
      ) : null}

      {isMessagingAllowedForOrder(order) ? (
        <section className="mt-10 space-y-4">
          <h3 className="text-xl font-bold tracking-tight">Contact buyer</h3>
          <OpenSellerThreadButton orderId={order.$id} />
        </section>
      ) : null}

      <SellerFulfillmentActions
        orderId={order.$id}
        currentStatus={order.status}
        paymentPaid={payment?.status === "paid"}
        paymentMethod={order.paymentMethod}
      />

      <div className="mt-12 flex flex-wrap gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href="/seller/orders">All orders</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/seller">Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
