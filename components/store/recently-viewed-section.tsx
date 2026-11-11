"use client";

import { useEffect, useState } from "react";
import { ProductGrid } from "@/components/store/product-grid";
import { SectionHeading } from "@/components/store/section-heading";
import { fetchPublicProductsByIds } from "@/lib/services/product-actions";
import { readRecentlyViewedIds } from "@/lib/storefront/recently-viewed";
import type { ProductCoverMap } from "@/lib/services/products";
import type { Product } from "@/lib/types";

type RecentlyViewedSectionProps = {
  /** Exclude the current product page id from the strip when set. */
  excludeProductId?: string;
  /** Drop outer max-width padding when nested in a page that already has it. */
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
          ? "mt-14 w-full"
          : "mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
      }
    >
      <SectionHeading title="Recently viewed" />
      <div className="mt-6">
        <ProductGrid products={products} covers={covers} />
      </div>
    </section>
  );
}
