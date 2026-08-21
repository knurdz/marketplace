"use client";

import { useEffect, useState } from "react";
import { ProductList } from "@/components/store/product-list";
import { fetchPublicProductsByIds } from "@/lib/services/product-actions";
import { readRecentlyViewedIds } from "@/lib/storefront/recently-viewed";
import type { Product } from "@/lib/types";

type RecentlyViewedSectionProps = {
  /** Exclude the current product page id from the strip when set. */
  excludeProductId?: string;
};

export function RecentlyViewedSection({
  excludeProductId,
}: RecentlyViewedSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
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
          setLoaded(true);
        }
        return;
      }

      const hydrated = await fetchPublicProductsByIds(ids);
      if (!cancelled) {
        setProducts(hydrated);
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
    <section className="relative mx-auto w-full max-w-5xl border-t border-border px-6 py-12 sm:px-10">
      <p className="font-mono text-sm text-accent">$ ./products --recent</p>
      <h2 className="mt-3 text-2xl font-bold tracking-tight">Recently viewed</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Saved on this device only — not shared across accounts.
      </p>
      <div className="mt-6">
        <ProductList products={products} />
      </div>
    </section>
  );
}
