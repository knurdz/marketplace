"use client";

import { useEffect } from "react";
import { recordRecentlyViewed } from "@/lib/storefront/recently-viewed";

type RecordRecentlyViewedProps = {
  productId: string;
};

/** Persists product id to device-local recently viewed (no account data). */
export function RecordRecentlyViewed({ productId }: RecordRecentlyViewedProps) {
  useEffect(() => {
    recordRecentlyViewed(productId);
  }, [productId]);

  return null;
}
