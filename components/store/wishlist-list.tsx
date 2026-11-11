import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";
import { WishlistRemoveButton } from "@/components/store/wishlist-remove-button";
import { StatusPill } from "@/components/layout/status-pill";
import type { WishlistLine } from "@/lib/types";
import type { StatusTone } from "@/components/layout/status-pill";

type WishlistListProps = {
  lines: WishlistLine[];
  imageByProductId: Record<string, string | null>;
};

function issueMeta(
  issue: WishlistLine["issue"],
): { label: string; tone: StatusTone } | null {
  switch (issue) {
    case "inactive":
      return { label: "No longer listed", tone: "warning" };
    case "unavailable":
      return { label: "Unavailable", tone: "warning" };
    case "missing":
      return { label: "Product removed", tone: "danger" };
    default:
      return null;
  }
}

export function WishlistList({ lines, imageByProductId }: WishlistListProps) {
  if (lines.length === 0) return null;

  return (
    <ul
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      aria-label="Saved products"
    >
      {lines.map((line) => {
        const product = line.product;
        const title = product?.title ?? "Unknown product";
        const priceLabel = product
          ? product.isFree
            ? "free"
            : `${product.currency} ${product.price.toFixed(2)}`
          : null;
        const issue = issueMeta(line.issue);
        const previewUrl = imageByProductId[line.item.productId] ?? null;
        const href = product ? `/products/${product.$id}` : undefined;

        return (
          <li
            key={line.item.$id}
            className="flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-none"
          >
            {href ? (
              <Link href={href} className="group block">
                <div className="relative aspect-square overflow-hidden bg-muted">
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="flex size-full items-center justify-center text-muted-foreground"
                      aria-hidden
                    >
                      <Package className="size-8 opacity-60" />
                    </div>
                  )}
                </div>
                <div className="space-y-1.5 p-4 pb-0">
                  <p className="line-clamp-2 text-sm font-semibold leading-snug tracking-tight group-hover:text-accent">
                    {title}
                  </p>
                  {priceLabel ? (
                    <p className="text-base font-bold text-foreground">
                      {priceLabel}
                    </p>
                  ) : null}
                </div>
              </Link>
            ) : (
              <div>
                <div className="relative aspect-square overflow-hidden bg-muted">
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div
                      className="flex size-full items-center justify-center text-muted-foreground"
                      aria-hidden
                    >
                      <Package className="size-8 opacity-60" />
                    </div>
                  )}
                </div>
                <div className="space-y-1.5 p-4 pb-0">
                  <p className="line-clamp-2 text-sm font-semibold leading-snug tracking-tight">
                    {title}
                  </p>
                  {priceLabel ? (
                    <p className="text-base font-bold text-foreground">
                      {priceLabel}
                    </p>
                  ) : null}
                </div>
              </div>
            )}

            <div className="mt-auto flex flex-wrap items-center justify-between gap-2 p-4 pt-3">
              {issue ? (
                <StatusPill tone={issue.tone} label={issue.label} />
              ) : (
                <span className="text-xs text-muted-foreground">Saved</span>
              )}
              <WishlistRemoveButton
                productId={line.item.productId}
                productTitle={product?.title ?? null}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
