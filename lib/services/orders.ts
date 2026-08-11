import { ID, Permission, Role } from "node-appwrite";
import {
  DATABASE_ID,
  TABLE_ORDER_ITEMS,
  TABLE_ORDERS,
  TABLE_PAYMENTS,
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
import type { Order, OrderItem, Payment, PaymentMethod, Product } from "@/lib/types";
import {
  ACTIVE_PRODUCT_STATUS,
  isOrderStatus,
  isPaymentMethod,
  isPaymentStatus,
} from "@/lib/types";
import { clearCart, getCart } from "./cart";
import { getProduct } from "./products";
import {
  ORDER_ERROR_CODES,
  type CreateOrderInput,
  type CreateOrderResult,
  type OrderErrorCode,
} from "./order-errors";

export type { CreateOrderInput, CreateOrderResult } from "./order-errors";
export {
  ORDER_ERROR_CODES,
  type CreateOrderActionState,
  type OrderErrorCode,
} from "./order-errors";

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

export function asOrder(row: Record<string, unknown>): Order | null {
  const $id = asNullableString(row.$id);
  const buyerId = asNullableString(row.buyerId);
  const sellerId = asNullableString(row.sellerId);
  const shippingAddress = asNullableString(row.shippingAddress);
  const currency = asNullableString(row.currency);
  const statusRaw = row.status;
  const paymentMethodRaw = row.paymentMethod;

  if (
    !$id ||
    !buyerId ||
    !sellerId ||
    !shippingAddress ||
    !currency ||
    !isOrderStatus(statusRaw) ||
    !isPaymentMethod(paymentMethodRaw)
  ) {
    return null;
  }

  return {
    $id,
    buyerId,
    sellerId,
    status: statusRaw,
    totalAmount: asNumber(row.totalAmount),
    currency,
    shippingAddress,
    paymentMethod: paymentMethodRaw,
  };
}

export function asOrderItem(row: Record<string, unknown>): OrderItem | null {
  const $id = asNullableString(row.$id);
  const orderId = asNullableString(row.orderId);
  const productId = asNullableString(row.productId);
  const title = asNullableString(row.title);

  if (!$id || !orderId || !productId || !title) return null;

  const quantity = Math.floor(asNumber(row.quantity));
  const unitPrice = asNumber(row.unitPrice);
  const lineTotal = asNumber(row.lineTotal);

  if (quantity < 1 || unitPrice < 0 || lineTotal < 0) return null;

  return { $id, orderId, productId, title, quantity, unitPrice, lineTotal };
}

export function asPayment(row: Record<string, unknown>): Payment | null {
  const $id = asNullableString(row.$id);
  const orderId = asNullableString(row.orderId);
  const currency = asNullableString(row.currency);
  const methodRaw = row.method;
  const statusRaw = row.status;

  if (
    !$id ||
    !orderId ||
    !currency ||
    !isPaymentMethod(methodRaw) ||
    !isPaymentStatus(statusRaw)
  ) {
    return null;
  }

  const payherePaymentId = asNullableString(row.payherePaymentId);
  const idempotencyKey = asNullableString(row.idempotencyKey);

  return {
    $id,
    orderId,
    method: methodRaw,
    status: statusRaw,
    amount: asNumber(row.amount),
    currency,
    payherePaymentId,
    idempotencyKey,
  };
}

function orderRowPermissions(buyerId: string, sellerId: string): string[] {
  return [
    Permission.read(Role.user(buyerId)),
    Permission.update(Role.user(buyerId)),
    Permission.read(Role.user(sellerId)),
    Permission.read(Role.label("admin")),
    Permission.update(Role.label("admin")),
    Permission.delete(Role.label("admin")),
  ];
}

function childRowPermissions(buyerId: string, sellerId: string): string[] {
  return orderRowPermissions(buyerId, sellerId);
}

async function assertCheckoutRateLimit(userId: string): Promise<void> {
  const ip = await getClientIp();
  const result = assertRateLimit({
    bucket: "checkout",
    key: `${userId}:${ip}`,
    ...RATE_LIMITS.checkout,
  });
  if (!result.ok) {
    const err = new Error(RATE_LIMIT_MESSAGE);
    (err as Error & { code: OrderErrorCode }).code =
      ORDER_ERROR_CODES.RATE_LIMITED;
    throw err;
  }
}

function fail(
  error: string,
  code: OrderErrorCode,
): CreateOrderResult {
  return { ok: false, error, code };
}

export function serializeShippingAddress(input: {
  line1: string;
  line2?: string;
  city: string;
  district: string;
  postalCode: string;
}): string | null {
  const parts = [
    input.line1.trim(),
    input.line2?.trim() ?? "",
    input.city.trim(),
    input.district.trim(),
    input.postalCode.trim(),
  ].filter((part) => part.length > 0);

  if (parts.length === 0) return null;

  const joined = parts.join("\n");
  if (joined.length > 2000) return null;
  return joined;
}

function isPurchasableProduct(product: Product): boolean {
  return (
    product.status === ACTIVE_PRODUCT_STATUS &&
    product.available &&
    product.stock > 0
  );
}

type PreparedLine = {
  productId: string;
  title: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  currency: string;
};

async function rollbackOrderRows(params: {
  orderId?: string;
  orderItemIds: string[];
  paymentId?: string;
}): Promise<void> {
  if (!hasAppwritePublicConfig()) return;

  try {
    const { tables } = await createSessionClient();
    for (const itemId of params.orderItemIds) {
      try {
        await tables.deleteRow({
          databaseId: DATABASE_ID,
          tableId: TABLE_ORDER_ITEMS,
          rowId: itemId,
        });
      } catch {
        /* best effort */
      }
    }
    if (params.paymentId) {
      try {
        await tables.deleteRow({
          databaseId: DATABASE_ID,
          tableId: TABLE_PAYMENTS,
          rowId: params.paymentId,
        });
      } catch {
        /* best effort */
      }
    }
    if (params.orderId) {
      try {
        await tables.deleteRow({
          databaseId: DATABASE_ID,
          tableId: TABLE_ORDERS,
          rowId: params.orderId,
        });
      } catch {
        /* best effort */
      }
    }
  } catch {
    /* best effort rollback */
  }
}

/** Load an order owned by the signed-in buyer (IDOR-safe). */
export async function getOwnOrder(orderId: string): Promise<Order | null> {
  if (!hasAppwritePublicConfig()) return null;

  const user = await getLoggedInUser();
  if (!user) return null;

  const trimmed = orderId?.trim();
  if (!trimmed) return null;

  try {
    const { tables } = await createSessionClient();
    const row = await tables.getRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_ORDERS,
      rowId: trimmed,
    });
    const order = asOrder(row as unknown as Record<string, unknown>);
    if (!order || order.buyerId !== user.$id) return null;
    return order;
  } catch {
    return null;
  }
}

