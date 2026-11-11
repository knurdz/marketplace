import { and, count, eq } from "drizzle-orm";
import { AppwriteException, ID, Query } from "@/lib/db/appwrite-shim";
import {
  DATABASE_ID,
  TABLE_CATEGORIES,
  TABLE_PRODUCTS,
  hasAppwritePublicConfig,
} from "@/lib/appwrite/config";
import {
  createAdminClient,
  createPublicClient,
  createSessionClient,
} from "@/lib/appwrite/server";
import { getDb, hasDatabaseConfig } from "@/lib/db/client";
import { products as productsTable } from "@/lib/db/schema";
import type { Category } from "@/lib/types";
import { writeAuditLog } from "./audit-logs";

const MAX_NAME_LENGTH = 128;
const MAX_SLUG_LENGTH = 128;
const MAX_LIST_LIMIT = 100;

export type CategoryTreeNode = Category & {
  children: CategoryTreeNode[];
};

export type CategoryMutationResult =
  | {
      ok: true;
      message: string;
      categoryId?: string;
      /** Prior custom image to delete after a successful replace/delete. */
      replacedImageFileId?: string | null;
    }
  | { ok: false; error: string };

function asNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return value.length > 0 ? value : null;
}

function adminSdkAvailable(): boolean {
  return (
    hasAppwritePublicConfig() &&
    Boolean(process.env.DATABASE_URL?.trim())
  );
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
    imageFileId: asNullableString(row.imageFileId),
  };
}

/** Deterministic slug from display name (lowercase, hyphenated). */
export function generateSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG_LENGTH);
}

function normalizeSlug(slug: string): string {
  return generateSlug(slug);
}

function parseName(name: string): string | CategoryMutationResult {
  const trimmed = name.trim();
  if (!trimmed) {
    return { ok: false, error: "Name is required." };
  }
  if (trimmed.length > MAX_NAME_LENGTH) {
    return {
      ok: false,
      error: `Name must be at most ${MAX_NAME_LENGTH} characters.`,
    };
  }
  return trimmed;
}

function parseSlug(
  slug: string | undefined,
  fallbackName: string,
): string | CategoryMutationResult {
  const raw = slug?.trim() ? normalizeSlug(slug) : generateSlug(fallbackName);
  if (!raw) {
    return { ok: false, error: "Slug is required." };
  }
  if (raw.length > MAX_SLUG_LENGTH) {
    return {
      ok: false,
      error: `Slug must be at most ${MAX_SLUG_LENGTH} characters.`,
    };
  }
  return raw;
}

/** Live listings per category: status=active and available=true. */
async function loadLiveProductCounts(): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (!hasDatabaseConfig()) return counts;

  try {
    const db = getDb();
    const rows = await db
      .select({
        categoryId: productsTable.categoryId,
        liveCount: count(),
      })
      .from(productsTable)
      .where(
        and(
          eq(productsTable.status, "active"),
          eq(productsTable.available, true),
        ),
      )
      .groupBy(productsTable.categoryId);

    for (const row of rows) {
      const id = row.categoryId?.trim();
      if (!id) continue;
      counts.set(id, Number(row.liveCount) || 0);
    }
  } catch {
    // Fall through with empty counts (name-only sort).
  }
  return counts;
}

function sortCategoriesByLiveCount(
  categories: Category[],
  liveCounts: Map<string, number>,
): Category[] {
  return [...categories].sort((a, b) => {
    const countDiff =
      (liveCounts.get(b.$id) ?? 0) - (liveCounts.get(a.$id) ?? 0);
    if (countDiff !== 0) return countDiff;
    return a.name.localeCompare(b.name);
  });
}

function isSlugConflict(error: unknown): boolean {
  if (!(error instanceof AppwriteException)) return false;
  const msg = (error.message ?? "").toLowerCase();
  return (
    error.code === 409 ||
    msg.includes("unique") ||
    msg.includes("duplicate") ||
    msg.includes("slug")
  );
}

