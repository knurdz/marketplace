import Image from "next/image";
import Link from "next/link";
import { WishlistRemoveButton } from "@/components/store/wishlist-remove-button";
import type { WishlistLine } from "@/lib/types";

type WishlistListProps = {
  lines: WishlistLine[];
  imageByProductId: Record<string, string | null>;
};

function issueLabel(issue: WishlistLine["issue"]): string | null {
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

export function WishlistList({ lines, imageByProductId }: WishlistListProps) {
  if (lines.length === 0) return null;

  return (
    <ul className="mt-10 space-y-0" aria-label="Saved products">
      {lines.map((line) => {
        const product = line.product;
        const title = product?.title ?? "Unknown product";
        const priceLabel = product
          ? product.isFree
            ? "free"
            : `${product.currency} ${product.price.toFixed(2)}`
          : null;
        const note = issueLabel(line.issue);
        const previewUrl = imageByProductId[line.item.productId] ?? null;
        const href = product ? `/products/${product.$id}` : undefined;

        return (
          <li
            key={line.item.$id}
            className="flex flex-col gap-4 border-b border-border py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 flex-1 items-start gap-4">
              {previewUrl ? (
                <div className="relative size-16 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                  <Image
                    src={previewUrl}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div
                  className="size-16 shrink-0 rounded-md border border-border bg-muted"
                  aria-hidden
                />
              )}
              <div className="min-w-0">
                {href ? (
                  <Link
                    href={href}
                    className="font-medium tracking-tight hover:text-accent"
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
              </div>
            </div>
            <WishlistRemoveButton
              productId={line.item.productId}
              productTitle={product?.title ?? null}
            />
          </li>
        );
      })}
    </ul>
  );
}
