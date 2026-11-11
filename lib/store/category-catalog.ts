/**
 * Canonical marketplace categories for seed + storefront images.
 * Local copies: /public/categories/{slug}.jpg
 * Hosted: storage API fileId `category-{slug}` (categories bucket when available,
 * otherwise product-images until Hostinger storage-api is redeployed).
 */

import {
  BUCKET_CATEGORIES,
  BUCKET_PRODUCT_IMAGES,
} from "@/lib/appwrite/config";
import { getFileViewUrl } from "@/lib/appwrite/storage-urls";

export type CatalogCategory = {
  name: string;
  slug: string;
  sortOrder: number;
  /** Unsplash photo id used to fetch the local asset at seed/setup time. */
  photoId: string;
};

/** Deterministic storage fileId (must be 8–64 chars for the storage API). */
export function categoryImageFileId(slug: string): string {
  return `category-${slug.trim()}`;
}

/**
 * Bucket used for category photos on the configured storage API.
 * Prefer `categories` when NEXT_PUBLIC prefers it; uploads fall back to
 * product-images if the remote API has not been redeployed yet.
 */
export function categoryImageBucket(): string {
  const prefer =
    process.env.NEXT_PUBLIC_CATEGORY_IMAGE_BUCKET?.trim() ||
    process.env.CATEGORY_IMAGE_BUCKET?.trim();
  if (prefer === BUCKET_CATEGORIES || prefer === BUCKET_PRODUCT_IMAGES) {
    return prefer;
  }
  // Live Hostinger currently allowlists product-images; categories after redeploy.
  return BUCKET_PRODUCT_IMAGES;
}

/** Flat major category types sellers can choose when listing. */
export const CATEGORY_CATALOG: CatalogCategory[] = [
  { name: "Electronics", slug: "electronics", sortOrder: 10, photoId: "1505740420928-5e560c06d30e" },
  { name: "Phones & Tablets", slug: "phones", sortOrder: 20, photoId: "1511707171634-5f897ff02aa9" },
  { name: "Computers", slug: "computers", sortOrder: 30, photoId: "1496181133206-80ce9b88a853" },
  { name: "Fashion", slug: "fashion", sortOrder: 40, photoId: "1483985988355-763728e1935b" },
  { name: "Shoes", slug: "shoes", sortOrder: 50, photoId: "1542291026-7eec264c27ff" },
  { name: "Bags", slug: "bags", sortOrder: 60, photoId: "1584917865442-de89df76afd3" },
  { name: "Jewelry & Watches", slug: "jewelry", sortOrder: 70, photoId: "1523275335684-37898b6baf30" },
  { name: "Beauty", slug: "beauty", sortOrder: 80, photoId: "1556228578-8c89e6adf883" },
  { name: "Health", slug: "health", sortOrder: 90, photoId: "1570172619644-dfd03ed5d881" },
  { name: "Home", slug: "home", sortOrder: 100, photoId: "1555041469-a586c61ea9bc" },
  { name: "Furniture", slug: "furniture", sortOrder: 110, photoId: "1493663284031-b7e3aefcae8e" },
  { name: "Kitchen", slug: "kitchen", sortOrder: 120, photoId: "1556910103-1c02745aae4d" },
  { name: "Garden & Plants", slug: "plants", sortOrder: 130, photoId: "1485955900006-10f4d324d411" },
  { name: "Sports", slug: "sport", sortOrder: 140, photoId: "1571019613454-1cb2f99b2d8b" },
  { name: "Outdoor", slug: "outdoor", sortOrder: 150, photoId: "1551632811-561732d1e306" },
  { name: "Toys & Kids", slug: "kids", sortOrder: 160, photoId: "1503454537195-1dcabb73ffb9" },
  { name: "Baby", slug: "baby", sortOrder: 170, photoId: "1515488042361-ee00e0ddd4e4" },
  { name: "Books", slug: "books", sortOrder: 180, photoId: "1495446815901-a7297e633e8d" },
  { name: "Music", slug: "music", sortOrder: 190, photoId: "1511379938547-c1f69419868d" },
  { name: "Art & Crafts", slug: "art", sortOrder: 200, photoId: "1513364776144-60967b0f800f" },
  { name: "Pets", slug: "pets", sortOrder: 210, photoId: "1514888286974-6c03e2ca1dba" },
  { name: "Automotive", slug: "automotive", sortOrder: 220, photoId: "1492144534655-ae79c964c9d7" },
  { name: "Tools", slug: "tools", sortOrder: 230, photoId: "1504148455328-c376907d081c" },
  { name: "Food & Groceries", slug: "groceries", sortOrder: 240, photoId: "1542838132-92c53300491e" },
  { name: "Accessories", slug: "accessories", sortOrder: 250, photoId: "1572635196237-14b3f281503f" },
  { name: "Digital", slug: "digital", sortOrder: 260, photoId: "1518770660439-4636190af475" },
];

const CATALOG_SLUGS = new Set(CATEGORY_CATALOG.map((c) => c.slug));

/** Public URL for a catalog category image, or null if no bundled asset. */
export function categoryImagePath(slug: string): string | null {
  const trimmed = slug?.trim();
  if (!trimmed || !CATALOG_SLUGS.has(trimmed)) return null;

  const remoteBase = process.env.NEXT_PUBLIC_STORAGE_URL?.trim();
  if (remoteBase) {
    return getFileViewUrl(categoryImageBucket(), categoryImageFileId(trimmed));
  }
  return `/categories/${trimmed}.jpg`;
}

export function unsplashDownloadUrl(photoId: string, width = 480): string {
  return `https://images.unsplash.com/photo-${photoId}?w=${width}&q=70&auto=format&fit=crop`;
}
