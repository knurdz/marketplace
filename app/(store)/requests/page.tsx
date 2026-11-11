import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Package } from "lucide-react";
import { BuyerAccountShell } from "@/components/store/buyer-account-shell";
import { BuyerRequestCard } from "@/components/store/buyer-request-card";
import { EmptyState } from "@/components/layout/empty-state";
import { FilterTabs } from "@/components/layout/data-table-shell";
import { Button } from "@/components/ui/button";
import { BUCKET_PRODUCT_IMAGES } from "@/lib/backend/config";
import { getLoggedInUser } from "@/lib/backend/session";
import { getFilePreviewUrl } from "@/lib/backend/storage-urls";
import { buildNoIndexMetadata } from "@/lib/seo/metadata";
import {
  listCoverImagesByProductIds,
  listOwnPurchaseRequests,
} from "@/lib/services";
import type { PurchaseRequestStatus } from "@/lib/types";

export const metadata: Metadata = buildNoIndexMetadata(
  "Purchase Requests",
  "Buy requests you sent to sellers on Knurdz Marketplace.",
);

type BuyerRequestsPageProps = {
  searchParams: Promise<{ filter?: string }>;
};

function resolveFilter(
  filter: string | undefined,
): PurchaseRequestStatus | undefined {
  if (filter === "open") return "requested";
  if (filter === "sold") return "sold";
  if (filter === "cancelled") return "cancelled";
  return undefined;
}

export default async function BuyerRequestsPage({
  searchParams,
}: BuyerRequestsPageProps) {
  const user = await getLoggedInUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/requests")}`);
  }

  const { filter } = await searchParams;
  const status = resolveFilter(filter);
  const active = filter === "open" || filter === "sold" || filter === "cancelled"
    ? filter
    : "all";

  const requests = status
    ? await listOwnPurchaseRequests({ status })
    : await listOwnPurchaseRequests();

  const covers = await listCoverImagesByProductIds(
    requests.map((request) => request.productId),
  );
  const coverUrlByProductId = Object.fromEntries(
    Object.entries(covers).map(([id, cover]) => [
      id,
      getFilePreviewUrl(BUCKET_PRODUCT_IMAGES, cover.fileId, {
        width: 160,
        height: 160,
      }),
    ]),
  );

  const emptyMessage =
    active === "open"
      ? "No open requests."
      : active === "sold"
        ? "No sold requests yet."
        : active === "cancelled"
          ? "No cancelled requests."
          : "No requests yet.";

  return (
    <BuyerAccountShell
      title="Your requests"
      description="Buy requests you sent to sellers. Contact details stay on each request."
      actions={
        <Button variant="info" size="sm" asChild>
          <Link href="/market">Browse market</Link>
        </Button>
      }
    >
      <FilterTabs
        tabs={[
          { href: "/requests", label: "All", active: active === "all" },
          {
            href: "/requests?filter=open",
            label: "Open",
            active: active === "open",
          },
          {
            href: "/requests?filter=sold",
            label: "Sold",
            active: active === "sold",
          },
          {
            href: "/requests?filter=cancelled",
            label: "Cancelled",
            active: active === "cancelled",
          },
        ]}
      />

      {requests.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={Package}
          title={emptyMessage}
          description={
            active === "all"
              ? "Browse listings and tap Buy to send a request to a seller."
              : undefined
          }
          action={
            active === "all" ? (
              <Button asChild>
                <Link href="/market">Browse market</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <ul className="mt-6 space-y-3">
          {requests.map((request) => (
            <BuyerRequestCard
              key={request.$id}
              request={request}
              coverUrl={coverUrlByProductId[request.productId]}
            />
          ))}
        </ul>
      )}
    </BuyerAccountShell>
  );
}
