import Link from "next/link";
import type { ProductCover } from "@/lib/services/products";
import type { Product } from "@/lib/types";
import {
  coverPreviewUrl,
  formatProductPrice,
  productCardClassName,
} from "@/components/store/product-display";

type ProductCardProps = {
  product: Product;
  cover?: ProductCover;
};

export function ProductCard({ product, cover }: ProductCardProps) {
  const price = formatProductPrice(product);

  return (
    <li>
      <Link
        href={`/products/${product.$id}`}
        className={productCardClassName()}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-muted/40">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element -- Appwrite Storage preview URL
            <img
              src={coverPreviewUrl(cover)}
              alt={cover.alt ?? product.title}
              className="hover-zoom h-full w-full object-cover"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center border-b border-dashed border-border"
              aria-hidden
            >
              <span className="size-10 rounded-md border border-border bg-background/40" />
            </div>
          )}
          {product.isFree ? (
            <span className="absolute top-3 left-3 rounded-md bg-background/90 px-2 py-1 text-[11px] font-medium tracking-wide">
              Free
            </span>
          ) : null}
          {product.featured && !product.isFree ? (
            <span className="absolute top-3 left-3 rounded-md border border-border bg-background/90 px-2 py-1 text-[11px] font-medium tracking-wide">
              Featured
            </span>
          ) : null}
        </div>
        <div className="flex items-start justify-between gap-3 px-3 py-3">
          <p className="min-w-0 truncate text-sm font-medium tracking-tight">
            {product.title}
          </p>
          <p className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
            {price}
          </p>
        </div>
      </Link>
    </li>
  );
}
