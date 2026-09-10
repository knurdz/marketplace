import { BUCKET_PRODUCT_IMAGES } from "@/lib/appwrite/config";
import { getFilePreviewUrl } from "@/lib/appwrite/storage-urls";
import type { ProductCover } from "@/lib/services/products";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export function formatProductPrice(product: Pick<Product, "isFree" | "price" | "currency">): string {
  if (product.isFree) return "Free";
  try {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: product.currency,
      maximumFractionDigits: 2,
    }).format(product.price);
  } catch {
    return `${product.currency} ${product.price.toFixed(2)}`;
  }
}

export function coverPreviewUrl(cover: ProductCover, size = 640): string {
  return getFilePreviewUrl(BUCKET_PRODUCT_IMAGES, cover.fileId, {
    width: size,
    height: size,
  });
}

export function productCardClassName(className?: string): string {
  return cn(
    "group/card block overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-accent/45 hover:bg-card-hover hover:shadow-[0_12px_28px_-6px_rgba(21,156,85,0.16)] dark:hover:border-accent/50 dark:hover:shadow-[0_14px_35px_-8px_rgba(21,156,85,0.2)]",
    className,
  );
}
