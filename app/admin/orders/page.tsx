import Link from "next/link";
import { AdminOrderOverrideActions } from "@/components/admin/admin-order-override-actions";
import {
  DataTableEmpty,
  DataTableShell,
  LoadMoreLink,
} from "@/components/layout/data-table-shell";
import { PortalPageHeader } from "@/components/layout/portal-page-header";
import { StatusPill } from "@/components/layout/status-pill";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatOrderStatus,
  formatPaymentMethod,
} from "@/lib/order-display";
import { orderStatusTone, paymentStatusTone } from "@/lib/ui/status-tone";
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
    <div>
      <PortalPageHeader
        title="All orders"
        description="Platform-wide order oversight. Cancel unpaid orders or refund paid ones — both write canonical statuses and an audit log. Captured PayHere money is returned in the merchant dashboard, not here."
      />

      <form method="get" className="mt-6 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Order status
          <select
            name="status"
            defaultValue={status ?? ""}
            className="h-9 min-w-[10rem] rounded-md border border-input bg-background px-3 text-sm text-foreground"
          >
            <option value="">All</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {formatOrderStatus(s)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Payment method
          <select
            name="method"
            defaultValue={method ?? ""}
            className="h-9 min-w-[10rem] rounded-md border border-input bg-background px-3 text-sm text-foreground"
          >
            <option value="">All</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {formatPaymentMethod(m)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Payment status
          <select
            name="paymentStatus"
            defaultValue={paymentStatus ?? ""}
            className="h-9 min-w-[10rem] rounded-md border border-input bg-background px-3 text-sm text-foreground"
          >
            <option value="">All</option>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {formatPaymentStatus(s)}
              </option>
            ))}
          </select>
        </label>

        <Button type="submit" size="sm" variant="secondary">
          Apply filters
        </Button>

        {hasFilters ? (
          <Button size="sm" variant="ghost" asChild>
            <Link href={clearHref}>Clear</Link>
          </Button>
        ) : null}
      </form>

      {orders.length === 0 ? (
        <DataTableEmpty
          className="mt-6"
          message={
            hasFilters
              ? "No orders match the selected filters."
              : "No orders yet. When buyers complete checkout, orders will appear here."
          }
        />
      ) : (
        <DataTableShell className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">Order</TableHead>
                <TableHead className="px-4">Parties</TableHead>
                <TableHead className="px-4">Status</TableHead>
                <TableHead className="px-4">Payment</TableHead>
                <TableHead className="px-4 text-right">Total</TableHead>
                <TableHead className="px-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const shopName = sellerById.get(order.sellerId);
                return (
                  <TableRow key={order.$id} className="align-top">
                    <TableCell className="px-4 py-3">
                      <p className="font-mono text-xs">{order.$id}</p>
                      <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                        {formatCreatedAt(order.$createdAt)}
                      </p>
                      <p
                        className="mt-1 max-w-[280px] truncate font-mono text-xs text-muted-foreground"
                        title={order.shippingAddress}
                      >
                        {truncateAddress(order.shippingAddress)}
                      </p>
                    </TableCell>
                    <TableCell className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      <span className="block">Buyer {order.buyerId}</span>
                      <span className="block">
                        Seller {shopName ?? order.sellerId}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <StatusPill
                        label={formatOrderStatus(order.status)}
                        tone={orderStatusTone(order.status)}
                      />
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-xs text-muted-foreground">
                          {formatPaymentMethod(order.paymentMethod)}
                        </span>
                        {order.paymentStatus ? (
                          <StatusPill
                            label={formatPaymentStatus(order.paymentStatus)}
                            tone={paymentStatusTone(order.paymentStatus)}
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right font-mono text-sm font-semibold tabular-nums">
                      {formatAmount(order.totalAmount, order.currency)}
                    </TableCell>
                    <TableCell className="w-[280px] max-w-[280px] px-4 py-3 whitespace-normal">
                      <AdminOrderOverrideActions
                        orderId={order.$id}
                        orderStatus={order.status}
                        paymentStatus={order.paymentStatus}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </DataTableShell>
      )}

      {nextHref ? <LoadMoreLink href={nextHref} label="Next page" /> : null}
    </div>
  );
}
