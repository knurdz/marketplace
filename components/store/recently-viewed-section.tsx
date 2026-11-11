"use client";

import { useEffect, useState } from "react";
import { ProductGrid } from "@/components/store/product-grid";
import { fetchPublicProductsByIds } from "@/lib/services/product-actions";
import { readRecentlyViewedIds } from "@/lib/storefront/recently-viewed";
import type { ProductCoverMap } from "@/lib/services/products";
import type { Product } from "@/lib/types";

type RecentlyViewedSectionProps = {
  /** Exclude the current product page id from the strip when set. */
  excludeProductId?: string;
  /** Drop outer max-width padding when nested in buyer account shell. */
  embedded?: boolean;
};

export function RecentlyViewedSection({
  excludeProductId,
  embedded = false,
}: RecentlyViewedSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [covers, setCovers] = useState<ProductCoverMap>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const ids = readRecentlyViewedIds().filter(
        (id) => id !== excludeProductId,
      );
      if (ids.length === 0) {
        if (!cancelled) {
          setProducts([]);
          setCovers({});
          setLoaded(true);
        }
        return;
      }

      const hydrated = await fetchPublicProductsByIds(ids);
      if (!cancelled) {
        setProducts(hydrated.products);
        setCovers(hydrated.covers);
        setLoaded(true);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [excludeProductId]);

  if (!loaded || products.length === 0) return null;

  return (
    <section
      className={
        embedded
          ? "w-full"
          : "mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8"
      }
    >
      <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
        Recently viewed
      </p>
      <h2
        className={
          embedded
            ? "mt-2 text-lg font-semibold tracking-tight"
            : "mt-2 text-2xl font-bold tracking-tight"
        }
      >
        On this device
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Saved locally, not shared across accounts.
      </p>
      <div className="mt-6">
        <ProductGrid products={products} covers={covers} />
      </div>
    </section>
  );
}
