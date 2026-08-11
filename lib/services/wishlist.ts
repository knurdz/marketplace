import { ID, Permission, Query, Role } from "node-appwrite";
import {
  DATABASE_ID,
  TABLE_WISHLIST_ITEMS,
  hasAppwritePublicConfig,
} from "@/lib/appwrite/config";
import { createSessionClient } from "@/lib/appwrite/server";
import { getLoggedInUser } from "@/lib/appwrite/session";
import {
  assertRateLimit,
  getClientIp,
  RATE_LIMIT_MESSAGE,
  RATE_LIMITS,
} from "@/lib/security/rate-limit";
import type {
  Product,
  WishlistItem,
  WishlistLine,
  WishlistLineIssue,
  WishlistView,
} from "@/lib/types";
import { ACTIVE_PRODUCT_STATUS } from "@/lib/types";
import { getProduct } from "./products";
import {
  WISHLIST_ERROR_CODES,
  type WishlistActionState,
  type WishlistErrorCode,
} from "./wishlist-errors";

export {
  WISHLIST_ERROR_CODES,
  type WishlistActionState,
  type WishlistErrorCode,
} from "./wishlist-errors";

function asNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return value.length > 0 ? value : null;
}

/** Map a TablesDB row to WishlistItem; returns null if required fields invalid. */
export function asWishlistItem(
  row: Record<string, unknown>,
): WishlistItem | null {
  const $id = asNullableString(row.$id);
  const userId = asNullableString(row.userId);
  const productId = asNullableString(row.productId);
  if (!$id || !userId || !productId) return null;
  return { $id, userId, productId };
}

function wishlistItemPermissions(userId: string): string[] {
  return [
    Permission.read(Role.user(userId)),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId)),
    Permission.read(Role.label("admin")),
    Permission.update(Role.label("admin")),
    Permission.delete(Role.label("admin")),
  ];
}

function resolveWishlistLineIssue(product: Product | null): WishlistLineIssue {
  if (!product) return "missing";
  if (product.status !== ACTIVE_PRODUCT_STATUS) return "inactive";
  if (!product.available) return "unavailable";
  return "ok";
}

function buildWishlistLine(item: WishlistItem, product: Product | null): WishlistLine {
  return {
    item,
    product,
    issue: resolveWishlistLineIssue(product),
  };
}

async function assertWishlistMutationRateLimit(userId: string): Promise<void> {
  const ip = await getClientIp();
  const result = assertRateLimit({
    bucket: "wishlist",
    key: `${userId}:${ip}`,
    ...RATE_LIMITS.wishlist,
  });
  if (!result.ok) {
    const err = new Error(RATE_LIMIT_MESSAGE);
    (err as Error & { code: WishlistErrorCode }).code =
      WISHLIST_ERROR_CODES.RATE_LIMITED;
    throw err;
  }
}

async function requireUser() {
  const user = await getLoggedInUser();
  if (!user) {
    const err = new Error("You must be signed in.");
    (err as Error & { code: WishlistErrorCode }).code =
      WISHLIST_ERROR_CODES.NOT_AUTHENTICATED;
    throw err;
  }
  return user;
}

function notConfiguredState(): WishlistActionState {
  return {
    error: "Wishlist is not available right now.",
    errorCode: WISHLIST_ERROR_CODES.NOT_CONFIGURED,
  };
}

function mapWishlistError(err: unknown): WishlistActionState {
  const code = (err as Error & { code?: WishlistErrorCode }).code;
  if (code === WISHLIST_ERROR_CODES.NOT_AUTHENTICATED) {
    return {
      error: "Sign in to manage your wishlist.",
      errorCode: code,
    };
  }
  if (code === WISHLIST_ERROR_CODES.RATE_LIMITED) {
    return {
      error: RATE_LIMIT_MESSAGE,
      errorCode: code,
    };
  }
  return {
    error: "Could not update your wishlist.",
    errorCode: WISHLIST_ERROR_CODES.NOT_ALLOWED,
  };
}

/** Newest-first list for the signed-in user only. */
export async function listOwnWishlistItems(opts?: {
  limit?: number;
}): Promise<WishlistItem[]> {
  if (!hasAppwritePublicConfig()) return [];

  const user = await getLoggedInUser();
  if (!user) return [];

  const limit = Math.min(Math.max(opts?.limit ?? 50, 1), 50);

  try {
    const { tables } = await createSessionClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_WISHLIST_ITEMS,
      queries: [
        Query.equal("userId", user.$id),
        Query.orderDesc("$createdAt"),
        Query.limit(limit),
      ],
    });

    const out: WishlistItem[] = [];
    for (const row of result.rows) {
      const item = asWishlistItem(row as unknown as Record<string, unknown>);
      if (item && item.userId === user.$id) {
        out.push(item);
      }
    }
    return out;
  } catch {
    return [];
  }
}

