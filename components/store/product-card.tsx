import Link from "next/link";
import type { ProductCover } from "@/lib/services/products";
import type { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
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
  const outOfStock = product.stock <= 0 || !product.available;

  return (
    <li>
      <Link
        href={`/products/${product.$id}`}
        className={productCardClassName()}
      >
        <div className="relative aspect-square overflow-hidden bg-muted/40">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element -- Appwrite Storage preview URL
            <img
              src={coverPreviewUrl(cover)}
              alt={cover.alt ?? product.title}
              className="hover-zoom h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center border-b border-dashed border-border"
              aria-hidden
            >
              <span className="size-10 rounded-md border border-border bg-background/40" />
            </div>
          )}

          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {product.isFree ? (
              <Badge className="bg-accent text-accent-foreground">Free</Badge>
            ) : null}
            {product.featured && !product.isFree ? (
              <Badge variant="secondary">Featured</Badge>
            ) : null}
          </div>

          {outOfStock ? (
            <div className="absolute inset-x-0 bottom-0 bg-background/85 px-3 py-1.5 text-center text-xs font-medium">
              Out of stock
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-1 px-3 py-3">
          <p className="line-clamp-2 min-h-[2.5rem] text-sm leading-snug text-muted-foreground">
            {product.title}
          </p>
          <p className="font-mono text-base font-semibold tabular-nums tracking-tight">
            {price}
          </p>
        </div>
      </Link>
    </li>
  );
}
