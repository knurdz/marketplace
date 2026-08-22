import { ProductGrid } from "@/components/store/product-grid";
import type { ProductCoverMap } from "@/lib/services/products";
import type { Product } from "@/lib/types";

type ProductListProps = {
  products: Product[];
  covers?: ProductCoverMap;
};

/** Presentational listing grid linked to product detail. */
export function ProductList({ products, covers }: ProductListProps) {
  return <ProductGrid products={products} covers={covers} />;
}
