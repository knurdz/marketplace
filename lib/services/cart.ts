import { ID, Permission, Query, Role } from "node-appwrite";
import {
  DATABASE_ID,
  TABLE_CART_ITEMS,
  TABLE_CARTS,
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
  Cart,
  CartItem,
  CartLine,
  CartLineIssue,
  CartView,
  Product,
} from "@/lib/types";
import { ACTIVE_PRODUCT_STATUS } from "@/lib/types";
import { getProduct, isProductPurchasable } from "./products";
import {
  CART_ERROR_CODES,
  type CartActionState,
  type CartErrorCode,
} from "./cart-errors";

export { CART_ERROR_CODES, type CartActionState, type CartErrorCode } from "./cart-errors";

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

/** Map a TablesDB row to Cart; returns null if required fields invalid. */
export function asCart(row: Record<string, unknown>): Cart | null {
  const $id = asNullableString(row.$id);
  const userId = asNullableString(row.userId);
  if (!$id || !userId) return null;

  const sellerIdRaw = row.sellerId;
  const sellerId =
    typeof sellerIdRaw === "string" && sellerIdRaw.length > 0
      ? sellerIdRaw
      : null;

  return { $id, userId, sellerId };
}

/** Map a TablesDB row to CartItem; returns null if required fields invalid. */
export function asCartItem(row: Record<string, unknown>): CartItem | null {
  const $id = asNullableString(row.$id);
  const cartId = asNullableString(row.cartId);
  const productId = asNullableString(row.productId);
  if (!$id || !cartId || !productId) return null;

  const quantity = Math.floor(asNumber(row.quantity));
  const unitPrice = asNumber(row.unitPrice);
  if (quantity < 1 || unitPrice < 0) return null;

  return { $id, cartId, productId, quantity, unitPrice };
}

function cartPermissions(userId: string): string[] {
  // Session users cannot grant label:admin on create (Appwrite rejects it).
  return [
    Permission.read(Role.user(userId)),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId)),
  ];
}

function parseQuantity(raw: unknown): number | null {
  const n =
    typeof raw === "number"
      ? raw
      : typeof raw === "string"
        ? Number(raw.trim())
        : NaN;
  if (!Number.isFinite(n)) return null;
  const qty = Math.floor(n);
  if (qty < 1) return null;
  return qty;
}

function resolveLineIssue(
  product: Product | null,
  quantity: number,
): CartLineIssue {
  if (!product) return "missing";
  if (product.status !== ACTIVE_PRODUCT_STATUS) return "inactive";
  if (!product.available) return "unavailable";
  if (product.stock <= 0 || quantity > product.stock) return "out_of_stock";
  return "ok";
}

function buildCartLine(item: CartItem, product: Product | null): CartLine {
  const issue = resolveLineIssue(product, item.quantity);
  const productCurrency = product?.currency ?? "LKR";
  return {
    item,
    productTitle: product?.title ?? null,
    productStock: product?.stock ?? 0,
    productAvailable: product?.available ?? false,
    productCurrency,
    lineTotal: item.unitPrice * item.quantity,
    issue,
    purchasable: issue === "ok",
  };
}

async function assertCartMutationRateLimit(userId: string): Promise<void> {
  const ip = await getClientIp();
  const result = assertRateLimit({
    bucket: "cart",
    key: `${userId}:${ip}`,
    ...RATE_LIMITS.cart,
  });
  if (!result.ok) {
    const err = new Error(RATE_LIMIT_MESSAGE);
    (err as Error & { code: CartErrorCode }).code =
      CART_ERROR_CODES.RATE_LIMITED;
    throw err;
  }
}

async function requireUser() {
  const user = await getLoggedInUser();
  if (!user) {
    const err = new Error("You must be signed in.");
    (err as Error & { code: CartErrorCode }).code =
      CART_ERROR_CODES.NOT_AUTHENTICATED;
    throw err;
  }
  return user;
}

