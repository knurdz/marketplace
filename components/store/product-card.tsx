import Link from "next/link";
import { Package } from "lucide-react";
import type { ProductCover } from "@/lib/services/products";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  coverPreviewUrl,
  formatProductPrice,
} from "@/components/store/product-display";

type ProductCardProps = {
  product: Product;
  cover?: ProductCover;
  className?: string;
};

export function ProductCard({ product, cover, className }: ProductCardProps) {
  const price = formatProductPrice(product);
  const outOfStock = product.stock <= 0 || !product.available;

  return (
    <li className={cn(className)}>
      <Link
        href={`/products/${product.$id}`}
        className="group flex h-full flex-col gap-3"
      >
        <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element -- Appwrite Storage preview URL
            <img
              src={coverPreviewUrl(cover)}
              alt={cover.alt ?? product.title}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div
              className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground"
              aria-hidden
            >
              <Package className="size-8 stroke-[1.5]" />
            </div>
          )}
          {outOfStock ? (
            <div className="absolute inset-x-0 bottom-0 bg-background/90 px-3 py-1.5 text-center text-xs font-medium text-destructive">
              Out of stock
            </div>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-1">
          <p className="line-clamp-2 text-sm leading-snug text-foreground group-hover:text-accent">
            {product.title}
          </p>
          <p className="text-base font-bold text-foreground">{price}</p>
        </div>
      </Link>
    </li>
  );
}