export async function createOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  if (!hasAppwritePublicConfig()) {
    return fail(
      "Checkout is not configured yet.",
      ORDER_ERROR_CODES.NOT_ALLOWED,
    );
  }

  const user = await getLoggedInUser();
  if (!user) {
    return fail(
      "You must be signed in to checkout.",
      ORDER_ERROR_CODES.NOT_AUTHENTICATED,
    );
  }

  try {
    await assertCheckoutRateLimit(user.$id);
  } catch (error) {
    if (error instanceof Error) {
      const code = (error as Error & { code?: OrderErrorCode }).code;
      if (code === ORDER_ERROR_CODES.RATE_LIMITED) {
        return fail(error.message, code);
      }
    }
    return fail(RATE_LIMIT_MESSAGE, ORDER_ERROR_CODES.RATE_LIMITED);
  }

  const shippingAddress = serializeShippingAddress(input);
  if (!shippingAddress) {
    return fail(
      "Enter a complete shipping address.",
      ORDER_ERROR_CODES.ADDRESS_INVALID,
    );
  }

  if (!isPaymentMethod(input.paymentMethod)) {
    return fail(
      "Choose a valid payment method.",
      ORDER_ERROR_CODES.PAYMENT_METHOD_INVALID,
    );
  }

  const cartView = await getCart();
  const { cart, lines, hasIssues } = cartView;

  if (!cart || lines.length === 0) {
    return fail("Your cart is empty.", ORDER_ERROR_CODES.CART_EMPTY);
  }

  if (hasIssues) {
    return fail(
      "Some cart items need attention before checkout.",
      ORDER_ERROR_CODES.CART_ISSUES,
    );
  }

  if (!cart.sellerId) {
    return fail(
      "Could not determine the seller for this cart.",
      ORDER_ERROR_CODES.SELLER_MISSING,
    );
  }

  const prepared: PreparedLine[] = [];
  let currency: string | null = null;

  for (const line of lines) {
    if (!line.purchasable) {
      return fail(
        "Some products are no longer available.",
        ORDER_ERROR_CODES.PRODUCT_UNAVAILABLE,
      );
    }

    const product = await getProduct(line.item.productId);
    if (!product || !isPurchasableProduct(product)) {
      return fail(
        "Some products are no longer available.",
        ORDER_ERROR_CODES.PRODUCT_UNAVAILABLE,
      );
    }

    if (line.item.quantity > product.stock) {
      return fail(
        `Only ${product.stock} in stock for "${product.title}".`,
        ORDER_ERROR_CODES.PRODUCT_UNAVAILABLE,
      );
    }

    if (currency === null) {
      currency = product.currency;
    } else if (currency !== product.currency) {
      return fail(
        "Cart items must share the same currency.",
        ORDER_ERROR_CODES.CURRENCY_MISMATCH,
      );
    }

    const unitPrice = product.price;
    const lineTotal = unitPrice * line.item.quantity;

    prepared.push({
      productId: product.$id,
      title: product.title,
      quantity: line.item.quantity,
      unitPrice,
      lineTotal,
      currency: product.currency,
    });
  }

  const totalAmount = prepared.reduce((sum, line) => sum + line.lineTotal, 0);
  const resolvedCurrency = currency ?? "LKR";

  if (input.paymentMethod === "free" && totalAmount !== 0) {
    return fail(
      "Free checkout is only available when the order total is zero.",
      ORDER_ERROR_CODES.PAYMENT_METHOD_MISMATCH,
    );
  }

  if (
    (input.paymentMethod === "payhere" ||
      input.paymentMethod === "bank_transfer") &&
    totalAmount <= 0
  ) {
    return fail(
      "Choose free checkout for zero-total orders.",
      ORDER_ERROR_CODES.PAYMENT_METHOD_MISMATCH,
    );
  }

  const buyerId = user.$id;
  const sellerId = cart.sellerId;
  const permissions = orderRowPermissions(buyerId, sellerId);
  const childPermissions = childRowPermissions(buyerId, sellerId);

  let orderId: string | undefined;
  const orderItemIds: string[] = [];
  let paymentId: string | undefined;

  try {
    const { tables } = await createSessionClient();

    const orderRow = await tables.createRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_ORDERS,
      rowId: ID.unique(),
      data: {
        buyerId,
        sellerId,
        status: "pending_payment",
        totalAmount,
        currency: resolvedCurrency,
        shippingAddress,
        paymentMethod: input.paymentMethod,
      },
      permissions,
    });

    orderId = orderRow.$id;

    for (const line of prepared) {
      const itemRow = await tables.createRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_ORDER_ITEMS,
        rowId: ID.unique(),
        data: {
          orderId,
          productId: line.productId,
          title: line.title,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          lineTotal: line.lineTotal,
        },
        permissions: childPermissions,
      });
      orderItemIds.push(itemRow.$id);
    }

    const paymentRow = await tables.createRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PAYMENTS,
      rowId: ID.unique(),
      data: {
        orderId,
        method: input.paymentMethod,
        status: "pending",
        amount: totalAmount,
        currency: resolvedCurrency,
      },
      permissions: childPermissions,
    });
    paymentId = paymentRow.$id;
  } catch {
    await rollbackOrderRows({ orderId, orderItemIds, paymentId });
    return fail(
      "Could not place your order. Please try again.",
      ORDER_ERROR_CODES.CREATE_FAILED,
    );
  }

  const cleared = await clearCart();
  if (cleared.error) {
    /* Order exists; cart clear failure is non-fatal for the buyer flow. */
  }

  return {
    ok: true,
    orderId: orderId!,
    paymentMethod: input.paymentMethod,
  };
}

export function checkoutContinuationPath(
  method: PaymentMethod,
  orderId: string,
): string {
  const id = encodeURIComponent(orderId);
  switch (method) {
    case "free":
      return `/checkout/free?orderId=${id}`;
    case "bank_transfer":
      return `/checkout/bank?orderId=${id}`;
    case "payhere":
      return `/checkout/payhere?orderId=${id}`;
  }
}