async function loadCategoryById(
  categoryId: string,
  client: "session" | "public" = "session",
): Promise<Category | null> {
  const trimmed = categoryId?.trim();
  if (!trimmed || !hasAppwritePublicConfig()) return null;

  try {
    const tables =
      client === "session"
        ? (await createSessionClient()).tables
        : (await createPublicClient()).tables;
    const row = await tables.getRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_CATEGORIES,
      rowId: trimmed,
    });
    return asCategory(row as unknown as Record<string, unknown>);
  } catch {
    return null;
  }
}

async function slugExists(
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  const { tables } = await createSessionClient();
  const result = await tables.listRows({
    databaseId: DATABASE_ID,
    tableId: TABLE_CATEGORIES,
    queries: [Query.equal("slug", slug), Query.limit(1)],
  });
  const row = result.rows[0];
  if (!row) return false;
  if (excludeId && row.$id === excludeId) return false;
  return true;
}

async function wouldCreateCycle(
  categoryId: string,
  proposedParentId: string,
): Promise<boolean> {
  if (categoryId === proposedParentId) return true;

  let currentId: string | null = proposedParentId;
  const visited = new Set<string>();

  while (currentId) {
    if (currentId === categoryId) return true;
    if (visited.has(currentId)) return true;
    visited.add(currentId);

    const parent = await loadCategoryById(currentId);
    currentId = parent?.parentId ?? null;
  }

  return false;
}

function buildCategoryTree(
  flat: Category[],
  liveCounts: Map<string, number>,
): CategoryTreeNode[] {
  const byId = new Map<string, CategoryTreeNode>();
  for (const c of flat) {
    byId.set(c.$id, { ...c, children: [] });
  }

  const roots: CategoryTreeNode[] = [];
  for (const node of byId.values()) {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortNodes = (nodes: CategoryTreeNode[]) => {
    nodes.sort((a, b) => {
      const countDiff =
        (liveCounts.get(b.$id) ?? 0) - (liveCounts.get(a.$id) ?? 0);
      if (countDiff !== 0) return countDiff;
      return a.name.localeCompare(b.name);
    });
    for (const n of nodes) sortNodes(n.children);
  };
  sortNodes(roots);
  return roots;
}

/**
 * List categories for storefront browse (table has read(any)).
 * Ordered by live product count descending, then name.
 */
export async function listCategories(opts?: {
  limit?: number;
}): Promise<Category[]> {
  if (!hasAppwritePublicConfig()) return [];

  const limit = Math.min(Math.max(opts?.limit ?? 50, 1), MAX_LIST_LIMIT);

  try {
    const { tables } = await createPublicClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_CATEGORIES,
      queries: [Query.orderAsc("name"), Query.limit(MAX_LIST_LIMIT)],
    });

    const categories: Category[] = [];
    for (const row of result.rows) {
      const category = asCategory(row as unknown as Record<string, unknown>);
      if (category) categories.push(category);
    }

    const liveCounts = await loadLiveProductCounts();
    return sortCategoriesByLiveCount(categories, liveCounts).slice(0, limit);
  } catch {
    return [];
  }
}

/**
 * Categories that currently have at least one publicly listed product
 * (`status=active` and `available=true`). Used for home category circles.
 * Ordered by live product count descending, then name.
 */
export async function listCategoriesWithActiveProducts(opts?: {
  limit?: number;
}): Promise<Category[]> {
  if (!hasAppwritePublicConfig() || !hasDatabaseConfig()) return [];

  const limit = Math.min(Math.max(opts?.limit ?? 50, 1), MAX_LIST_LIMIT);

  try {
    const liveCounts = await loadLiveProductCounts();
    if (liveCounts.size === 0) return [];

    const { tables } = await createPublicClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_CATEGORIES,
      queries: [Query.orderAsc("name"), Query.limit(MAX_LIST_LIMIT)],
    });

    const categories: Category[] = [];
    for (const row of result.rows) {
      const category = asCategory(row as unknown as Record<string, unknown>);
      if (category && (liveCounts.get(category.$id) ?? 0) > 0) {
        categories.push(category);
      }
    }
    return sortCategoriesByLiveCount(categories, liveCounts).slice(0, limit);
  } catch {
    return [];
  }
}

