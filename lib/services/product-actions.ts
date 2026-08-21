"use server";

import { listPublicProductsByIds } from "./products";
import type { Product } from "@/lib/types";

/** Hydrate active listings for client-side recently viewed ids. */
export async function fetchPublicProductsByIds(
  ids: string[],
): Promise<Product[]> {
  return listPublicProductsByIds(ids);
}
