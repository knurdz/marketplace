import { AppwriteException, Query } from "node-appwrite";
import {
  DATABASE_ID,
  TABLE_PRODUCT_IMAGES,
  TABLE_PRODUCTS,
  hasAppwritePublicConfig,
} from "@/lib/appwrite/config";
import { createPublicClient } from "@/lib/appwrite/server";
import type { Product, ProductImage } from "@/lib/types";
import {
  ACTIVE_PRODUCT_STATUS,
  isProductStatus,
} from "@/lib/types";

function asNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return value.length > 0 ? value : null;
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function asBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  return fallback;
}

/** Map a TablesDB row to Product; returns null if status is missing/invalid. */
export function asProduct(row: Record<string, unknown>): Product | null {
  const statusRaw = row.status;
  if (!isProductStatus(statusRaw)) return null;

  const $id = asNullableString(row.$id);
  const sellerId = asNullableString(row.sellerId);
  const categoryId = asNullableString(row.categoryId);
  const title = asNullableString(row.title);
  const description = asNullableString(row.description);
  if (!$id || !sellerId || !categoryId || !title || description === null) {
    return null;
  }

  return {
    $id,
    sellerId,
    categoryId,
    title,
    description,
    price: asNumber(row.price),
    isFree: asBoolean(row.isFree),
    status: statusRaw,
    stock: Math.max(0, Math.floor(asNumber(row.stock))),
    available: asBoolean(row.available, true),
    currency: asNullableString(row.currency) || "LKR",
  };
}

function isPubliclyListed(product: Product): boolean {
  return product.status === ACTIVE_PRODUCT_STATUS && product.available;
}

export type ProductCatalogSort = "newest" | "price_asc" | "price_desc";

export type ProductCatalogParams = {
  minPrice?: number;
  maxPrice?: number;
  sort: ProductCatalogSort;
  /** When true, callers must return [] without querying TablesDB. */
  invalidPriceRange: boolean;
};

type ProductCatalogFilterOpts = {
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductCatalogSort;
};

function parseOptionalPrice(raw: unknown): number | undefined {
  if (raw == null || raw === "") return undefined;
  const n = typeof raw === "number" ? raw : Number(String(raw).trim());
  if (!Number.isFinite(n) || n < 0) return undefined;
  return n;
}

function normalizeProductCatalogSort(raw: unknown): ProductCatalogSort {
  if (raw === "price_asc" || raw === "price_desc" || raw === "newest") {
    return raw;
  }
  return "newest";
}

/** Parse storefront URL params for price range + sort. Invalid bounds are omitted. */
export function parseProductCatalogParams(raw: {
  minPrice?: string | number | null;
  maxPrice?: string | number | null;
  sort?: string | null;
}): ProductCatalogParams {
  const minPrice = parseOptionalPrice(raw.minPrice);
  const maxPrice = parseOptionalPrice(raw.maxPrice);
  const sort = normalizeProductCatalogSort(raw.sort);
  const invalidPriceRange =
    minPrice != null && maxPrice != null && minPrice > maxPrice;

  return {
    ...(minPrice != null ? { minPrice } : {}),
    ...(maxPrice != null ? { maxPrice } : {}),
    sort,
    invalidPriceRange,
  };
}

function productCatalogSortQuery(sort: ProductCatalogSort): string {
  switch (sort) {
    case "price_asc":
      return Query.orderAsc("price");
    case "price_desc":
      return Query.orderDesc("price");
    default:
      return Query.orderDesc("$createdAt");
  }
}

function buildProductCatalogQueries(
  filters: ProductCatalogFilterOpts & {
    categoryId?: string | null;
    sellerId?: string | null;
  },
): string[] {
  const categoryId = filters.categoryId?.trim() || null;
  const sellerId = filters.sellerId?.trim() || null;

  return [
    Query.equal("status", ACTIVE_PRODUCT_STATUS),
    Query.equal("available", true),
    ...(sellerId ? [Query.equal("sellerId", sellerId)] : []),
    ...(categoryId ? [Query.equal("categoryId", categoryId)] : []),
    ...(filters.minPrice != null
      ? [Query.greaterThanEqual("price", filters.minPrice)]
      : []),
    ...(filters.maxPrice != null
      ? [Query.lessThanEqual("price", filters.maxPrice)]
      : []),
    productCatalogSortQuery(filters.sort ?? "newest"),
  ];
}

function mapPublicProductRows(rows: unknown[]): Product[] {
  const products: Product[] = [];
  for (const row of rows) {
    const product = asProduct(row as Record<string, unknown>);
    if (product && isPubliclyListed(product)) {
      products.push(product);
    }
  }
  return products;
}

