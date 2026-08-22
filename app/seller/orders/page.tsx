import Link from "next/link";
import { SellerOrderListRow } from "@/components/seller/seller-order-list-row";
import { Button } from "@/components/ui/button";
import {
  listSellerOrders,
  SELLER_PENDING_STATUSES,
} from "@/lib/services";

type SellerOrdersPageProps = {
  searchParams: Promise<{ filter?: string; cursor?: string }>;
};

const INBOX_PAGE_SIZE = 50;

export default async function SellerOrdersPage({
  searchParams,
}: SellerOrdersPageProps) {
  const { filter, cursor } = await searchParams;
  const pendingOnly = filter === "pending";
  const pageCursor = cursor?.trim() || undefined;

  const orders = pendingOnly
    ? await listSellerOrders({
        status: SELLER_PENDING_STATUSES,
        cursor: pageCursor,
      })
    : await listSellerOrders({ cursor: pageCursor });

  const last = orders.at(-1);
  const nextCursor =
    orders.length === INBOX_PAGE_SIZE && last ? last.$id : null;
  const nextHref = nextCursor
    ? `/seller/orders?${new URLSearchParams({
        ...(pendingOnly ? { filter: "pending" } : {}),
        cursor: nextCursor,
      }).toString()}`
    : null;

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="mt-3 text-3xl font-bold tracking-tight">Orders</h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Orders for your shop. Open an order to update fulfillment status.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button
          variant={pendingOnly ? "outline" : "default"}
          size="sm"
          asChild
        >
          <Link href="/seller/orders">All</Link>
        </Button>
        <Button
          variant={pendingOnly ? "default" : "outline"}
          size="sm"
          asChild
        >
          <Link href="/seller/orders?filter=pending">Needs action</Link>
        </Button>
      </div>

      {orders.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">
          {pendingOnly
            ? "No orders need fulfillment right now."
            : "No orders yet."}
        </p>
      ) : (
        <ul className="mt-10" aria-label="Seller orders">
          {orders.map((order) => (
            <SellerOrderListRow key={order.$id} order={order} />
          ))}
        </ul>
      )}

      {nextHref ? (
        <div className="mt-8">
          <Link
            href={nextHref}
            className="inline-flex rounded-md border border-border px-4 py-2 font-mono text-sm hover:bg-muted"
          >
            Load more
          </Link>
        </div>
      ) : null}

      <p className="mt-12">
        <Button variant="outline" size="sm" asChild>
          <Link href="/seller">Back to dashboard</Link>
        </Button>
      </p>
    </div>
  );
}