/** Nested category tree; siblings ranked by live product count. */
export async function listCategoryTree(): Promise<CategoryTreeNode[]> {
  const [flat, liveCounts] = await Promise.all([
    listCategories({ limit: MAX_LIST_LIMIT }),
    loadLiveProductCounts(),
  ]);
  return buildCategoryTree(flat, liveCounts);
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

export async function createCategoryCore(
  actorId: string,
  input: {
    name: string;
    slug?: string;
    parentId?: string | null;
    imageFileId?: string | null;
  },
): Promise<CategoryMutationResult> {
  const parsedName = parseName(input.name);
  if (typeof parsedName !== "string") return parsedName;

  const parsedSlug = parseSlug(input.slug, parsedName);
  if (typeof parsedSlug !== "string") return parsedSlug;

  const parentId = input.parentId?.trim() || null;
  if (parentId) {
    const parent = await loadCategoryById(parentId);
    if (!parent) {
      return { ok: false, error: "Parent category not found." };
    }
  }

  const imageFileId = input.imageFileId?.trim() || null;

  try {
    if (await slugExists(parsedSlug)) {
      return { ok: false, error: "Slug already exists." };
    }
  } catch {
    return { ok: false, error: "Failed to validate slug." };
  }

  const { tables } = await createSessionClient();
  let rowId: string;
  try {
    const row = await tables.createRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_CATEGORIES,
      rowId: ID.unique(),
      data: {
        name: parsedName,
        slug: parsedSlug,
        ...(parentId ? { parentId } : {}),
        ...(imageFileId ? { imageFileId } : {}),
      },
    });
    rowId = String(row.$id);
  } catch (error) {
    if (isSlugConflict(error)) {
      return { ok: false, error: "Slug already exists." };
    }
    return { ok: false, error: "Failed to create category." };
  }

  try {
    await writeAuditLog({
      actorId,
      event: "category.created",
      resourceType: "category",
      resourceId: rowId,
      meta: { name: parsedName, slug: parsedSlug },
    });
  } catch {
    return {
      ok: false,
      error: "Category created but audit log failed. Please notify an operator.",
    };
  }

  return {
    ok: true,
    message: `Category "${parsedName}" created.`,
    categoryId: rowId,
  };
}

