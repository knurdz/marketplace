import Link from "next/link";
import { formatOrderStatus, formatPaymentMethod } from "@/lib/order-display";
import type { Order } from "@/lib/types";

type OrderListRowProps = {
  order: Order;
};

export function OrderListRow({ order }: OrderListRowProps) {
  return (
    <li className="border-b border-border py-4 last:border-b-0">
      <Link
        href={`/orders/${order.$id}`}
        className="group block transition hover:opacity-90"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="font-mono text-sm text-foreground group-hover:text-accent">
            {order.$id}
          </span>
          <span className="font-mono text-sm tabular-nums">
            {order.currency} {order.totalAmount.toFixed(2)}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span>{formatOrderStatus(order.status)}</span>
          <span>{formatPaymentMethod(order.paymentMethod)}</span>
        </div>
      </Link>
    </li>
  );
}