/**
 * List storefront products: `status=active` and `available=true` only.
 * Optional `categoryId` narrows via `status_category_idx` (still active-only).
 * Price bounds use `price_idx`; sort applies across newest/price.
 * Uses public TablesDB client (table has read(any)); never returns inactive.
 */
export async function listActiveProducts(opts?: {
  limit?: number;
  categoryId?: string;
  sellerId?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductCatalogSort;
  invalidPriceRange?: boolean;
}): Promise<Product[]> {
  if (!hasAppwritePublicConfig() || opts?.invalidPriceRange) return [];

  const limit = Math.min(Math.max(opts?.limit ?? 24, 1), 100);
  const categoryId = opts?.categoryId?.trim() || null;
  const sellerId = opts?.sellerId?.trim() || null;

  try {
    const { tables } = await createPublicClient();
    const queries = [
      ...buildProductCatalogQueries({
        categoryId,
        sellerId,
        minPrice: opts?.minPrice,
        maxPrice: opts?.maxPrice,
        sort: opts?.sort,
      }),
      Query.limit(limit),
    ];
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_PRODUCTS,
      queries,
    });

    return mapPublicProductRows(result.rows);
  } catch {
    return [];
  }
}

/** Normalize search query: trim, collapse whitespace, cap length. Empty → null. */
export function normalizeProductSearchQuery(
  raw: string | null | undefined,
): string | null {
  if (raw == null) return null;
  const normalized = raw.trim().replace(/\s+/g, " ").slice(0, 64);
  return normalized.length > 0 ? normalized : null;
}

/**
 * Fulltext search active, available products by `title`.
 * Empty/whitespace query returns [] (never dumps the full catalog).
 * Requires `title_fulltext` index (setup-mvp-schema).
 */
export async function searchActiveProducts(
  query: string,
  opts?: {
    limit?: number;
    minPrice?: number;
    maxPrice?: number;
    sort?: ProductCatalogSort;
    invalidPriceRange?: boolean;
  },
): Promise<Product[]> {
  const normalized = normalizeProductSearchQuery(query);
  if (
    !normalized ||
    !hasAppwritePublicConfig() ||
    opts?.invalidPriceRange
  ) {
    return [];
  }

  const limit = Math.min(Math.max(opts?.limit ?? 24, 1), 48);

  try {
    const { tables } = await createPublicClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_PRODUCTS,
      queries: [
        Query.search("title", normalized),
        ...buildProductCatalogQueries({
          minPrice: opts?.minPrice,
          maxPrice: opts?.maxPrice,
          sort: opts?.sort,
        }),
        Query.limit(limit),
      ],
    });

    return mapPublicProductRows(result.rows);
  } catch {
    return [];
  }
}

/**
 * Public product by id. Returns null if missing or not publicly listed
 * (avoids leaking draft/pending/rejected/archived listings).
 */
export async function getProduct(id: string): Promise<Product | null> {
  const trimmed = id?.trim();
  if (!trimmed || !hasAppwritePublicConfig()) return null;

  try {
    const { tables } = await createPublicClient();
    const row = await tables.getRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PRODUCTS,
      rowId: trimmed,
    });
    const product = asProduct(row as unknown as Record<string, unknown>);
    if (!product || !isPubliclyListed(product)) return null;
    return product;
  } catch (error) {
    if (error instanceof AppwriteException && error.code === 404) {
      return null;
    }
    return null;
  }
}

/** Map a TablesDB row to ProductImage; returns null if required fields are missing. */
export function asProductImage(
  row: Record<string, unknown>,
): ProductImage | null {
  const $id = asNullableString(row.$id);
  const productId = asNullableString(row.productId);
  const fileId = asNullableString(row.fileId);
  if (!$id || !productId || !fileId) return null;

  return {
    $id,
    productId,
    fileId,
    sortOrder: Math.max(0, Math.floor(asNumber(row.sortOrder))),
    alt: asNullableString(row.alt),
  };
}

/**
 * List images for a product (table has read(any)).
 * Ordered by sortOrder ascending. Scoped to the given productId only.
 */
export async function listProductImages(
  productId: string,
): Promise<ProductImage[]> {
  const trimmed = productId?.trim();
  if (!trimmed || !hasAppwritePublicConfig()) return [];

  try {
    const { tables } = await createPublicClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_PRODUCT_IMAGES,
      queries: [
        Query.equal("productId", trimmed),
        Query.orderAsc("sortOrder"),
        Query.limit(24),
      ],
    });

    const images: ProductImage[] = [];
    for (const row of result.rows) {
      const image = asProductImage(row as unknown as Record<string, unknown>);
      if (image && image.productId === trimmed) {
        images.push(image);
      }
    }
    return images;
  } catch {
    return [];
  }
}