/** Whether the signed-in user has saved this product. */
export async function isProductInOwnWishlist(productId: string): Promise<boolean> {
  if (!hasAppwritePublicConfig()) return false;

  const user = await getLoggedInUser();
  if (!user) return false;

  const trimmed = productId?.trim();
  if (!trimmed) return false;

  try {
    const { tables } = await createSessionClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_WISHLIST_ITEMS,
      queries: [
        Query.equal("userId", user.$id),
        Query.equal("productId", trimmed),
        Query.limit(1),
      ],
    });

    if (result.rows.length === 0) return false;
    const item = asWishlistItem(
      result.rows[0] as unknown as Record<string, unknown>,
    );
    return Boolean(item && item.userId === user.$id && item.productId === trimmed);
  } catch {
    return false;
  }
}

/** Wishlist with live product joins for UI. */
export async function getOwnWishlistView(opts?: {
  limit?: number;
}): Promise<WishlistView> {
  const items = await listOwnWishlistItems(opts);
  if (items.length === 0) {
    return { lines: [], itemCount: 0 };
  }

  const productIds = [...new Set(items.map((item) => item.productId))];
  const products = await Promise.all(productIds.map((id) => getProduct(id)));
  const productById = new Map<string, Product>();
  for (let i = 0; i < productIds.length; i++) {
    const product = products[i];
    if (product) productById.set(productIds[i], product);
  }

  const lines = items.map((item) =>
    buildWishlistLine(item, productById.get(item.productId) ?? null),
  );

  return { lines, itemCount: lines.length };
}

/** Save an active product to the signed-in user's wishlist. */
export async function addToOwnWishlist(
  productId: string,
): Promise<WishlistActionState> {
  if (!hasAppwritePublicConfig()) return notConfiguredState();

  try {
    const user = await requireUser();
    await assertWishlistMutationRateLimit(user.$id);

    const trimmed = productId?.trim();
    if (!trimmed) {
      return {
        error: "Product id is required.",
        errorCode: WISHLIST_ERROR_CODES.PRODUCT_UNAVAILABLE,
      };
    }

    const product = await getProduct(trimmed);
    if (!product || product.status !== ACTIVE_PRODUCT_STATUS) {
      return {
        error: "This product cannot be saved right now.",
        errorCode: WISHLIST_ERROR_CODES.PRODUCT_UNAVAILABLE,
      };
    }

    if (await isProductInOwnWishlist(trimmed)) {
      return { success: "Already in your wishlist.", saved: true };
    }

    const { tables } = await createSessionClient();
    const row = await tables.createRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_WISHLIST_ITEMS,
      rowId: ID.unique(),
      data: {
        userId: user.$id,
        productId: trimmed,
      },
      permissions: wishlistItemPermissions(user.$id),
    });

    const created = asWishlistItem(row as unknown as Record<string, unknown>);
    if (!created || created.userId !== user.$id) {
      return {
        error: "Could not save to wishlist.",
        errorCode: WISHLIST_ERROR_CODES.NOT_ALLOWED,
      };
    }

    return { success: "Saved to your wishlist.", saved: true };
  } catch (err) {
    return mapWishlistError(err);
  }
}

/** Remove a saved product from the signed-in user's wishlist. */
export async function removeFromOwnWishlist(
  productId: string,
): Promise<WishlistActionState> {
  if (!hasAppwritePublicConfig()) return notConfiguredState();

  try {
    const user = await requireUser();
    await assertWishlistMutationRateLimit(user.$id);

    const trimmed = productId?.trim();
    if (!trimmed) {
      return {
        error: "Product id is required.",
        errorCode: WISHLIST_ERROR_CODES.NOT_FOUND,
      };
    }

    const { tables } = await createSessionClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_WISHLIST_ITEMS,
      queries: [
        Query.equal("userId", user.$id),
        Query.equal("productId", trimmed),
        Query.limit(1),
      ],
    });

    if (result.rows.length === 0) {
      return {
        error: "Item is not in your wishlist.",
        errorCode: WISHLIST_ERROR_CODES.NOT_FOUND,
      };
    }

    const item = asWishlistItem(
      result.rows[0] as unknown as Record<string, unknown>,
    );
    if (!item || item.userId !== user.$id || item.productId !== trimmed) {
      return {
        error: "Not allowed to remove this wishlist item.",
        errorCode: WISHLIST_ERROR_CODES.NOT_ALLOWED,
      };
    }

    await tables.deleteRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_WISHLIST_ITEMS,
      rowId: item.$id,
    });

    return { success: "Removed from your wishlist.", saved: false };
  } catch (err) {
    return mapWishlistError(err);
  }
}

/** Toggle save state for a product on the signed-in user's wishlist. */
export async function toggleOwnWishlistProduct(
  productId: string,
): Promise<WishlistActionState> {
  const saved = await isProductInOwnWishlist(productId);
  if (saved) {
    return removeFromOwnWishlist(productId);
  }
  return addToOwnWishlist(productId);
}
