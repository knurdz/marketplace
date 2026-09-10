import Link from "next/link";
import { getSellerDashboardSnapshot } from "@/lib/services";
import { PortalPageHeader } from "@/components/layout/portal-page-header";
import { StatCardGrid } from "@/components/layout/stat-card";
import { StatusPill } from "@/components/layout/status-pill";
import { SellerEarningsChart } from "@/components/seller/seller-earnings-chart";
import { SellerShopViewsChart } from "@/components/seller/seller-views-chart";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatOrderStatus } from "@/lib/order-display";
import { orderStatusTone } from "@/lib/ui/status-tone";

function formatCount(value: number): string {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatRevenue(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "LKR",
      maximumFractionDigits: 2,
    }).format(amount);
  }
}

export default async function SellerPage() {
  const snapshot = await getSellerDashboardSnapshot();
  const {
    metrics,
    listingCounts,
    recentOrders,
    lowStock,
    shop,
    earningsSeries,
    views,
    viewProducts,
  } = snapshot;

  const cards = [
    {
      label: "Orders",
      value: formatCount(metrics.orderCount),
      href: "/seller/orders",
    },
    {
      label: "Revenue",
      value: formatRevenue(metrics.revenue, metrics.currency),
      href: "/seller/earnings",
    },
    {
      label: "Pending",
      value: formatCount(metrics.pendingCount),
      href: "/seller/orders?filter=pending",
    },
    {
      label: "Active listings",
      value: formatCount(listingCounts.active),
      href: "/seller/listings",
    },
  ];

  return (
    <div>
      <PortalPageHeader
        title="Dashboard"
        description="Sales, listings, and work waiting on you. Charts open the matching page."
        actions={
          <Button size="sm" asChild>
            <Link href="/seller/listings/new">New listing</Link>
          </Button>
        }
      />

      <StatCardGrid cards={cards} className="mt-6" />

      <section className="mt-8 rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold tracking-tight">Earnings (30 days)</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Paid revenue by day. Open earnings for monthly and per-product totals.
            </p>
          </div>
          <Button variant="secondary" size="sm" asChild>
            <Link href="/seller/earnings">View earnings</Link>
          </Button>
        </div>
        <div className="mt-6">
          <SellerEarningsChart
            series={earningsSeries}
            currency={metrics.currency}
            range="30d"
          />
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold tracking-tight">Store views (30 days)</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatCount(views.shopTotal)} shop views · {formatCount(views.productTotal)} product views
            </p>
          </div>
        </div>
        <div className="mt-6">
          <SellerShopViewsChart series={views.shopSeries} />
        </div>
        {viewProducts.length > 0 ? (
          <Table className="mt-4" aria-label="Top products by views">
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Views</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {viewProducts.map((row) => (
                <TableRow key={row.productId}>
                  <TableCell>
                    <Link
                      href={`/seller/listings/${row.productId}`}
                      className="hover:text-accent"
                    >
                      {row.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm tabular-nums text-muted-foreground">
                    {formatCount(row.count)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            Product view totals appear after buyers open your listings.
          </p>
        )}
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold tracking-tight">Recent orders</h3>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/seller/orders">All orders</Link>
            </Button>
          </div>
          {recentOrders.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <Table className="mt-2">
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.$id}>
                    <TableCell>
                      <Link
                        href={`/seller/orders/${order.$id}`}
                        className="font-mono text-sm hover:text-accent"
                      >
                        {order.$id.slice(0, 8)}…
                      </Link>
                    </TableCell>
                    <TableCell>
                      <StatusPill
                        label={formatOrderStatus(order.status)}
                        tone={orderStatusTone(order.status)}
                      />
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums">
                      {formatRevenue(order.totalAmount, order.currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold tracking-tight">Low stock</h3>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/seller/listings">Listings</Link>
            </Button>
          </div>
          {lowStock.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No listings at or below 5 units.
            </p>
          ) : (
            <Table className="mt-2">
              <TableHeader>
                <TableRow>
                  <TableHead>Listing</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStock.map((product) => (
                  <TableRow key={product.$id}>
                    <TableCell>
                      <Link
                        href={`/seller/listings/${product.$id}`}
                        className="hover:text-accent"
                      >
                        {product.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums text-muted-foreground">
                      {product.stock}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>
      </div>

      <section className="mt-4 rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold tracking-tight">Shop setup</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {shop.shopName ?? "Your shop"} ·{" "}
              {listingCounts.draft} drafts · {listingCounts.pendingReview} in review
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" asChild>
              <Link href="/seller/shop">
                {shop.hasBank ? "Bank details" : "Add bank details"}
              </Link>
            </Button>
            <Button variant="secondary" size="sm" asChild>
              <Link href="/seller/settings">
                {shop.hasPolicies ? "Policies" : "Add policies"}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
