import Link from "next/link";
import { ArrowUpRight, Package } from "lucide-react";
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
        <div className="relative aspect-square overflow-hidden bg-muted/60">
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
              className="bg-grid-faint relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-card via-background-alt to-muted/40 p-4"
              aria-hidden
            >
              <div className="flex size-12 items-center justify-center rounded-xl border border-border/80 bg-card/80 text-muted-foreground shadow-sm backdrop-blur-xs transition-transform duration-300 group-hover/card:scale-110 group-hover/card:border-accent/50 group-hover/card:text-accent">
                <Package className="size-6 stroke-[1.5]" />
              </div>
              <span className="mt-2 text-xs text-muted-foreground/80 tracking-wide uppercase">
                Knurdz SKU
              </span>
            </div>
          )}

          <div className="absolute top-2 left-2 flex flex-wrap gap-1 z-10">
            {product.isFree ? (
              <Badge className="bg-accent text-accent-foreground font-semibold shadow-sm">Free</Badge>
            ) : null}
            {product.featured && !product.isFree ? (
              <Badge variant="secondary" className="border border-border/80 bg-background/80 backdrop-blur-xs">
                Featured
              </Badge>
            ) : null}
          </div>

          {/* Quick view / action indicator on hover */}
          <div className="pointer-events-none absolute right-2.5 bottom-2.5 z-10 flex size-7 items-center justify-center rounded-full border border-border/80 bg-background/90 text-foreground shadow-sm opacity-0 -translate-y-1 transition-all duration-300 group-hover/card:opacity-100 group-hover/card:translate-y-0 group-hover/card:border-accent/60 group-hover/card:text-accent">
            <ArrowUpRight className="size-3.5" aria-hidden />
          </div>

          {outOfStock ? (
            <div className="absolute inset-x-0 bottom-0 z-10 bg-background/90 px-3 py-1.5 text-center text-xs font-medium text-destructive backdrop-blur-xs border-t border-border">
              Out of stock
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5 px-3.5 py-3">
          <p className="line-clamp-2 min-h-[2.5rem] text-sm leading-snug font-medium text-foreground transition-colors group-hover/card:text-accent">
            {product.title}
          </p>
          <div className="flex items-center justify-between">
            <p className="font-mono text-base font-semibold tabular-nums tracking-tight text-foreground">
              {price}
            </p>
            {product.stock > 0 ? (
              <span className="text-xs text-muted-foreground">
                {product.stock <= 5 ? `Only ${product.stock} left` : "In stock"}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </li>
  );
}
