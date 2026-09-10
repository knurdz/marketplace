import Link from "next/link";
import { StatusPill } from "@/components/layout/status-pill";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatOrderStatus, formatPaymentMethod } from "@/lib/order-display";
import { orderStatusTone } from "@/lib/ui/status-tone";
import type { Order } from "@/lib/types";

type SellerOrderListRowProps = {
  order: Order;
};

function formatAmount(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function SellerOrderListRow({ order }: SellerOrderListRowProps) {
  return (
    <TableRow>
      <TableCell className="px-4 py-3">
        <Link
          href={`/seller/orders/${order.$id}`}
          className="font-mono text-xs hover:underline"
        >
          {order.$id}
        </Link>
      </TableCell>
      <TableCell className="px-4 py-3">
        <StatusPill
          label={formatOrderStatus(order.status)}
          tone={orderStatusTone(order.status)}
        />
      </TableCell>
      <TableCell className="px-4 py-3 text-sm text-muted-foreground">
        {formatPaymentMethod(order.paymentMethod)}
      </TableCell>
      <TableCell className="px-4 py-3 text-right font-mono text-sm font-semibold tabular-nums">
        {formatAmount(order.totalAmount, order.currency)}
      </TableCell>
    </TableRow>
  );
}
