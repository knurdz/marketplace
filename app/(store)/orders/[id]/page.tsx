import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { OrderCancelForm } from "@/components/store/order-cancel-form";
import { OrderTimeline } from "@/components/store/order-timeline";
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
import { isOrderCancelable } from "@/lib/types";

type OrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const user = await getLoggedInUser();
  const { id } = await params;

  if (!user) {
    redirect(`/login?next=/orders/${encodeURIComponent(id)}`);
  }

  const order = await getOwnOrder(id);
  if (!order) {
    notFound();
  }

  const [items, payment] = await Promise.all([
    getOwnOrderItems(id),
    getOwnPaymentForOrder(id),
  ]);

  const canCancel = isOrderCancelable(order.status);

  return (
    <main className="relative mx-auto w-full max-w-3xl px-6 py-16 sm:px-10">
      <p className="font-mono text-sm text-accent">$ ./orders --detail</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">Order details</h1>
      <p className="mt-4 text-muted-foreground">
        Order{" "}
        <span className="font-mono text-foreground">{order.$id}</span> ·{" "}
        {formatOrderStatus(order.status)}
      </p>

      <section className="mt-10 space-y-4">
        <p className="font-mono text-sm text-accent">$ ./order --summary</p>
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
        <p className="font-mono text-sm text-accent">$ ./order --items</p>
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
        <p className="font-mono text-sm text-accent">$ ./order --shipping</p>
        <h2 className="text-xl font-bold tracking-tight">Shipping address</h2>
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
          {order.shippingAddress}
        </p>
      </section>

      <OrderTimeline status={order.status} />

      {canCancel ? (
        <section className="mt-10 space-y-4">
          <p className="font-mono text-sm text-accent">$ ./order --cancel</p>
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
          <Link href="/">Back to listings</Link>
        </Button>
      </div>
    </main>
  );
}
