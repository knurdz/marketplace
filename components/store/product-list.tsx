import type { Product } from "@/lib/types";

type ProductListProps = {
  products: Product[];
};

/** Presentational active-listing rows (titles non-links until product detail). */
export function ProductList({ products }: ProductListProps) {
  if (products.length === 0) return null;

  return (
    <ul className="space-y-3">
      {products.map((product) => (
        <li
          key={product.$id}
          className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border py-3"
        >
          <span className="font-medium tracking-tight">{product.title}</span>
          <span className="font-mono text-sm text-muted-foreground">
            {product.isFree
              ? "free"
              : `${product.currency} ${product.price.toFixed(2)}`}
          </span>
        </li>
      ))}
    </ul>
  );
}