export async function updateCategoryCore(
  actorId: string,
  categoryId: string,
  patch: {
    name?: string;
    slug?: string;
    parentId?: string | null;
    imageFileId?: string | null;
  },
): Promise<CategoryMutationResult> {
  const trimmedId = categoryId?.trim();
  if (!trimmedId) {
    return { ok: false, error: "Missing category." };
  }

  const existing = await loadCategoryById(trimmedId);
  if (!existing) {
    return { ok: false, error: "Category not found." };
  }

  const data: Record<string, unknown> = {};
  const changedFields: Record<string, string> = {};
  let replacedImageFileId: string | null = null;

  if (patch.name !== undefined) {
    const parsedName = parseName(patch.name);
    if (typeof parsedName !== "string") return parsedName;
    if (parsedName !== existing.name) {
      data.name = parsedName;
      changedFields.name = parsedName;
    }
  }

  if (patch.slug !== undefined) {
    const nameForFallback = (data.name as string) ?? existing.name;
    const parsedSlug = parseSlug(patch.slug, nameForFallback);
    if (typeof parsedSlug !== "string") return parsedSlug;
    if (parsedSlug !== existing.slug) {
      try {
        if (await slugExists(parsedSlug, trimmedId)) {
          return { ok: false, error: "Slug already exists." };
        }
      } catch {
        return { ok: false, error: "Failed to validate slug." };
      }
      data.slug = parsedSlug;
      changedFields.slug = parsedSlug;
    }
  }

  if (patch.parentId !== undefined) {
    const parentId = patch.parentId?.trim() || null;
    if (parentId !== existing.parentId) {
      if (parentId) {
        const parent = await loadCategoryById(parentId);
        if (!parent) {
          return { ok: false, error: "Parent category not found." };
        }
        if (await wouldCreateCycle(trimmedId, parentId)) {
          return {
            ok: false,
            error: "A category cannot be its own parent or ancestor.",
          };
        }
      }
      data.parentId = parentId;
      changedFields.parentId = parentId ?? "";
    }
  }

  if (patch.imageFileId !== undefined) {
    const imageFileId = patch.imageFileId?.trim() || null;
    if (imageFileId !== existing.imageFileId) {
      data.imageFileId = imageFileId;
      changedFields.imageFileId = imageFileId ?? "";
      replacedImageFileId = existing.imageFileId;
    }
  }

  if (Object.keys(data).length === 0) {
    return { ok: true, message: "No changes to save.", categoryId: trimmedId };
  }

  const { tables } = await createSessionClient();
  try {
    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_CATEGORIES,
      rowId: trimmedId,
      data,
    });
  } catch (error) {
    if (isSlugConflict(error)) {
      return { ok: false, error: "Slug already exists." };
    }
    return { ok: false, error: "Failed to update category." };
  }

  try {
    await writeAuditLog({
      actorId,
      event: "category.updated",
      resourceType: "category",
      resourceId: trimmedId,
      meta: changedFields,
    });
  } catch {
    return {
      ok: false,
      error: "Category updated but audit log failed. Please notify an operator.",
    };
  }

  const displayName = (data.name as string) ?? existing.name;
  return {
    ok: true,
    message: `Category "${displayName}" updated.`,
    categoryId: trimmedId,
    replacedImageFileId,
  };
}

export async function deleteCategoryCore(
  actorId: string,
  categoryId: string,
): Promise<CategoryMutationResult> {
  const trimmedId = categoryId?.trim();
  if (!trimmedId) {
    return { ok: false, error: "Missing category." };
  }

  const existing = await loadCategoryById(trimmedId);
  if (!existing) {
    return { ok: false, error: "Category not found." };
  }

  if (!adminSdkAvailable()) {
    return { ok: false, error: "Admin configuration unavailable." };
  }

  try {
    const { tables } = await createAdminClient();

    const children = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_CATEGORIES,
      queries: [Query.equal("parentId", trimmedId), Query.limit(1)],
      total: true,
    });
    const childCount = children.total ?? 0;
    if (childCount > 0) {
      return {
        ok: false,
        error: `Cannot delete: ${childCount} child categor${childCount === 1 ? "y" : "ies"} reference this category. Reassign or delete children first.`,
      };
    }

    const products = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_PRODUCTS,
      queries: [Query.equal("categoryId", trimmedId), Query.limit(1)],
      total: true,
    });
    const productCount = products.total ?? 0;
    if (productCount > 0) {
      return {
        ok: false,
        error: `Cannot delete: ${productCount} product${productCount === 1 ? "" : "s"} reference this category.`,
      };
    }
  } catch {
    return { ok: false, error: "Failed to check category references." };
  }

  const { tables } = await createSessionClient();
  try {
    await tables.deleteRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_CATEGORIES,
      rowId: trimmedId,
    });
  } catch {
    return { ok: false, error: "Failed to delete category." };
  }

  try {
    await writeAuditLog({
      actorId,
      event: "category.deleted",
      resourceType: "category",
      resourceId: trimmedId,
      meta: { name: existing.name, slug: existing.slug },
    });
  } catch {
    return {
      ok: false,
      error: "Category deleted but audit log failed. Please notify an operator.",
    };
  }

  return {
    ok: true,
    message: `Category "${existing.name}" deleted.`,
    categoryId: trimmedId,
    replacedImageFileId: existing.imageFileId,
  };
}
