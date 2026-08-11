import { AppwriteException, Query } from "node-appwrite";
import {
  DATABASE_ID,
  TABLE_CATEGORIES,
  hasAppwritePublicConfig,
} from "@/lib/appwrite/config";
import { createPublicClient } from "@/lib/appwrite/server";
import type { Category } from "@/lib/types";

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

/** Map a TablesDB row to Category; returns null if required fields are missing. */
export function asCategory(row: Record<string, unknown>): Category | null {
  const $id = asNullableString(row.$id);
  const name = asNullableString(row.name);
  const slug = asNullableString(row.slug);
  if (!$id || !name || !slug) return null;

  return {
    $id,
    name,
    slug,
    parentId: asNullableString(row.parentId),
    sortOrder: Math.floor(asNumber(row.sortOrder)),
  };
}

/**
 * List categories for storefront browse (table has read(any)).
 * Ordered by sortOrder ascending, then name.
 */
export async function listCategories(opts?: {
  limit?: number;
}): Promise<Category[]> {
  if (!hasAppwritePublicConfig()) return [];

  const limit = Math.min(Math.max(opts?.limit ?? 50, 1), 100);

  try {
    const { tables } = await createPublicClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_CATEGORIES,
      queries: [
        Query.orderAsc("sortOrder"),
        Query.orderAsc("name"),
        Query.limit(limit),
      ],
    });

    const categories: Category[] = [];
    for (const row of result.rows) {
      const category = asCategory(row as unknown as Record<string, unknown>);
      if (category) categories.push(category);
    }
    return categories;
  } catch {
    return [];
  }
}

/** Public category by unique slug. Returns null if missing. */
export async function getCategoryBySlug(
  slug: string,
): Promise<Category | null> {
  const trimmed = slug?.trim();
  if (!trimmed || !hasAppwritePublicConfig()) return null;

  try {
    const { tables } = await createPublicClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_CATEGORIES,
      queries: [Query.equal("slug", trimmed), Query.limit(1)],
    });
    const row = result.rows[0];
    if (!row) return null;
    return asCategory(row as unknown as Record<string, unknown>);
  } catch (error) {
    if (error instanceof AppwriteException && error.code === 404) {
      return null;
    }
    return null;
  }
}
