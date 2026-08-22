import { ProductCard } from "@/components/store/product-card";
import type { ProductCoverMap } from "@/lib/services/products";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

type ProductGridProps = {
  products: Product[];
  covers?: ProductCoverMap;
  className?: string;
};

export function ProductGrid({ products, covers, className }: ProductGridProps) {
  if (products.length === 0) return null;

  return (
    <ul
      className={cn(
        "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4",
        className,
      )}
    >
      {products.map((product) => (
        <ProductCard
          key={product.$id}
          product={product}
          cover={covers?.[product.$id]}
        />
      ))}
    </ul>
  );
}
