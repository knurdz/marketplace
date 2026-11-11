import Link from "next/link";
import { Package } from "lucide-react";
import { formatProductPrice } from "@/components/store/product-display";
import { StatusPill } from "@/components/layout/status-pill";
import { formatPurchaseRequestStatus } from "@/lib/request-display";
import type { PurchaseRequest } from "@/lib/types";
import { purchaseRequestStatusTone } from "@/lib/ui/status-tone";
import { cn } from "@/lib/utils";

function formatRequestDate(iso?: string): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    dateStyle: "medium",
  });
}

type BuyerRequestCardProps = {
  request: PurchaseRequest;
  coverUrl?: string | null;
  className?: string;
};

export function BuyerRequestCard({
  request,
  coverUrl,
  className,
}: BuyerRequestCardProps) {
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
    <li>
      <Link
        href={`/requests/${request.$id}`}
        data-testid="buyer-request-link"
        className={cn(
          "group flex gap-4 rounded-2xl border border-border/80 bg-card p-4 shadow-none transition-colors hover:border-foreground/20",
          className,
        )}
      >
        <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-border bg-muted sm:size-20">
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- storage preview URL
            <img
              src={coverUrl}
              alt=""
              className="size-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <Package className="size-6 opacity-60" aria-hidden />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="line-clamp-2 text-sm font-semibold tracking-tight text-foreground group-hover:text-accent sm:text-base">
              {request.title}
            </p>
            <StatusPill
              tone={purchaseRequestStatusTone(request.status)}
              label={formatPurchaseRequestStatus(request.status)}
            />
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Qty {request.quantity} · {unitLabel} each
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="font-semibold tabular-nums text-foreground">
              {totalLabel}
            </span>
            {requestedAt ? (
              <span className="text-muted-foreground">{requestedAt}</span>
            ) : null}
          </div>
          {request.status === "sold" ? (
            <p className="mt-2 text-sm font-medium text-accent">
              Rate seller
            </p>
          ) : null}
        </div>
      </Link>
    </li>
  );
}
