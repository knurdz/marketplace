"use server";

import {
  CATALOG_PAGE_SIZE,
  listActiveProductsPage,
  listCoverImagesByProductIds,
  listPublicProductsByIds,
  searchActiveProducts,
  type ProductCatalogSort,
  type ProductCoverMap,
} from "./products";
import type { Product } from "@/lib/types";
import {
  assertRateLimit,
  getClientIp,
  RATE_LIMITS,
} from "@/lib/security/rate-limit";

/** Hydrate active listings for client-side recently viewed ids. */
export async function fetchPublicProductsByIds(
  ids: string[],
): Promise<{ products: Product[]; covers: ProductCoverMap }> {
  const products = await listPublicProductsByIds(ids);
  const covers = await listCoverImagesByProductIds(products.map((p) => p.$id));
  return { products, covers };
}

export type LoadMoreCatalogInput = {
  source: "catalog" | "search";
  categoryId?: string | null;
  sellerId?: string | null;
  query?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  sort: ProductCatalogSort;
  cursor?: string | null;
  offset?: number | null;
  invalidPriceRange?: boolean;
};

export type LoadMoreCatalogResult = {
  products: Product[];
  covers: ProductCoverMap;
  nextCursor: string | null;
  nextOffset: number | null;
  hasMore: boolean;
};

/** Public storefront: next catalog page for infinite scroll. */
export async function loadMoreCatalogProducts(
  input: LoadMoreCatalogInput,
): Promise<LoadMoreCatalogResult> {
  const empty: LoadMoreCatalogResult = {
    products: [],
    covers: {},
    nextCursor: null,
    nextOffset: null,
    hasMore: false,
  };

  const ip = await getClientIp();
  const rate = await assertRateLimit({
    bucket: "public.catalog",
    key: `ip:${ip}`,
    ...RATE_LIMITS.publicReads,
  });
  if (!rate.ok) return empty;

  if (input.invalidPriceRange) return empty;

  const minPrice = input.minPrice ?? undefined;
  const maxPrice = input.maxPrice ?? undefined;

  if (input.source === "search") {
    const q = input.query?.trim();
    if (!q) return empty;

    const offset = Math.max(input.offset ?? 0, 0);
    const result = await searchActiveProducts(q, {
      limit: CATALOG_PAGE_SIZE,
      offset,
      minPrice,
      maxPrice,
      sort: input.sort,
      invalidPriceRange: input.invalidPriceRange,
    });

    if (!result.ok) return empty;

    const covers = await listCoverImagesByProductIds(
      result.products.map((p) => p.$id),
    );
    return {
      products: result.products,
      covers,
      nextCursor: null,
      nextOffset: result.nextOffset,
      hasMore: result.nextOffset != null,
    };
  }

  const page = await listActiveProductsPage({
    limit: CATALOG_PAGE_SIZE,
    categoryId: input.categoryId ?? undefined,
    sellerId: input.sellerId ?? undefined,
    minPrice,
    maxPrice,
    sort: input.sort,
    invalidPriceRange: input.invalidPriceRange,
    cursor: input.cursor,
  });

  const covers = await listCoverImagesByProductIds(
    page.products.map((p) => p.$id),
  );

  return {
    products: page.products,
    covers,
    nextCursor: page.nextCursor,
    nextOffset: null,
    hasMore: page.nextCursor != null,
  };
}
