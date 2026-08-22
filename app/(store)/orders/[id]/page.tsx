import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { OrderCancelForm } from "@/components/store/order-cancel-form";
import { OrderTimeline } from "@/components/store/order-timeline";
import { ReorderButton } from "@/components/store/reorder-button";
import { OpenBuyerThreadButton } from "@/components/messaging/open-buyer-thread-button";
import { Button } from "@/components/ui/button";
import { getLoggedInUser } from "@/lib/appwrite/session";
import {
  formatOrderStatus,
  formatPaymentMethod,
} from "@/lib/order-display";
import {
  getOwnOrder,
  getOwnOrderItems,
  getOwnPaymentForOrder,
} from "@/lib/services/orders";
import { listOwnReviewsForOrder } from "@/lib/services/reviews";
import { isMessagingAllowedForOrder } from "@/lib/services/threads";
import { isOrderCancelable } from "@/lib/types";

type OrderDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ msgError?: string }>;
};

export default async function OrderDetailPage({
  params,
  searchParams,
}: OrderDetailPageProps) {
  const user = await getLoggedInUser();
  const { id } = await params;
  const { msgError } = await searchParams;

  if (!user) {
    redirect(`/login?next=/orders/${encodeURIComponent(id)}`);
  }

  const order = await getOwnOrder(id);
  if (!order) {
    notFound();
  }

  const [items, payment, reviews] = await Promise.all([
    getOwnOrderItems(id),
    getOwnPaymentForOrder(id),
    order.status === "completed" ? listOwnReviewsForOrder(id) : Promise.resolve([]),
  ]);

  const reviewedProductIds = new Set(reviews.map((review) => review.productId));
  const canCancel = isOrderCancelable(order.status);
  const canReorder = order.status === "completed";
  const canMessage = isMessagingAllowedForOrder(order);

  return (
    <main className="relative mx-auto w-full max-w-3xl px-6 py-16 sm:px-10">
      <h1 className="mt-4 text-3xl font-bold tracking-tight">Order details</h1>
      {msgError ? (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {msgError}
        </p>
      ) : null}
      <p className="mt-4 text-muted-foreground">
        Order{" "}
        <span className="font-mono text-foreground">{order.$id}</span> ·{" "}
        {formatOrderStatus(order.status)}
      </p>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-bold tracking-tight">Summary</h2>
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
        <h2 className="text-xl font-bold tracking-tight">Items</h2>
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
                  {canReorder ? (
                    <span className="mt-1 block">
                      {reviewedProductIds.has(item.productId) ? (
                        <span className="text-xs text-muted-foreground">
                          Review submitted
                        </span>
                      ) : (
                        <Link
                          href={`/products/${item.productId}#reviews`}
                          className="text-xs font-medium text-accent hover:underline"
                        >
                          Leave a review
                        </Link>
                      )}
                    </span>
                  ) : null}
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
        <h2 className="text-xl font-bold tracking-tight">Shipping address</h2>
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
          {order.shippingAddress}
        </p>
      </section>

      <OrderTimeline status={order.status} />

      {canMessage ? (
        <section className="mt-10 space-y-4">
          <h2 className="text-xl font-bold tracking-tight">Contact seller</h2>
          <OpenBuyerThreadButton orderId={order.$id} />
        </section>
      ) : null}

      {canReorder ? (
        <section className="mt-10 space-y-4">
          <h2 className="text-xl font-bold tracking-tight">Buy again</h2>
          <p className="text-sm text-muted-foreground">
            Add available items from this order back to your cart.
          </p>
          <ReorderButton orderId={order.$id} variant="detail" />
        </section>
      ) : null}

      {canCancel ? (
        <section className="mt-10 space-y-4">
          <h2 className="text-xl font-bold tracking-tight">Cancel order</h2>
          <p className="text-sm text-muted-foreground">
            You can cancel this order while payment is still pending or under
            review.
          </p>
          <OrderCancelForm orderId={order.$id} />
        </section>
      ) : null}

      <div className="mt-12 flex flex-wrap gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href="/orders">All orders</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/market">Back to listings</Link>
        </Button>
      </div>
    </main>
  );
}