async function listCartItemsForCart(cartId: string): Promise<CartItem[]> {
  const { tables } = await createSessionClient();
  const result = await tables.listRows({
    databaseId: DATABASE_ID,
    tableId: TABLE_CART_ITEMS,
    queries: [Query.equal("cartId", cartId), Query.limit(100)],
  });

  const items: CartItem[] = [];
  for (const row of result.rows) {
    const item = asCartItem(row as unknown as Record<string, unknown>);
    if (item && item.cartId === cartId) {
      items.push(item);
    }
  }
  return items;
}

async function syncCartSellerId(
  cart: Cart,
  items: CartItem[],
): Promise<Cart> {
  const nextSellerId =
    items.length === 0
      ? null
      : cart.sellerId;

  if (nextSellerId === cart.sellerId) return cart;

  const { tables } = await createSessionClient();
  const row = await tables.updateRow({
    databaseId: DATABASE_ID,
    tableId: TABLE_CARTS,
    rowId: cart.$id,
    data: {
      userId: cart.userId,
      sellerId: nextSellerId,
    },
  });
  const updated = asCart(row as unknown as Record<string, unknown>);
  return updated ?? { ...cart, sellerId: nextSellerId };
}

async function setCartSellerId(cart: Cart, sellerId: string): Promise<Cart> {
  if (cart.sellerId === sellerId) return cart;

  const { tables } = await createSessionClient();
  const row = await tables.updateRow({
    databaseId: DATABASE_ID,
    tableId: TABLE_CARTS,
    rowId: cart.$id,
    data: {
      userId: cart.userId,
      sellerId,
    },
  });
  const updated = asCart(row as unknown as Record<string, unknown>);
  return updated ?? { ...cart, sellerId };
}

/** Get or create the signed-in user's cart (one per userId). */
export async function getOrCreateCart(): Promise<Cart | null> {
  const user = await getLoggedInUser();
  if (!user || !hasAppwritePublicConfig()) return null;

  try {
    const { tables } = await createSessionClient();
    const existing = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_CARTS,
      queries: [Query.equal("userId", user.$id), Query.limit(1)],
    });

    if (existing.rows.length > 0) {
      const cart = asCart(
        existing.rows[0] as unknown as Record<string, unknown>,
      );
      if (cart && cart.userId === user.$id) return cart;
    }

    const row = await tables.createRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_CARTS,
      rowId: ID.unique(),
      data: {
        userId: user.$id,
      },
      permissions: cartPermissions(user.$id),
    });
    const created = asCart(row as unknown as Record<string, unknown>);
    if (!created || created.userId !== user.$id) return null;
    return created;
  } catch {
    return null;
  }
}

