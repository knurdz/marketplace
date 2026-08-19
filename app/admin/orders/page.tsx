import Link from "next/link";
import { AdminOrderOverrideActions } from "@/components/admin/admin-order-override-actions";
import { Button } from "@/components/ui/button";
import {
  formatOrderStatus,
  formatPaymentMethod,
} from "@/lib/order-display";
import {
  getPublicSellerByUserId,
  listAllOrders,
  parseOrderStatusFilter,
  parsePaymentMethodFilter,
  parsePaymentStatusFilter,
} from "@/lib/services";
import {
  ORDER_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  type PaymentStatus,
} from "@/lib/types";

const PAGE_SIZE = 25;

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Pending",
  awaiting_verification: "Awaiting verification",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};

function formatPaymentStatus(status: PaymentStatus): string {
  return PAYMENT_STATUS_LABELS[status];
}

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

function formatCreatedAt(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function truncateAddress(address: string, max = 80): string {
  if (address.length <= max) return address;
  return `${address.slice(0, max - 1)}…`;
}

function buildFilterHref(params: Record<string, string | undefined>): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) sp.set(key, value);
  }
  const qs = sp.toString();
  return qs ? `/admin/orders?${qs}` : "/admin/orders";
}

type PageProps = {
  searchParams: Promise<{
    status?: string;
    method?: string;
    paymentStatus?: string;
    cursor?: string;
  }>;
};

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = parseOrderStatusFilter(params.status);
  const method = parsePaymentMethodFilter(params.method);
  const paymentStatus = parsePaymentStatusFilter(params.paymentStatus);
  const cursor = params.cursor?.trim() || undefined;

  const { orders, nextCursor } = await listAllOrders({
    status,
    paymentMethod: method,
    paymentStatus,
    limit: PAGE_SIZE,
    cursor,
  });

  const sellerIds = [...new Set(orders.map((o) => o.sellerId))];
  const sellerEntries = await Promise.all(
    sellerIds.map(async (id) => {
      const seller = await getPublicSellerByUserId(id);
      return [id, seller?.shopName ?? null] as const;
    }),
  );
  const sellerById = new Map(sellerEntries);

  const hasFilters = Boolean(status || method || paymentStatus);
  const clearHref = "/admin/orders";

  const nextHref = nextCursor
    ? buildFilterHref({
        status,
        method,
        paymentStatus,
        cursor: nextCursor,
      })
    : null;

  return (
    <div className="mx-auto max-w-3xl">
      <p className="font-mono text-sm text-accent">$ ./admin --orders</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight">All orders</h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Platform-wide order oversight. Cancel unpaid orders or refund paid
        ones — both write canonical statuses and an audit log. Captured
        PayHere money is returned in the merchant dashboard, not here.
      </p>

      <form method="get" className="mt-8 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 font-mono text-xs text-muted-foreground">
          Order status
          <select
            name="status"
            defaultValue={status ?? ""}
            className="min-w-[10rem] rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="">All</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {formatOrderStatus(s)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 font-mono text-xs text-muted-foreground">
          Payment method
          <select
            name="method"
            defaultValue={method ?? ""}
            className="min-w-[10rem] rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="">All</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {formatPaymentMethod(m)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 font-mono text-xs text-muted-foreground">
          Payment status
          <select
            name="paymentStatus"
            defaultValue={paymentStatus ?? ""}
            className="min-w-[10rem] rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="">All</option>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {formatPaymentStatus(s)}
              </option>
            ))}
          </select>
        </label>

        <Button type="submit" size="sm" variant="outline">
          Apply filters
        </Button>

        {hasFilters ? (
          <Link
            href={clearHref}
            className="inline-flex items-center rounded-md border border-border px-3 py-2 font-mono text-xs text-muted-foreground hover:bg-muted"
          >
            Clear
          </Link>
        ) : null}
      </form>

      {orders.length === 0 ? (
        <p className="mt-10 rounded-md border border-border bg-card px-4 py-5 font-mono text-sm text-muted-foreground">
          {hasFilters
            ? "No orders match the selected filters."
            : "No orders yet. When buyers complete checkout, orders will appear here."}
        </p>
      ) : (
        <ul className="mt-10 space-y-4">
          {orders.map((order) => {
            const shopName = sellerById.get(order.sellerId);
            return (
              <li
                key={order.$id}
                className="rounded-md border border-border bg-card px-4 py-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">
                      {order.$id}
                    </p>
                    <p className="mt-1 text-lg font-bold tracking-tight">
                      {formatAmount(order.totalAmount, order.currency)}
                    </p>
                  </div>
                  <p className="font-mono text-xs text-muted-foreground">
                    {formatCreatedAt(order.$createdAt)}
                  </p>
                </div>

                <p className="mt-3 font-mono text-xs text-muted-foreground">
                  Buyer: {order.buyerId}
                  {" · "}
                  Seller: {shopName ?? order.sellerId}
                </p>

                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  Order: {formatOrderStatus(order.status)}
                  {" · "}
                  Method: {formatPaymentMethod(order.paymentMethod)}
                  {" · "}
                  Payment:{" "}
                  {order.paymentStatus
                    ? formatPaymentStatus(order.paymentStatus)
                    : "—"}
                </p>

                <p
                  className="mt-2 font-mono text-xs text-muted-foreground"
                  title={order.shippingAddress}
                >
                  Ship to: {truncateAddress(order.shippingAddress)}
                </p>

                <AdminOrderOverrideActions
                  orderId={order.$id}
                  orderStatus={order.status}
                  paymentStatus={order.paymentStatus}
                />
              </li>
            );
          })}
        </ul>
      )}

      {nextHref ? (
        <div className="mt-8">
          <Link
            href={nextHref}
            className="inline-flex items-center rounded-md border border-border px-4 py-2 font-mono text-sm hover:bg-muted"
          >
            Next page →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
