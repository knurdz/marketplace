import Link from "next/link";
import { SellerOrderListRow } from "@/components/seller/seller-order-list-row";
import { Button } from "@/components/ui/button";
import {
  listSellerOrders,
  SELLER_PENDING_STATUSES,
} from "@/lib/services";

type SellerOrdersPageProps = {
  searchParams: Promise<{ filter?: string }>;
};

export default async function SellerOrdersPage({
  searchParams,
}: SellerOrdersPageProps) {
  const { filter } = await searchParams;
  const pendingOnly = filter === "pending";

  const orders = pendingOnly
    ? await listSellerOrders({ status: SELLER_PENDING_STATUSES })
    : await listSellerOrders();

  return (
    <div className="mx-auto max-w-3xl">
      <p className="font-mono text-sm text-accent">$ ./seller --orders</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight">Orders</h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Orders for your shop. Fulfillment actions arrive in a later step.
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

      <p className="mt-12">
        <Button variant="outline" size="sm" asChild>
          <Link href="/seller">Back to dashboard</Link>
        </Button>
      </p>
    </div>
  );
}
