import Link from "next/link";
import { SellerOrderListRow } from "@/components/seller/seller-order-list-row";
import {
  DataTableEmpty,
  DataTableShell,
  FilterTabs,
  LoadMoreLink,
} from "@/components/layout/data-table-shell";
import { PortalPageHeader } from "@/components/layout/portal-page-header";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    <div>
      <PortalPageHeader
        title="Orders"
        description="Orders for your shop. Open an order to update fulfillment status."
      />

      <FilterTabs
        className="mt-6"
        tabs={[
          {
            href: "/seller/orders",
            label: "All",
            active: !pendingOnly,
          },
          {
            href: "/seller/orders?filter=pending",
            label: "Needs action",
            active: pendingOnly,
          },
        ]}
      />

      {orders.length === 0 ? (
        <DataTableEmpty
          className="mt-6"
          message={
            pendingOnly
              ? "No orders need fulfillment right now."
              : "No orders yet."
          }
        />
      ) : (
        <DataTableShell className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">Order</TableHead>
                <TableHead className="px-4">Status</TableHead>
                <TableHead className="px-4">Payment</TableHead>
                <TableHead className="px-4 text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <SellerOrderListRow key={order.$id} order={order} />
              ))}
            </TableBody>
          </Table>
        </DataTableShell>
      )}

      {nextHref ? <LoadMoreLink href={nextHref} /> : null}
    </div>
  );
}
