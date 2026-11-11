import { and, asc, desc, eq, gte, lte, or, sql, type SQL } from "drizzle-orm";
import { AppwriteException, Query } from "@/lib/db/appwrite-shim";
import {
  DATABASE_ID,
  TABLE_PRODUCT_IMAGES,
  TABLE_PRODUCTS,
  TABLE_PURCHASE_REQUESTS,
  hasAppwritePublicConfig,
} from "@/lib/appwrite/config";
import { createAdminClient, createPublicClient } from "@/lib/appwrite/server";
import { getDb, hasDatabaseConfig } from "@/lib/db/client";
import {
  categories as categoriesTable,
  products as productsTable,
  sellerProfiles as sellerProfilesTable,
} from "@/lib/db/schema";
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

/** Buy CTA: active + available + in stock. */
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
 * Split a normalized query into searchable tokens (length ≥ 2).
 * One-character tokens are dropped when any longer token exists;
 * an all-one-character query yields [].
 */
export function tokenizeProductSearchQuery(normalized: string): string[] {
  const parts = normalized.split(" ").filter((part) => part.length > 0);
  return parts.filter((part) => part.length >= 2);
}

/** Escape `%`, `_`, and `\` so LIKE treats them as literals (ESCAPE '\\'). */
export function escapeLikeWildcards(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

function likePatternForToken(token: string): string {
  return `%${escapeLikeWildcards(token.toLowerCase())}%`;
}

/** One token must hit title, description, category name, or approved shop name. */
function tokenMatchSql(token: string): SQL {
  const pattern = likePatternForToken(token);
  return or(
    sql`LOWER(${productsTable.title}) LIKE ${pattern} ESCAPE ${"\\"}`,
    sql`LOWER(${productsTable.description}) LIKE ${pattern} ESCAPE ${"\\"}`,
    sql`LOWER(${categoriesTable.name}) LIKE ${pattern} ESCAPE ${"\\"}`,
    sql`LOWER(${sellerProfilesTable.shopName}) LIKE ${pattern} ESCAPE ${"\\"}`,
  )!;
}

/**
 * Higher title hits rank above category/shop, which rank above description.
 * Summed across tokens for multi-word queries.
 */
export function productSearchRelevanceSql(tokens: string[]): SQL {
  const parts = tokens.map((token) => {
    const pattern = likePatternForToken(token);
    return sql`(
      CASE WHEN LOWER(${productsTable.title}) LIKE ${pattern} ESCAPE ${"\\"} THEN 100 ELSE 0 END
      + CASE WHEN LOWER(${categoriesTable.name}) LIKE ${pattern} ESCAPE ${"\\"}
          OR LOWER(${sellerProfilesTable.shopName}) LIKE ${pattern} ESCAPE ${"\\"}
        THEN 10 ELSE 0 END
      + CASE WHEN LOWER(${productsTable.description}) LIKE ${pattern} ESCAPE ${"\\"} THEN 1 ELSE 0 END
    )`;
  });
  return sql`(${sql.join(parts, sql` + `)})`;
}

export type SearchActiveProductsResult =
  | { ok: true; products: Product[] }
  | {
      ok: false;
      reason: "empty" | "too_short" | "invalid_range" | "unavailable" | "failed";
    };

/**
 * Token search across title, description, category name, and approved shop name.
 * Empty/whitespace → empty; only 1-char tokens → too_short (never dumps the catalog).
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
): Promise<SearchActiveProductsResult> {
  const normalized = normalizeProductSearchQuery(query);
  if (!normalized) {
    return { ok: false, reason: "empty" };
  }
  if (opts?.invalidPriceRange) {
    return { ok: false, reason: "invalid_range" };
  }
  if (!hasDatabaseConfig() && !hasAppwritePublicConfig()) {
    return { ok: false, reason: "unavailable" };
  }

  const tokens = tokenizeProductSearchQuery(normalized);
  if (tokens.length === 0) {
    return { ok: false, reason: "too_short" };
  }

  const limit = Math.min(Math.max(opts?.limit ?? 24, 1), 48);
  const sort = opts?.sort ?? "newest";

  try {
    const db = getDb();
    const tokenConditions = tokens.map((token) => tokenMatchSql(token));
    const filters: SQL[] = [
      eq(productsTable.status, ACTIVE_PRODUCT_STATUS),
      eq(productsTable.available, true),
      ...tokenConditions,
    ];
    if (opts?.minPrice != null) {
      filters.push(gte(productsTable.price, String(opts.minPrice)));
    }
    if (opts?.maxPrice != null) {
      filters.push(lte(productsTable.price, String(opts.maxPrice)));
    }

    const relevance = productSearchRelevanceSql(tokens);
    const orderBy =
      sort === "price_asc"
        ? [asc(productsTable.price), desc(productsTable.createdAt)]
        : sort === "price_desc"
          ? [desc(productsTable.price), desc(productsTable.createdAt)]
          : [desc(relevance), desc(productsTable.createdAt)];

    const rows = await db
      .select({
        id: productsTable.id,
        sellerId: productsTable.sellerId,
        categoryId: productsTable.categoryId,
        title: productsTable.title,
        description: productsTable.description,
        price: productsTable.price,
        isFree: productsTable.isFree,
        status: productsTable.status,
        stock: productsTable.stock,
        available: productsTable.available,
        currency: productsTable.currency,
        featured: productsTable.featured,
      })
      .from(productsTable)
      .leftJoin(
        categoriesTable,
        eq(productsTable.categoryId, categoriesTable.id),
      )
      .leftJoin(
        sellerProfilesTable,
        and(
          eq(productsTable.sellerId, sellerProfilesTable.userId),
          eq(sellerProfilesTable.status, "approved"),
        ),
      )
      .where(and(...filters))
      .orderBy(...orderBy)
      .limit(limit);

    const products: Product[] = [];
    for (const row of rows) {
      const product = asProduct({
        $id: row.id,
        sellerId: row.sellerId,
        categoryId: row.categoryId,
        title: row.title,
        description: row.description,
        price: row.price,
        isFree: row.isFree,
        status: row.status,
        stock: row.stock,
        available: row.available,
        currency: row.currency,
        featured: row.featured,
      });
      if (product && isPubliclyListed(product)) {
        products.push(product);
      }
    }
    return { ok: true, products };
  } catch {
    return { ok: false, reason: "failed" };
  }
}

const SEARCH_SUGGESTION_PRODUCT_LIMIT = 400;

export type SearchSuggestionIndex = {
  products: { id: string; title: string }[];
  categories: string[];
  shops: string[];
};

/**
 * Compact public catalog index for client-side typeahead.
 * Newest active+available products (capped), plus distinct category and approved shop names.
 * No LIKE — one indexed read for CDN caching.
 */
export async function getSearchSuggestionIndex(): Promise<SearchSuggestionIndex> {
  const empty: SearchSuggestionIndex = {
    products: [],
    categories: [],
    shops: [],
  };
  if (!hasDatabaseConfig()) return empty;

  try {
    const db = getDb();
    const rows = await db
      .select({
        id: productsTable.id,
        title: productsTable.title,
        categoryName: categoriesTable.name,
        shopName: sellerProfilesTable.shopName,
      })
      .from(productsTable)
      .leftJoin(
        categoriesTable,
        eq(productsTable.categoryId, categoriesTable.id),
      )
      .leftJoin(
        sellerProfilesTable,
        and(
          eq(productsTable.sellerId, sellerProfilesTable.userId),
          eq(sellerProfilesTable.status, "approved"),
        ),
      )
      .where(
        and(
          eq(productsTable.status, ACTIVE_PRODUCT_STATUS),
          eq(productsTable.available, true),
        ),
      )
      .orderBy(desc(productsTable.createdAt))
      .limit(SEARCH_SUGGESTION_PRODUCT_LIMIT);

    const products: { id: string; title: string }[] = [];
    const categorySet = new Set<string>();
    const shopSet = new Set<string>();

    for (const row of rows) {
      const id = row.id?.trim();
      const title = row.title?.trim();
      if (id && title) {
        products.push({ id, title });
      }
      const categoryName = row.categoryName?.trim();
      if (categoryName) categorySet.add(categoryName);
      const shopName = row.shopName?.trim();
      if (shopName) shopSet.add(shopName);
    }

    return {
      products,
      categories: [...categorySet].sort((a, b) => a.localeCompare(b)),
      shops: [...shopSet].sort((a, b) => a.localeCompare(b)),
    };
  } catch {
    return empty;
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
 * First image (lowest sortOrder) per product. One query per chunk: no N+1.
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
 * Top sellers from recent sold purchase requests (admin read; no soldCount column).
 * Returns active + available + in-stock products only.
 */
export async function listTrendingProducts(opts?: {
  limit?: number;
}): Promise<Product[]> {
  if (!hasAppwritePublicConfig() || !process.env.DATABASE_URL?.trim()) {
    return [];
  }

  const limit = Math.min(Math.max(opts?.limit ?? 8, 1), 24);

  try {
    const { tables } = await createAdminClient();
    const requestsResult = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_PURCHASE_REQUESTS,
      queries: [
        Query.equal("status", "sold"),
        Query.orderDesc("$createdAt"),
        Query.limit(100),
      ],
    });

    const counts = new Map<string, number>();

    for (const requestRow of requestsResult.rows) {
      const row = requestRow as Record<string, unknown>;
      const productId = asNullableString(row.productId);
      const quantity = Math.max(1, Math.floor(asNumber(row.quantity)));
      if (productId) {
        counts.set(productId, (counts.get(productId) ?? 0) + quantity);
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
