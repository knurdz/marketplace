import Link from "next/link";
import { redirect } from "next/navigation";
import { RecentlyViewedSection } from "@/components/store/recently-viewed-section";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getLoggedInUser } from "@/lib/appwrite/session";
import { getOwnWishlistView, listOwnPurchaseRequests } from "@/lib/services";
import { formatPurchaseRequestStatus } from "@/lib/request-display";
import type { PurchaseRequest, WishlistLine } from "@/lib/types";

const RECENT_REQUESTS_LIMIT = 5;
const WISHLIST_PREVIEW_LIMIT = 4;

type RequestSummaryCounts = {
  open: number;
  sold: number;
  cancelled: number;
};

function countRequests(requests: PurchaseRequest[]): RequestSummaryCounts {
  const counts: RequestSummaryCounts = {
    open: 0,
    sold: 0,
    cancelled: 0,
  };
  for (const request of requests) {
    if (request.status === "requested") counts.open += 1;
    else if (request.status === "sold") counts.sold += 1;
    else if (request.status === "cancelled") counts.cancelled += 1;
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

  const [requests, wishlistView] = await Promise.all([
    listOwnPurchaseRequests({ limit: 50 }),
    getOwnWishlistView({ limit: WISHLIST_PREVIEW_LIMIT }),
  ]);

  const summary = countRequests(requests);
  const recentRequests = requests.slice(0, RECENT_REQUESTS_LIMIT);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Your dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Buy requests, saved products, and what you viewed on this device.
        </p>
      </header>

      <section className="mt-12" aria-labelledby="request-summary-heading">
        <h2
          id="request-summary-heading"
          className="text-lg font-semibold tracking-tight"
        >
          Request summary
        </h2>
        <dl className="mt-6 grid grid-cols-3 gap-3">
          <Card>
            <CardContent>
              <dt className="text-sm text-muted-foreground">Open</dt>
              <dd className="mt-1 font-mono text-2xl tabular-nums">
                {summary.open}
              </dd>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <dt className="text-sm text-muted-foreground">Sold</dt>
              <dd className="mt-1 font-mono text-2xl tabular-nums">
                {summary.sold}
              </dd>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <dt className="text-sm text-muted-foreground">Cancelled</dt>
              <dd className="mt-1 font-mono text-2xl tabular-nums">
                {summary.cancelled}
              </dd>
            </CardContent>
          </Card>
        </dl>
      </section>

      <section className="mt-12" aria-labelledby="recent-requests-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2
            id="recent-requests-heading"
            className="text-lg font-semibold tracking-tight"
          >
            Recent requests
          </h2>
          <Button variant="secondary" size="sm" asChild>
            <Link href="/requests">View all</Link>
          </Button>
        </div>
        {recentRequests.length === 0 ? (
          <EmptyState
            className="mt-6"
            title="No requests yet"
            description="Browse listings and tap Buy to send a request to a seller."
            action={
              <Button asChild>
                <Link href="/">Browse market</Link>
              </Button>
            }
          />
        ) : (
          <ul className="mt-6 divide-y divide-border rounded-xl border border-border">
            {recentRequests.map((request) => (
              <li
                key={request.$id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <p className="font-medium">{request.title}</p>
                  <p className="text-sm text-muted-foreground">
                    Qty {request.quantity} ·{" "}
                    {formatPurchaseRequestStatus(request.status)}
                  </p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/requests/${request.$id}`}>Open</Link>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12" aria-labelledby="wishlist-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2
            id="wishlist-heading"
            className="text-lg font-semibold tracking-tight"
          >
            Wishlist
          </h2>
          <Button variant="secondary" size="sm" asChild>
            <Link href="/wishlist">View wishlist</Link>
          </Button>
        </div>
        {wishlistView.lines.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Nothing saved yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {wishlistView.lines.map((line) => {
              const issue = wishlistIssueLabel(line.issue);
              return (
                <li key={line.item.$id} className="text-sm">
                  {line.product ? (
                    <Link
                      href={`/products/${line.product.$id}`}
                      className="font-medium hover:underline"
                    >
                      {line.product.title}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">Unavailable</span>
                  )}
                  {issue ? (
                    <span className="ml-2 text-muted-foreground">({issue})</span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="mt-12">
        <RecentlyViewedSection />
      </div>
    </main>
  );
}
