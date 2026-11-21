import Link from "next/link";
import { Package } from "lucide-react";
import { StorageImage } from "@/components/ui/storage-image";
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
            <StorageImage
              src={coverPreviewUrl(cover)}
              alt={cover.alt ?? product.title}
              className="h-full w-full"
              imgClassName="object-cover transition duration-300 group-hover:scale-105"
              fallback={
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Package className="size-8 stroke-[1.5]" aria-hidden />
                </div>
              }
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
          <div className="absolute top-2 left-2 z-10">
            <span
              className={cn(
                "rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase shadow-xs",
                product.condition === "used"
                  ? "border border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-400 backdrop-blur-xs"
                  : "border border-accent/30 bg-accent/15 text-accent backdrop-blur-xs",
              )}
            >
              {product.condition === "used" ? "Used" : "Brand New"}
            </span>
          </div>
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
