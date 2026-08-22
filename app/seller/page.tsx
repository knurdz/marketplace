import Link from "next/link";
import { getSellerDashboardSnapshot } from "@/lib/services";
import { PageHeader } from "@/components/layout/page-header";
import { SellerEarningsChart } from "@/components/seller/seller-earnings-chart";
import { SellerShopViewsChart } from "@/components/seller/seller-views-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
      <PageHeader
        headingAs="h2"
        eyebrow="Seller"
        title="Dashboard"
        description="Sales, listings, and work waiting on you. Charts open the matching page."
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, href }) => (
          <Link key={label} href={href}>
            <Card className="h-full transition-colors hover:border-foreground/20 hover:bg-card-hover">
              <CardContent>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <section className="mt-10 rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">Earnings (30 days)</h3>
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

      <section className="mt-10 rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">Store views (30 days)</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatCount(views.shopTotal)} shop views · {formatCount(views.productTotal)} product views
            </p>
          </div>
        </div>
        <div className="mt-6">
          <SellerShopViewsChart series={views.shopSeries} />
        </div>
        {viewProducts.length > 0 ? (
          <ul className="mt-6 divide-y divide-border" aria-label="Top products by views">
            {viewProducts.map((row) => (
              <li key={row.productId} className="py-2">
                <Link
                  href={`/seller/listings/${row.productId}`}
                  className="flex items-baseline justify-between gap-2 text-sm hover:text-accent"
                >
                  <span className="truncate">{row.title}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {formatCount(row.count)} views
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            Product view totals appear after buyers open your listings.
          </p>
        )}
      </section>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold tracking-tight">Recent orders</h3>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/seller/orders">All orders</Link>
            </Button>
          </div>
          {recentOrders.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {recentOrders.map((order) => (
                <li key={order.$id} className="py-3 first:pt-0 last:pb-0">
                  <Link
                    href={`/seller/orders/${order.$id}`}
                    className="flex flex-wrap items-baseline justify-between gap-2 text-sm hover:text-accent"
                  >
                    <span className="font-mono">{order.$id.slice(0, 8)}…</span>
                    <span className="text-muted-foreground">{order.status}</span>
                    <span className="tabular-nums">
                      {formatRevenue(order.totalAmount, order.currency)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold tracking-tight">Low stock</h3>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/seller/listings">Listings</Link>
            </Button>
          </div>
          {lowStock.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No listings at or below 5 units.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {lowStock.map((product) => (
                <li key={product.$id} className="py-3 first:pt-0 last:pb-0">
                  <Link
                    href={`/seller/listings/${product.$id}`}
                    className="flex items-baseline justify-between gap-2 text-sm hover:text-accent"
                  >
                    <span className="truncate">{product.title}</span>
                    <span className="font-mono tabular-nums text-muted-foreground">
                      {product.stock}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">Shop setup</h3>
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
