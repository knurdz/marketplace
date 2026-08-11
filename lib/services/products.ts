import { AppwriteException, Query } from "node-appwrite";
import {
  DATABASE_ID,
  TABLE_PRODUCTS,
  hasAppwritePublicConfig,
} from "@/lib/appwrite/config";
import { createPublicClient } from "@/lib/appwrite/server";
import type { Product } from "@/lib/types";
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

/**
 * List storefront products: `status=active` and `available=true` only.
 * Uses public TablesDB client (table has read(any)); never returns inactive.
 */
export async function listActiveProducts(opts?: {
  limit?: number;
}): Promise<Product[]> {
  if (!hasAppwritePublicConfig()) return [];

  const limit = Math.min(Math.max(opts?.limit ?? 24, 1), 100);

  try {
    const { tables } = await createPublicClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_PRODUCTS,
      queries: [
        Query.equal("status", ACTIVE_PRODUCT_STATUS),
        Query.equal("available", true),
        Query.orderDesc("$createdAt"),
        Query.limit(limit),
      ],
    });

    const products: Product[] = [];
    for (const row of result.rows) {
      const product = asProduct(row as unknown as Record<string, unknown>);
      if (product && isPubliclyListed(product)) {
        products.push(product);
      }
    }
    return products;
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
  opts?: { limit?: number },
): Promise<Product[]> {
  const normalized = normalizeProductSearchQuery(query);
  if (!normalized || !hasAppwritePublicConfig()) return [];

  const limit = Math.min(Math.max(opts?.limit ?? 24, 1), 48);

  try {
    const { tables } = await createPublicClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_PRODUCTS,
      queries: [
        Query.search("title", normalized),
        Query.equal("status", ACTIVE_PRODUCT_STATUS),
        Query.equal("available", true),
        Query.limit(limit),
      ],
    });

    const products: Product[] = [];
    for (const row of result.rows) {
      const product = asProduct(row as unknown as Record<string, unknown>);
      if (product && isPubliclyListed(product)) {
        products.push(product);
      }
    }
    return products;
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
