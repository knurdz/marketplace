import Link from "next/link";
import { redirect } from "next/navigation";
import { OrderListRow } from "@/components/store/order-list-row";
import { RecentlyViewedSection } from "@/components/store/recently-viewed-section";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getLoggedInUser } from "@/lib/appwrite/session";
import { getOwnWishlistView, listOwnOrders } from "@/lib/services";
import type { Order, OrderStatus, WishlistLine } from "@/lib/types";

const RECENT_ORDERS_LIMIT = 5;
const WISHLIST_PREVIEW_LIMIT = 4;

const PENDING_STATUSES: readonly OrderStatus[] = [
  "pending_payment",
  "payment_review",
];
const IN_PROGRESS_STATUSES: readonly OrderStatus[] = [
  "paid",
  "processing",
  "shipped",
  "ready_pickup",
];
const COMPLETED_STATUSES: readonly OrderStatus[] = ["completed"];

type OrderSummaryCounts = {
  pending: number;
  inProgress: number;
  completed: number;
};

function countOrdersBySummaryBucket(orders: Order[]): OrderSummaryCounts {
  const counts: OrderSummaryCounts = {
    pending: 0,
    inProgress: 0,
    completed: 0,
  };

  for (const order of orders) {
    if ((PENDING_STATUSES as readonly string[]).includes(order.status)) {
      counts.pending += 1;
    } else if (
      (IN_PROGRESS_STATUSES as readonly string[]).includes(order.status)
    ) {
      counts.inProgress += 1;
    } else if (
      (COMPLETED_STATUSES as readonly string[]).includes(order.status)
    ) {
      counts.completed += 1;
    }
  }

  return counts;
}

function wishlistIssueLabel(issue: WishlistLine["issue"]): string | null {
  switch (issue) {
    case "inactive":
      return "No longer listed";
    case "unavailable":
      return "Unavailable";
    case "missing":
      return "Product removed";
    default:
      return null;
  }
}

export default async function DashboardPage() {
  const user = await getLoggedInUser();
  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const [orders, wishlistView] = await Promise.all([
    listOwnOrders({ limit: 50 }),
    getOwnWishlistView({ limit: WISHLIST_PREVIEW_LIMIT }),
  ]);

  const summary = countOrdersBySummaryBucket(orders);
  const recentOrders = orders.slice(0, RECENT_ORDERS_LIMIT);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Account"
        title="Your dashboard"
        description="Orders, saved products, and what you viewed on this device."
      />

      <section className="mt-12" aria-labelledby="order-summary-heading">
        <h2
          id="order-summary-heading"
          className="text-lg font-semibold tracking-tight"
        >
          Order summary
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Counts from your most recent orders.
        </p>
        <dl className="mt-6 grid grid-cols-3 gap-3">
          <Card>
            <CardContent>
              <dt className="text-sm text-muted-foreground">Pending</dt>
              <dd className="mt-1 font-mono text-2xl tabular-nums">
                {summary.pending}
              </dd>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <dt className="text-sm text-muted-foreground">In progress</dt>
              <dd className="mt-1 font-mono text-2xl tabular-nums">
                {summary.inProgress}
              </dd>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <dt className="text-sm text-muted-foreground">Completed</dt>
              <dd className="mt-1 font-mono text-2xl tabular-nums">
                {summary.completed}
              </dd>
            </CardContent>
          </Card>
        </dl>
      </section>

      <section className="mt-12" aria-labelledby="recent-orders-heading">
        <h2
          id="recent-orders-heading"
          className="text-lg font-semibold tracking-tight"
        >
          Recent orders
        </h2>
        {recentOrders.length === 0 ? (
          <>
            <EmptyState
              className="mt-4"
              title="No orders yet"
              action={
                <Button asChild>
                  <Link href="/market">Browse listings</Link>
                </Button>
              }
            />
          </>
        ) : (
          <>
            <ul className="mt-6" aria-label="Recent orders">
              {recentOrders.map((order) => (
                <OrderListRow key={order.$id} order={order} />
              ))}
            </ul>
            <p className="mt-6">
              <Button variant="secondary" size="sm" asChild>
                <Link href="/orders">View all orders</Link>
              </Button>
            </p>
          </>
        )}
      </section>

      <section className="mt-12" aria-labelledby="wishlist-preview-heading">
        <h2
          id="wishlist-preview-heading"
          className="text-lg font-semibold tracking-tight"
        >
          Wishlist
          {wishlistView.itemCount > 0 ? (
            <span className="ml-2 font-mono text-sm font-normal tabular-nums text-muted-foreground">
              ({wishlistView.itemCount})
            </span>
          ) : null}
        </h2>
        {wishlistView.lines.length === 0 ? (
          <>
            <EmptyState
              className="mt-4"
              title="Nothing saved yet"
              description="Browse listings and tap Save on a product page."
              action={
                <Button asChild>
                  <Link href="/market">Browse listings</Link>
                </Button>
              }
            />
          </>
        ) : (
          <>
            <ul className="mt-6" aria-label="Saved products preview">
              {wishlistView.lines.map((line) => {
                const product = line.product;
                const title = product?.title ?? "Unknown product";
                const priceLabel = product
                  ? product.isFree
                    ? "free"
                    : `${product.currency} ${product.price.toFixed(2)}`
                  : null;
                const note = wishlistIssueLabel(line.issue);
                const href = product ? `/products/${product.$id}` : undefined;

                return (
                  <li
                    key={line.item.$id}
                    className="border-b border-border py-4 last:border-b-0"
                  >
                    {href ? (
                      <Link
                        href={href}
                        className="block font-medium tracking-tight hover:text-accent"
                      >
                        {title}
                      </Link>
                    ) : (
                      <span className="font-medium tracking-tight">{title}</span>
                    )}
                    {priceLabel ? (
                      <p className="mt-1 font-mono text-sm text-muted-foreground">
                        {priceLabel}
                      </p>
                    ) : null}
                    {note ? (
                      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
            <p className="mt-6">
              <Button variant="secondary" size="sm" asChild>
                <Link href="/wishlist">View wishlist</Link>
              </Button>
            </p>
          </>
        )}
      </section>

      <RecentlyViewedSection />
    </main>
  );
}
