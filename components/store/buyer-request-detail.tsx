import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Package } from "lucide-react";
import { PurchaseRequestContactCard } from "@/components/store/purchase-request-contact-card";
import { SellerReviewForm } from "@/components/store/seller-review-form";
import { formatProductPrice } from "@/components/store/product-display";
import { BuyerAccountShell } from "@/components/store/buyer-account-shell";
import { StatusPill } from "@/components/layout/status-pill";
import { Button } from "@/components/ui/button";
import { StorageImage } from "@/components/ui/storage-image";
import { BUCKET_PRODUCT_IMAGES } from "@/lib/appwrite/config";
import { getFilePreviewUrl } from "@/lib/appwrite/storage-urls";
import { formatPurchaseRequestStatus } from "@/lib/request-display";
import type {
  PurchaseRequest,
  PurchaseRequestContact,
  Review,
  ReviewStatus,
} from "@/lib/types";
import { purchaseRequestStatusTone } from "@/lib/ui/status-tone";
import { cn } from "@/lib/utils";

type BuyerRequestDetailProps = {
  request: PurchaseRequest;
  contact: PurchaseRequestContact;
  coverFileId?: string;
  canReview: boolean;
  existingReview?: Review | null;
  existingStatus?: ReviewStatus;
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
    <div
      className={cn(
        "flex items-baseline justify-between gap-4 text-sm",
        className,
      )}
    >
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium tabular-nums text-foreground">{value}</dd>
    </div>
  );
}

export function BuyerRequestDetail({
  request,
  contact,
  coverFileId,
  canReview,
  existingReview,
  existingStatus,
}: BuyerRequestDetailProps) {
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

  return (
    <BuyerAccountShell
      title={request.title}
      description={
        requestedAt
          ? `Submitted ${requestedAt}`
          : "Seller contact for this purchase request."
      }
      actions={
        <Button variant="info" size="sm" asChild>
          <Link href="/requests">
            <ArrowLeft data-icon="inline-start" />
            Back to requests
          </Link>
        </Button>
      }
    >
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-none">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
          <aside className="border-b border-border bg-muted/15 p-5 lg:border-b-0 lg:border-r">
            <div className="relative mx-auto aspect-square w-full max-w-[240px] overflow-hidden rounded-xl border border-border bg-muted/25 lg:max-w-none">
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
                <Link href={`/products/${request.productId}`}>
                  <ExternalLink data-icon="inline-start" />
                  View product
                </Link>
              </Button>
            </div>
          </aside>

          <div className="flex min-w-0 flex-col">
            <div className="flex-1 space-y-6 p-5 lg:p-6">
              <PurchaseRequestContactCard
                title="Seller contact"
                contact={contact}
                variant="portal"
                description="Reach out to the seller to arrange payment and delivery."
              />

              {request.status === "sold" ? (
                <SellerReviewForm
                  requestId={request.$id}
                  canReview={canReview}
                  existing={existingReview}
                  existingStatus={existingStatus}
                />
              ) : null}
            </div>

            {request.status === "requested" ? (
              <div className="border-t border-border bg-muted/10 px-5 py-4 lg:px-6">
                <p className="text-sm text-muted-foreground">
                  Contact the seller to arrange payment and delivery. The
                  marketplace does not process payments.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </BuyerAccountShell>
  );
}
