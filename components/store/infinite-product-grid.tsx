"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ProductGrid } from "@/components/store/product-grid";
import { ProductGridSkeleton } from "@/components/store/product-grid-skeleton";
import {
  loadMoreCatalogProducts,
  type LoadMoreCatalogInput,
} from "@/lib/services/product-actions";
import type { ProductCatalogSort, ProductCoverMap } from "@/lib/services/products";
import type { Product } from "@/lib/types";

type InfiniteProductGridProps = {
  initialProducts: Product[];
  initialCovers: ProductCoverMap;
  totalCount: number;
  source: LoadMoreCatalogInput["source"];
  categoryId?: string;
  sellerId?: string;
  query?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  sort: ProductCatalogSort;
  invalidPriceRange?: boolean;
  initialCursor?: string | null;
  initialNextOffset?: number | null;
  className?: string;
  gridClassName?: string;
};

export function InfiniteProductGrid({
  initialProducts,
  initialCovers,
  totalCount,
  source,
  categoryId,
  sellerId,
  query,
  minPrice,
  maxPrice,
  sort,
  invalidPriceRange = false,
  initialCursor = null,
  initialNextOffset = null,
  className,
  gridClassName,
}: InfiniteProductGridProps) {
  const [products, setProducts] = useState(initialProducts);
  const [covers, setCovers] = useState(initialCovers);
  const [cursor, setCursor] = useState(initialCursor);
  const [offset, setOffset] = useState(
    initialNextOffset ?? initialProducts.length,
  );
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(() =>
    source === "search"
      ? initialNextOffset != null
      : initialCursor != null,
  );
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setProducts(initialProducts);
    setCovers(initialCovers);
    setCursor(initialCursor);
    setOffset(initialNextOffset ?? initialProducts.length);
    setHasMore(
      source === "search"
        ? initialNextOffset != null
        : initialCursor != null,
    );
  }, [
    initialProducts,
    initialCovers,
    initialCursor,
    initialNextOffset,
    source,
  ]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || invalidPriceRange) return;
    setLoading(true);
    try {
      const result = await loadMoreCatalogProducts({
        source,
        categoryId,
        sellerId,
        query,
        minPrice,
        maxPrice,
        sort,
        cursor: source === "catalog" ? cursor : null,
        offset: source === "search" ? offset : null,
        invalidPriceRange,
      });

      if (result.products.length === 0) {
        setHasMore(false);
        return;
      }

      setProducts((prev) => [...prev, ...result.products]);
      setCovers((prev) => ({ ...prev, ...result.covers }));
      setCursor(result.nextCursor);
      if (result.nextOffset != null) {
        setOffset(result.nextOffset);
      }
      setHasMore(result.hasMore);
    } finally {
      setLoading(false);
    }
  }, [
    loading,
    hasMore,
    invalidPriceRange,
    source,
    categoryId,
    sellerId,
    query,
    minPrice,
    maxPrice,
    sort,
    cursor,
    offset,
  ]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: "240px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  if (products.length === 0) return null;

  return (
    <div className={className}>
      <ProductGrid
        products={products}
        covers={covers}
        className={gridClassName}
      />
      {hasMore ? (
        <div ref={sentinelRef} className="h-px w-full" aria-hidden />
      ) : null}
      {loading ? (
        <div className="mt-8">
          <ProductGridSkeleton count={4} />
        </div>
      ) : null}
    </div>
  );
}
