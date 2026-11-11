import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Package } from "lucide-react";
import { PurchaseRequestContactCard } from "@/components/store/purchase-request-contact-card";
import { SellerRequestResolveActions } from "@/components/seller/seller-request-resolve-actions";
import { formatProductPrice } from "@/components/store/product-display";
import { PortalPageHeader } from "@/components/layout/portal-page-header";
import { StatusPill } from "@/components/layout/status-pill";
import { Button } from "@/components/ui/button";
import { StorageImage } from "@/components/ui/storage-image";
import { BUCKET_PRODUCT_IMAGES } from "@/lib/appwrite/config";
import { getFilePreviewUrl } from "@/lib/appwrite/storage-urls";
import { formatPurchaseRequestStatus } from "@/lib/request-display";
import type { PurchaseRequest, PurchaseRequestContact } from "@/lib/types";
import { canSellerResolvePurchaseRequest } from "@/lib/types";
import { purchaseRequestStatusTone } from "@/lib/ui/status-tone";
import { cn } from "@/lib/utils";

type SellerRequestDetailProps = {
  request: PurchaseRequest;
  contact: PurchaseRequestContact;
  coverFileId?: string;
};

function formatRequestDate(iso?: string): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function SummaryRow({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4 text-sm", className)}>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium tabular-nums text-foreground">{value}</dd>
    </div>
  );
}

export function SellerRequestDetail({
  request,
  contact,
  coverFileId,
}: SellerRequestDetailProps) {
  const unitLabel = formatProductPrice({
    price: request.unitPrice,
    currency: request.currency,
    isFree: request.unitPrice === 0,
  });
  const lineTotal = request.unitPrice * request.quantity;
  const totalLabel = formatProductPrice({
    price: lineTotal,
    currency: request.currency,
    isFree: lineTotal === 0,
  });
  const requestedAt = formatRequestDate(request.$createdAt);
  const canResolve = canSellerResolvePurchaseRequest(request.status);

  return (
    <div className="w-full">
      <PortalPageHeader
        title={request.title}
        description={
          requestedAt
            ? `Submitted ${requestedAt}`
            : "Buyer purchase request — arrange payment and delivery off-platform."
        }
        actions={
          <Button variant="info" size="sm" asChild>
            <Link href="/seller/requests">
              <ArrowLeft data-icon="inline-start" />
              Back to requests
            </Link>
          </Button>
        }
      />

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
          <aside className="border-b border-border bg-muted/15 p-5 lg:border-b-0 lg:border-r">
            <div className="relative mx-auto aspect-square w-full max-w-[240px] overflow-hidden rounded-lg border border-border bg-muted/25 lg:max-w-none">
              {coverFileId ? (
                <StorageImage
                  src={getFilePreviewUrl(BUCKET_PRODUCT_IMAGES, coverFileId, {
                    width: 480,
                    height: 480,
                  })}
                  alt=""
                  className="size-full"
                  imgClassName="object-cover"
                  fallback={
                    <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Package className="size-10 opacity-60" aria-hidden />
                      <span className="text-xs">No photo</span>
                    </div>
                  }
                />
              ) : (
                <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Package className="size-10 opacity-60" aria-hidden />
                  <span className="text-xs">No photo</span>
                </div>
              )}
            </div>

            <dl className="mt-5 space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-sm text-muted-foreground">Status</dt>
                <dd data-testid="request-status">
                  <StatusPill
                    label={formatPurchaseRequestStatus(request.status)}
                    tone={purchaseRequestStatusTone(request.status)}
                  />
                </dd>
              </div>
              <SummaryRow label="Quantity" value={request.quantity} />
              <SummaryRow label="Unit price" value={unitLabel} />
              <SummaryRow
                label="Line total"
                value={totalLabel}
                className="border-t border-border pt-2.5 text-base"
              />
            </dl>

            <div className="mt-5">
              <Button variant="info" size="sm" className="w-full" asChild>
                <Link href={`/products/${request.productId}`} target="_blank">
                  <ExternalLink data-icon="inline-start" />
                  View on storefront
                </Link>
              </Button>
            </div>
          </aside>

          <div className="flex min-w-0 flex-col">
            <div className="flex-1 p-5 lg:p-6">
              <PurchaseRequestContactCard
                title="Buyer contact"
                contact={contact}
                variant="portal"
              />
            </div>

            {canResolve ? (
              <div
                className="flex flex-col gap-3 border-t border-border bg-muted/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-6"
                data-testid="seller-request-actions-bar"
              >
                <p className="text-sm text-muted-foreground">
                  Confirm payment offline, then mark sold to reduce stock.
                </p>
                <SellerRequestResolveActions requestId={request.$id} />
              </div>
            ) : (
              <div className="border-t border-border bg-muted/10 px-5 py-4 lg:px-6">
                <p className="text-sm text-muted-foreground">
                  This request is closed. No further actions are available.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
