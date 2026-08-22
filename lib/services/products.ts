import { AppwriteException, Query } from "node-appwrite";
import {
  DATABASE_ID,
  TABLE_ORDER_ITEMS,
  TABLE_ORDERS,
  TABLE_PRODUCT_IMAGES,
  TABLE_PRODUCTS,
  hasAppwritePublicConfig,
} from "@/lib/appwrite/config";
import { createAdminClient, createPublicClient } from "@/lib/appwrite/server";
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

  const price = asNumber(row.price);

  return {
    $id,
    sellerId,
    categoryId,
    title,
    description,
    price,
    isFree: price === 0,
    status: statusRaw,
    stock: Math.max(0, Math.floor(asNumber(row.stock))),
    available: asBoolean(row.available, true),
    currency: asNullableString(row.currency) || "LKR",
    featured: asBoolean(row.featured, false),
  };
}

function isActiveProduct(product: Product): boolean {
  return product.status === ACTIVE_PRODUCT_STATUS;
}

function isPubliclyListed(product: Product): boolean {
  return isActiveProduct(product) && product.available;
}

/** Buy CTA / cart: active + available, even when stock > 0 is not enough. */
export function isProductPurchasable(
  product: Pick<Product, "status" | "available" | "stock">,
): boolean {
  return (
    product.status === ACTIVE_PRODUCT_STATUS &&
    product.available &&
    product.stock > 0
  );
}

/** Amount to subtract on payment confirm; never drives stock below 0. */
export function clampedStockDecrement(stock: number, quantity: number): number {
  const s = Math.max(0, Math.floor(stock));
  const q = Math.max(0, Math.floor(quantity));
  return Math.min(s, q);
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

/** Admin-curated featured listings (active + available). */
export async function listFeaturedProducts(opts?: {
  limit?: number;
}): Promise<Product[]> {
  if (!hasAppwritePublicConfig()) return [];

  const limit = Math.min(Math.max(opts?.limit ?? 8, 1), 24);

  try {
    const { tables } = await createPublicClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_PRODUCTS,
      queries: [
        Query.equal("status", ACTIVE_PRODUCT_STATUS),
        Query.equal("available", true),
        Query.equal("featured", true),
        Query.orderDesc("$createdAt"),
        Query.limit(limit),
      ],
    });

    return mapPublicProductRows(result.rows).filter((product) =>
      isProductPurchasable(product),
    );
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
 * Public product by id. Returns active rows even when `available=false`
 * so the detail page can hide the buy CTA. Draft/pending/rejected/archived stay hidden.
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
    if (!product || !isActiveProduct(product)) return null;
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

export type ProductCover = {
  fileId: string;
  alt: string | null;
};

export type ProductCoverMap = Record<string, ProductCover>;

const COVER_ID_CHUNK = 50;

/**
 * First image (lowest sortOrder) per product. One query per chunk — no N+1.
 */
export async function listCoverImagesByProductIds(
  productIds: string[],
): Promise<ProductCoverMap> {
  const ids = Array.from(
    new Set(productIds.map((id) => id.trim()).filter(Boolean)),
  );
  if (ids.length === 0 || !hasAppwritePublicConfig()) return {};

  const covers: ProductCoverMap = {};

  try {
    const { tables } = await createPublicClient();

    for (let i = 0; i < ids.length; i += COVER_ID_CHUNK) {
      const chunk = ids.slice(i, i + COVER_ID_CHUNK);
      const result = await tables.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLE_PRODUCT_IMAGES,
        queries: [
          Query.equal("productId", chunk),
          Query.orderAsc("sortOrder"),
          Query.limit(100),
        ],
      });

      for (const row of result.rows) {
        const image = asProductImage(row as unknown as Record<string, unknown>);
        if (!image || !chunk.includes(image.productId)) continue;
        const existing = covers[image.productId];
        if (!existing) {
          covers[image.productId] = { fileId: image.fileId, alt: image.alt };
        }
      }
    }
  } catch {
    return covers;
  }

  return covers;
}

/**
 * Top sellers from recent completed orders (admin read; no soldCount column).
 * Returns active + available + in-stock products only.
 */
export async function listTrendingProducts(opts?: {
  limit?: number;
}): Promise<Product[]> {
  if (!hasAppwritePublicConfig() || !process.env.APPWRITE_API_KEY?.trim()) {
    return [];
  }

  const limit = Math.min(Math.max(opts?.limit ?? 8, 1), 24);

  try {
    const { tables } = await createAdminClient();
    const ordersResult = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_ORDERS,
      queries: [
        Query.equal("status", "completed"),
        Query.orderDesc("$createdAt"),
        Query.limit(100),
      ],
    });

    const counts = new Map<string, number>();

    for (const orderRow of ordersResult.rows) {
      const orderId = asNullableString(
        (orderRow as Record<string, unknown>).$id,
      );
      if (!orderId) continue;

      const itemsResult = await tables.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLE_ORDER_ITEMS,
        queries: [Query.equal("orderId", orderId), Query.limit(50)],
      });

      for (const itemRow of itemsResult.rows) {
        const row = itemRow as Record<string, unknown>;
        const productId = asNullableString(row.productId);
        const quantity = Math.max(1, Math.floor(asNumber(row.quantity)));
        if (productId) {
          counts.set(productId, (counts.get(productId) ?? 0) + quantity);
        }
      }
    }

    if (counts.size === 0) return [];

    const ranked = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([productId]) => productId);

    const products: Product[] = [];
    for (const productId of ranked) {
      if (products.length >= limit) break;
      const product = await getProduct(productId);
      if (product && isProductPurchasable(product)) {
        products.push(product);
      }
    }

    return products;
  } catch {
    return [];
  }
}

/**
 * Hydrate active, publicly listed products by id (preserves caller order).
 * Drops inactive, unavailable, or missing ids.
 */
export async function listPublicProductsByIds(ids: string[]): Promise<Product[]> {
  const unique = [
    ...new Set(ids.map((id) => id.trim()).filter((id) => id.length > 0)),
  ].slice(0, 12);

  if (unique.length === 0 || !hasAppwritePublicConfig()) return [];

  const byId = new Map<string, Product>();
  for (const id of unique) {
    const product = await getProduct(id);
    if (product && isPubliclyListed(product)) {
      byId.set(id, product);
    }
  }

  return unique
    .map((id) => byId.get(id))
    .filter((product): product is Product => product != null);
}
