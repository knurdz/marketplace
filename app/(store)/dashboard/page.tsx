import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CheckCircle2,
  Heart,
  Package,
  XCircle,
} from "lucide-react";
import { EmptyState } from "@/components/layout/empty-state";
import { portalWelcomeName } from "@/components/layout/portal-greeting";
import { StatCardGrid } from "@/components/layout/stat-card";
import { BuyerAccountShell } from "@/components/store/buyer-account-shell";
import { BuyerRequestCard } from "@/components/store/buyer-request-card";
import { RecentlyViewedSection } from "@/components/store/recently-viewed-section";
import { Button } from "@/components/ui/button";
import { BUCKET_PRODUCT_IMAGES } from "@/lib/appwrite/config";
import { getOwnProfile } from "@/lib/appwrite/profiles";
import { getLoggedInUser } from "@/lib/appwrite/session";
import { toSessionUserView } from "@/lib/appwrite/session-user";
import { getFilePreviewUrl } from "@/lib/appwrite/storage-urls";
import {
  getOwnWishlistView,
  listCoverImagesByProductIds,
  listOwnPurchaseRequests,
} from "@/lib/services";
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

  const [requests, wishlistView, profile] = await Promise.all([
    listOwnPurchaseRequests({ limit: 50 }),
    getOwnWishlistView(),
    getOwnProfile(),
  ]);

  const summary = countRequests(requests);
  const recentRequests = requests.slice(0, RECENT_REQUESTS_LIMIT);
  const wishlistPreview = wishlistView.lines.slice(0, WISHLIST_PREVIEW_LIMIT);
  const coverProductIds = [
    ...recentRequests.map((r) => r.productId),
    ...wishlistPreview.map((line) => line.item.productId),
  ];
  const covers = await listCoverImagesByProductIds(coverProductIds);
  const coverUrlByProductId = Object.fromEntries(
    Object.entries(covers).map(([id, cover]) => [
      id,
      getFilePreviewUrl(BUCKET_PRODUCT_IMAGES, cover.fileId, {
        width: 160,
        height: 160,
      }),
    ]),
  );

  const welcome = portalWelcomeName(
    toSessionUserView(user),
    profile?.displayName,
  );

  return (
    <BuyerAccountShell
      title={`Hi, ${welcome}`}
      description="Buy requests, saved products, and what you viewed on this device."
      actions={
        <Button size="sm" asChild>
          <Link href="/market">Browse market</Link>
        </Button>
      }
    >
      <StatCardGrid
        className="xl:grid-cols-4"
        cards={[
          {
            label: "Open",
            value: String(summary.open),
            hint: "Waiting on seller",
            href: "/requests?filter=open",
            icon: Package,
          },
          {
            label: "Sold",
            value: String(summary.sold),
            hint: "Completed deals",
            href: "/requests?filter=sold",
            icon: CheckCircle2,
          },
          {
            label: "Cancelled",
            value: String(summary.cancelled),
            hint: "Closed without sale",
            href: "/requests?filter=cancelled",
            icon: XCircle,
          },
          {
            label: "Saved",
            value: String(wishlistView.itemCount),
            hint: "Wishlist items",
            href: "/wishlist",
            icon: Heart,
          },
        ]}
      />

      <section className="mt-10" aria-labelledby="recent-requests-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2
              id="recent-requests-heading"
              className="text-lg font-semibold tracking-tight"
            >
              Recent requests
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Contact sellers from each request detail.
            </p>
          </div>
          <Button variant="secondary" size="sm" asChild>
            <Link href="/requests">View all</Link>
          </Button>
        </div>
        {recentRequests.length === 0 ? (
          <EmptyState
            className="mt-6"
            icon={Package}
            title="No requests yet"
            description="Browse listings and tap Buy to send a request to a seller."
            action={
              <Button asChild>
                <Link href="/market">Browse market</Link>
              </Button>
            }
          />
        ) : (
          <ul className="mt-6 space-y-3">
            {recentRequests.map((request) => (
              <BuyerRequestCard
                key={request.$id}
                request={request}
                coverUrl={coverUrlByProductId[request.productId]}
              />
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10" aria-labelledby="wishlist-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2
              id="wishlist-heading"
              className="text-lg font-semibold tracking-tight"
            >
              Wishlist
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Products you saved for later.
            </p>
          </div>
          <Button variant="secondary" size="sm" asChild>
            <Link href="/wishlist">View wishlist</Link>
          </Button>
        </div>
        {wishlistPreview.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Nothing saved yet. Open a listing and tap Save.
          </p>
        ) : (
          <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {wishlistPreview.map((line) => {
              const issue = wishlistIssueLabel(line.issue);
              const coverUrl = coverUrlByProductId[line.item.productId];
              const product = line.product;
              const href = product ? `/products/${product.$id}` : undefined;
              const title = product?.title ?? "Unavailable";
              const price =
                product == null
                  ? null
                  : product.isFree
                    ? "free"
                    : `${product.currency} ${product.price.toFixed(2)}`;

              const body = (
                <>
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                    {coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- storage preview URL
                      <img
                        src={coverUrl}
                        alt=""
                        className="size-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-muted-foreground">
                        <Package className="size-7 opacity-60" aria-hidden />
                      </div>
                    )}
                  </div>
                  <div className="mt-3 min-w-0">
                    <p className="line-clamp-2 text-sm font-medium leading-snug group-hover:text-accent">
                      {title}
                    </p>
                    {price ? (
                      <p className="mt-1 text-sm font-semibold">{price}</p>
                    ) : null}
                    {issue ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {issue}
                      </p>
                    ) : null}
                  </div>
                </>
              );

              return (
                <li key={line.item.$id}>
                  {href ? (
                    <Link href={href} className="group block">
                      {body}
                    </Link>
                  ) : (
                    <div className="block opacity-80">{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="mt-12">
        <RecentlyViewedSection embedded />
      </div>
    </BuyerAccountShell>
  );
}