/** Total line-item quantity for navbar badge (0 for guests). */
export async function getCartItemCount(): Promise<number> {
  const cart = await getOrCreateCart();
  if (!cart) return 0;
  const items = await listCartItemsForCart(cart.$id);
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

/** Cart with live product joins and validation flags. */
export async function getCart(): Promise<CartView> {
  const empty: CartView = {
    cart: null,
    lines: [],
    itemCount: 0,
    subtotal: 0,
    hasIssues: false,
  };

  const cart = await getOrCreateCart();
  if (!cart) return empty;

  const items = await listCartItemsForCart(cart.$id);
  const productIds = [...new Set(items.map((item) => item.productId))];
  const products = await Promise.all(productIds.map((id) => getProduct(id)));
  const productById = new Map<string, Product>();
  for (let i = 0; i < productIds.length; i++) {
    const product = products[i];
    if (product) productById.set(productIds[i], product);
  }

  const lines = items.map((item) =>
    buildCartLine(item, productById.get(item.productId) ?? null),
  );
  const itemCount = lines.reduce((sum, line) => sum + line.item.quantity, 0);
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const hasIssues = lines.some((line) => !line.purchasable);

  return { cart, lines, itemCount, subtotal, hasIssues };
}

async function resolveOwnedCartItem(
  itemId: string,
): Promise<{ cart: Cart; item: CartItem }> {
  const user = await requireUser();
  const trimmed = itemId?.trim();
  if (!trimmed) {
    const err = new Error("Cart item id is required.");
    (err as Error & { code: CartErrorCode }).code =
      CART_ERROR_CODES.ITEM_NOT_FOUND;
    throw err;
  }

  const { tables } = await createSessionClient();
  const row = await tables.getRow({
    databaseId: DATABASE_ID,
    tableId: TABLE_CART_ITEMS,
    rowId: trimmed,
  });
  const item = asCartItem(row as unknown as Record<string, unknown>);
  if (!item) {
    const err = new Error("Cart item not found.");
    (err as Error & { code: CartErrorCode }).code =
      CART_ERROR_CODES.ITEM_NOT_FOUND;
    throw err;
  }

  const cartRow = await tables.getRow({
    databaseId: DATABASE_ID,
    tableId: TABLE_CARTS,
    rowId: item.cartId,
  });
  const cart = asCart(cartRow as unknown as Record<string, unknown>);
  if (!cart || cart.userId !== user.$id) {
    const err = new Error("Not allowed to modify this cart item.");
    (err as Error & { code: CartErrorCode }).code =
      CART_ERROR_CODES.NOT_ALLOWED;
    throw err;
  }

  return { cart, item };
}

/** Add or merge a product into the signed-in user's cart. */
export async function addToCart(params: {
  productId: string;
  quantity: number;
}): Promise<CartActionState> {
  try {
    const user = await requireUser();
    await assertCartMutationRateLimit(user.$id);

    const productId = params.productId?.trim();
    const quantity = parseQuantity(params.quantity);
    if (!productId || quantity === null) {
      return {
        error: "Enter a valid quantity (1 or more).",
        errorCode: CART_ERROR_CODES.QUANTITY_INVALID,
      };
    }

    const product = await getProduct(productId);
    if (!product || !isProductPurchasable(product)) {
      return {
        error: "This product is not available to buy right now.",
        errorCode: CART_ERROR_CODES.PRODUCT_UNAVAILABLE,
      };
    }
    if (quantity > product.stock) {
      return {
        error: `Only ${product.stock} in stock.`,
        errorCode: CART_ERROR_CODES.STOCK_EXCEEDED,
      };
    }

    const cart = await getOrCreateCart();
    if (!cart) {
      return {
        error: "Could not access your cart.",
        errorCode: CART_ERROR_CODES.NOT_ALLOWED,
      };
    }

    const items = await listCartItemsForCart(cart.$id);
    if (items.length === 0) {
      await setCartSellerId(cart, product.sellerId);
    } else if (cart.sellerId && cart.sellerId !== product.sellerId) {
      return {
        error:
          "Your cart already has items from another seller. Clear the cart to add this product.",
        errorCode: CART_ERROR_CODES.SELLER_MISMATCH,
      };
    } else if (!cart.sellerId) {
      await setCartSellerId(cart, product.sellerId);
    }

    const existing = items.find((item) => item.productId === productId);
    const { tables } = await createSessionClient();

    if (existing) {
      const newQty = existing.quantity + quantity;
      if (newQty > product.stock) {
        return {
          error: `Only ${product.stock} in stock (${existing.quantity} already in cart).`,
          errorCode: CART_ERROR_CODES.STOCK_EXCEEDED,
        };
      }
      await tables.updateRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_CART_ITEMS,
        rowId: existing.$id,
        data: {
          cartId: existing.cartId,
          productId: existing.productId,
          quantity: newQty,
          unitPrice: existing.unitPrice,
        },
      });
      return { success: "Cart updated." };
    }

    await tables.createRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_CART_ITEMS,
      rowId: ID.unique(),
      data: {
        cartId: cart.$id,
        productId,
        quantity,
        unitPrice: product.price,
      },
      permissions: cartPermissions(user.$id),
    });

    return { success: "Added to cart." };
  } catch (error) {
    if (error instanceof Error) {
      const code = (error as Error & { code?: CartErrorCode }).code;
      if (code === CART_ERROR_CODES.NOT_AUTHENTICATED) {
        return { error: error.message, errorCode: code };
      }
      if (code === CART_ERROR_CODES.RATE_LIMITED) {
        return { error: error.message, errorCode: code };
      }
    }
    return {
      error: "Could not add to cart.",
      errorCode: CART_ERROR_CODES.NOT_ALLOWED,
    };
  }
}

