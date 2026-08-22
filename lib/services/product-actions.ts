"use server";

import { listCoverImagesByProductIds, listPublicProductsByIds } from "./products";
import type { ProductCoverMap } from "./products";
import type { Product } from "@/lib/types";

/** Hydrate active listings for client-side recently viewed ids. */
export async function fetchPublicProductsByIds(
  ids: string[],
): Promise<{ products: Product[]; covers: ProductCoverMap }> {
  const products = await listPublicProductsByIds(ids);
  const covers = await listCoverImagesByProductIds(products.map((p) => p.$id));
  return { products, covers };
}