/** Clear cart and add a product (seller-switch helper). */
export async function clearCartAndAdd(params: {
  productId: string;
  quantity: number;
}): Promise<CartActionState> {
  const cleared = await clearCart();
  if (cleared.error) return cleared;
  return addToCart(params);
}

/** Update quantity for an owned cart line. */
export async function updateCartItemQuantity(params: {
  itemId: string;
  quantity: number;
}): Promise<CartActionState> {
  try {
    const user = await requireUser();
    await assertCartMutationRateLimit(user.$id);

    const quantity = parseQuantity(params.quantity);
    if (quantity === null) {
      return {
        error: "Enter a valid quantity (1 or more).",
        errorCode: CART_ERROR_CODES.QUANTITY_INVALID,
      };
    }

    const { item } = await resolveOwnedCartItem(params.itemId);
    const product = await getProduct(item.productId);
    if (!product || !isProductPurchasable(product)) {
      return {
        error: "This item is no longer available. Remove it from your cart.",
        errorCode: CART_ERROR_CODES.PRODUCT_UNAVAILABLE,
      };
    }
    if (quantity > product.stock) {
      return {
        error: `Only ${product.stock} in stock.`,
        errorCode: CART_ERROR_CODES.STOCK_EXCEEDED,
      };
    }

    const { tables } = await createSessionClient();
    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_CART_ITEMS,
      rowId: item.$id,
      data: {
        cartId: item.cartId,
        productId: item.productId,
        quantity,
        unitPrice: item.unitPrice,
      },
    });

    return { success: "Quantity updated." };
  } catch (error) {
    if (error instanceof Error) {
      const code = (error as Error & { code?: CartErrorCode }).code;
      if (code) {
        return { error: error.message, errorCode: code };
      }
    }
    return {
      error: "Could not update quantity.",
      errorCode: CART_ERROR_CODES.NOT_ALLOWED,
    };
  }
}

/** Remove one line from the cart. Clears sellerId when cart becomes empty. */
export async function removeCartItem(itemId: string): Promise<CartActionState> {
  try {
    const user = await requireUser();
    await assertCartMutationRateLimit(user.$id);

    const { cart, item } = await resolveOwnedCartItem(itemId);
    const { tables } = await createSessionClient();
    await tables.deleteRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_CART_ITEMS,
      rowId: item.$id,
    });

    const remaining = await listCartItemsForCart(cart.$id);
    await syncCartSellerId(cart, remaining);

    return { success: "Item removed." };
  } catch (error) {
    if (error instanceof Error) {
      const code = (error as Error & { code?: CartErrorCode }).code;
      if (code) {
        return { error: error.message, errorCode: code };
      }
    }
    return {
      error: "Could not remove item.",
      errorCode: CART_ERROR_CODES.NOT_ALLOWED,
    };
  }
}

/** Delete all cart lines and reset seller lock. */
export async function clearCart(): Promise<CartActionState> {
  try {
    const user = await requireUser();
    await assertCartMutationRateLimit(user.$id);

    const cart = await getOrCreateCart();
    if (!cart) {
      return {
        error: "Could not access your cart.",
        errorCode: CART_ERROR_CODES.NOT_ALLOWED,
      };
    }

    const items = await listCartItemsForCart(cart.$id);
    const { tables } = await createSessionClient();
    for (const item of items) {
      await tables.deleteRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_CART_ITEMS,
        rowId: item.$id,
      });
    }

    await syncCartSellerId(cart, []);
    return { success: "Cart cleared." };
  } catch (error) {
    if (error instanceof Error) {
      const code = (error as Error & { code?: CartErrorCode }).code;
      if (code) {
        return { error: error.message, errorCode: code };
      }
    }
    return {
      error: "Could not clear cart.",
      errorCode: CART_ERROR_CODES.NOT_ALLOWED,
    };
  }
}
