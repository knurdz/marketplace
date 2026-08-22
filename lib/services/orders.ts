import { ID, Permission, Query, Role } from "node-appwrite";
import {
  BUCKET_BANK_SLIPS,
  DATABASE_ID,
  TABLE_BANK_SLIPS,
  TABLE_ORDER_ITEMS,
  TABLE_ORDERS,
  TABLE_PAYMENTS,
  hasAppwritePublicConfig,
} from "@/lib/appwrite/config";
import { deleteFileAsAdmin } from "@/lib/appwrite/storage";
import { createAdminClient, createSessionClient } from "@/lib/appwrite/server";
import { getLoggedInUser } from "@/lib/appwrite/session";
import { logError } from "@/lib/observability/log-error";
import { assertDurableRateLimit } from "@/lib/security/durable-rate-limit";
import { uploadBankSlip } from "./uploads";
import {
  getClientIp,
  RATE_LIMIT_MESSAGE,
  RATE_LIMITS,
} from "@/lib/security/rate-limit";
import { decrementStockForLines, restoreStockForLines } from "./stock";
import type {
  BankSlip,
  Order,
  OrderItem,
  Payment,
  PaymentMethod,
} from "@/lib/types";
import {
  isBankSlipStatus,
  isOrderCancelable,
  isOrderStatus,
  isPaymentMethod,
  isPaymentStatus,
} from "@/lib/types";
import { notifyBankSlipUploaded } from "./order-notify";
import { addToCart, clearCart, getCart } from "./cart";
import { CART_ERROR_CODES } from "./cart-errors";
import {
  recordCouponRedemption,
  validateCouponForCheckout,
} from "./coupons";
import { isPayHereCheckoutEnabled } from "./platform-settings";
import { getProduct, isProductPurchasable } from "./products";
import {
  ORDER_ERROR_CODES,
  type CreateOrderInput,
  type CreateOrderResult,
  type OrderErrorCode,
  type CancelOrderResult,
  type SubmitBankSlipInput,
  type SubmitBankSlipResult,
} from "./order-errors";

export type { CreateOrderInput, CreateOrderResult } from "./order-errors";
export type {
  SubmitBankSlipInput,
  SubmitBankSlipResult,
} from "./order-errors";
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
    couponCode: asNullableString(row.couponCode),
    discountAmount: Math.max(0, asNumber(row.discountAmount)),
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

export function asBankSlip(row: Record<string, unknown>): BankSlip | null {
  const $id = asNullableString(row.$id);
  const paymentId = asNullableString(row.paymentId);
  const orderId = asNullableString(row.orderId);
  const fileId = asNullableString(row.fileId);
  const uploadedBy = asNullableString(row.uploadedBy);
  const statusRaw = row.status;

  if (
    !$id ||
    !paymentId ||
    !orderId ||
    !fileId ||
    !uploadedBy ||
    !isBankSlipStatus(statusRaw)
  ) {
    return null;
  }

  return {
    $id,
    paymentId,
    orderId,
    fileId,
    uploadedBy,
    status: statusRaw,
    reviewedBy: asNullableString(row.reviewedBy),
    reviewNote: asNullableString(row.reviewNote),
  };
}

function bankSlipRowPermissions(): string[] {
  return [
    Permission.read(Role.label("admin")),
    Permission.update(Role.label("admin")),
    Permission.delete(Role.label("admin")),
  ];
}

const BANK_SLIP_ALLOWED_PAYMENT_STATUSES = ["pending", "awaiting_verification"] as const;

function orderRowPermissions(buyerId: string, sellerId: string): string[] {
  return [
    Permission.read(Role.user(buyerId)),
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
  const result = await assertDurableRateLimit({
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

function fail<T extends { ok: boolean }>(
  error: string,
  code: OrderErrorCode,
): Extract<T, { ok: false }> {
  return { ok: false, error, code } as unknown as Extract<T, { ok: false }>;
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
    const { tables } = await createAdminClient();
    for (const itemId of params.orderItemIds) {
      try {
        await tables.deleteRow({
          databaseId: DATABASE_ID,
          tableId: TABLE_ORDER_ITEMS,
          rowId: itemId,
        });
      } catch (error) {
        logError("orders.rollback.item", error, { rowId: itemId });
      }
    }
    if (params.paymentId) {
      try {
        await tables.deleteRow({
          databaseId: DATABASE_ID,
          tableId: TABLE_PAYMENTS,
          rowId: params.paymentId,
        });
      } catch (error) {
        logError("orders.rollback.payment", error, { rowId: params.paymentId });
      }
    }
    if (params.orderId) {
      try {
        await tables.deleteRow({
          databaseId: DATABASE_ID,
          tableId: TABLE_ORDERS,
          rowId: params.orderId,
        });
      } catch (error) {
        logError("orders.rollback.order", error, { rowId: params.orderId });
      }
    }
  } catch (error) {
    logError("orders.rollback", error, { orderId: params.orderId });
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

/** Newest-first list for the signed-in buyer only. */
export async function listOwnOrders(opts?: { limit?: number }): Promise<Order[]> {
  if (!hasAppwritePublicConfig()) return [];

  const user = await getLoggedInUser();
  if (!user) return [];

  const limit = Math.min(Math.max(opts?.limit ?? 50, 1), 50);

  try {
    const { tables } = await createSessionClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_ORDERS,
      queries: [
        Query.equal("buyerId", user.$id),
        Query.orderDesc("$createdAt"),
        Query.limit(limit),
      ],
    });

    const out: Order[] = [];
    for (const row of result.rows) {
      const order = asOrder(row as unknown as Record<string, unknown>);
      if (order && order.buyerId === user.$id) {
        out.push(order);
      }
    }
    return out;
  } catch {
    return [];
  }
}

/** Line items for an order owned by the signed-in buyer (IDOR-safe). */
export async function getOwnOrderItems(orderId: string): Promise<OrderItem[]> {
  const order = await getOwnOrder(orderId);
  if (!order) return [];

  try {
    const { tables } = await createSessionClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_ORDER_ITEMS,
      queries: [Query.equal("orderId", order.$id), Query.limit(100)],
    });

    const out: OrderItem[] = [];
    for (const row of result.rows) {
      const item = asOrderItem(row as unknown as Record<string, unknown>);
      if (item && item.orderId === order.$id) {
        out.push(item);
      }
    }
    return out;
  } catch {
    return [];
  }
}

/** Load the payment row for an order owned by the signed-in buyer (IDOR-safe). */
export async function getOwnPaymentForOrder(
  orderId: string,
): Promise<Payment | null> {
  if (!hasAppwritePublicConfig()) return null;

  const order = await getOwnOrder(orderId);
  if (!order) return null;

  const trimmed = orderId.trim();
  if (!trimmed) return null;

  try {
    const { tables } = await createSessionClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_PAYMENTS,
      queries: [Query.equal("orderId", trimmed), Query.limit(1)],
    });

    const row = result.rows[0];
    if (!row) return null;

    const payment = asPayment(row as unknown as Record<string, unknown>);
    if (!payment || payment.orderId !== order.$id) return null;
    return payment;
  } catch {
    return null;
  }
}

export async function submitBankSlip(
  input: SubmitBankSlipInput,
): Promise<SubmitBankSlipResult> {
  if (!hasAppwritePublicConfig()) {
    return fail<SubmitBankSlipResult>(
      "Checkout is not configured yet.",
      ORDER_ERROR_CODES.NOT_ALLOWED,
    );
  }

  const user = await getLoggedInUser();
  if (!user) {
    return fail<SubmitBankSlipResult>(
      "You must be signed in to upload a bank slip.",
      ORDER_ERROR_CODES.NOT_AUTHENTICATED,
    );
  }

  const ip = await getClientIp();
  const limited = await assertDurableRateLimit({
    bucket: "bank-slip",
    key: `${user.$id}:${ip}`,
    ...RATE_LIMITS.bankSlip,
  });
  if (!limited.ok) {
    return fail<SubmitBankSlipResult>(
      RATE_LIMIT_MESSAGE,
      ORDER_ERROR_CODES.RATE_LIMITED,
    );
  }

  const orderId = input.orderId?.trim();
  if (!orderId) {
    return fail<SubmitBankSlipResult>("Invalid order id.", ORDER_ERROR_CODES.NOT_FOUND);
  }

  const order = await getOwnOrder(orderId);
  if (!order) {
    return fail<SubmitBankSlipResult>("Order not found.", ORDER_ERROR_CODES.NOT_FOUND);
  }

  if (order.paymentMethod !== "bank_transfer") {
    return fail<SubmitBankSlipResult>(
      "This order is not a bank transfer checkout.",
      ORDER_ERROR_CODES.WRONG_METHOD,
    );
  }

  const payment = await getOwnPaymentForOrder(orderId);
  if (!payment || payment.method !== "bank_transfer") {
    return fail<SubmitBankSlipResult>("Payment not found.", ORDER_ERROR_CODES.NOT_FOUND);
  }

  if (
    !BANK_SLIP_ALLOWED_PAYMENT_STATUSES.includes(
      payment.status as (typeof BANK_SLIP_ALLOWED_PAYMENT_STATUSES)[number],
    )
  ) {
    return fail<SubmitBankSlipResult>(
      "This payment can no longer accept a bank slip upload.",
      ORDER_ERROR_CODES.PAYMENT_STATE_INVALID,
    );
  }

  let fileId: string;
  try {
    const uploaded = await uploadBankSlip(input.file);
    fileId = uploaded.fileId;
  } catch (error) {
    const message =
      error instanceof Error && error.message.length > 0
        ? error.message
        : "Could not upload your bank slip.";
    return fail<SubmitBankSlipResult>(message, ORDER_ERROR_CODES.SLIP_UPLOAD_FAILED);
  }

  let slipCreated = false;
  try {
    const { tables } = await createSessionClient();

    await tables.createRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_BANK_SLIPS,
      rowId: ID.unique(),
      data: {
        paymentId: payment.$id,
        orderId: order.$id,
        fileId,
        uploadedBy: user.$id,
        status: "pending",
      },
      permissions: bankSlipRowPermissions(),
    });
    slipCreated = true;

    const { tables: adminTables } = await createAdminClient();
    await adminTables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PAYMENTS,
      rowId: payment.$id,
      data: { status: "awaiting_verification" },
    });

    await adminTables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_ORDERS,
      rowId: order.$id,
      data: { status: "payment_review" },
    });
  } catch (error) {
    logError("orders.submitBankSlip", error, { orderId: order.$id });
    if (!slipCreated) {
      try {
        await deleteFileAsAdmin(BUCKET_BANK_SLIPS, fileId);
      } catch (cleanupError) {
        logError("orders.submitBankSlip.cleanup", cleanupError, { fileId });
      }
    }
    return fail<SubmitBankSlipResult>(
      "Could not save your bank slip. Please try again.",
      ORDER_ERROR_CODES.UPDATE_FAILED,
    );
  }

  await notifyBankSlipUploaded({
    orderId: order.$id,
    sellerId: order.sellerId,
  });

  return {
    ok: true,
    orderStatus: "payment_review",
    paymentStatus: "awaiting_verification",
  };
}

export async function createOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  if (!hasAppwritePublicConfig()) {
    return fail<CreateOrderResult>(
      "Checkout is not configured yet.",
      ORDER_ERROR_CODES.NOT_ALLOWED,
    );
  }

  const user = await getLoggedInUser();
  if (!user) {
    return fail<CreateOrderResult>(
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
        return fail<CreateOrderResult>(error.message, code);
      }
    }
    return fail<CreateOrderResult>(RATE_LIMIT_MESSAGE, ORDER_ERROR_CODES.RATE_LIMITED);
  }

  const shippingAddress = serializeShippingAddress(input);
  if (!shippingAddress) {
    return fail<CreateOrderResult>(
      "Enter a complete shipping address.",
      ORDER_ERROR_CODES.ADDRESS_INVALID,
    );
  }

  if (!isPaymentMethod(input.paymentMethod)) {
    return fail<CreateOrderResult>(
      "Choose a valid payment method.",
      ORDER_ERROR_CODES.PAYMENT_METHOD_INVALID,
    );
  }

  const cartView = await getCart();
  const { cart, lines, hasIssues } = cartView;

  if (!cart || lines.length === 0) {
    return fail<CreateOrderResult>("Your cart is empty.", ORDER_ERROR_CODES.CART_EMPTY);
  }

  if (hasIssues) {
    return fail<CreateOrderResult>(
      "Some cart items need attention before checkout.",
      ORDER_ERROR_CODES.CART_ISSUES,
    );
  }

  if (!cart.sellerId) {
    return fail<CreateOrderResult>(
      "Could not determine the seller for this cart.",
      ORDER_ERROR_CODES.SELLER_MISSING,
    );
  }

  const prepared: PreparedLine[] = [];
  let currency: string | null = null;

  for (const line of lines) {
    if (!line.purchasable) {
      return fail<CreateOrderResult>(
        "Some products are no longer available.",
        ORDER_ERROR_CODES.PRODUCT_UNAVAILABLE,
      );
    }

    const product = await getProduct(line.item.productId);
    if (!product || !isProductPurchasable(product)) {
      return fail<CreateOrderResult>(
        "Some products are no longer available.",
        ORDER_ERROR_CODES.PRODUCT_UNAVAILABLE,
      );
    }

    if (line.item.quantity > product.stock) {
      return fail<CreateOrderResult>(
        `Only ${product.stock} in stock for "${product.title}".`,
        ORDER_ERROR_CODES.PRODUCT_UNAVAILABLE,
      );
    }

    if (currency === null) {
      currency = product.currency;
    } else if (currency !== product.currency) {
      return fail<CreateOrderResult>(
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

  const subtotal = prepared.reduce((sum, line) => sum + line.lineTotal, 0);
  const resolvedCurrency = currency ?? "LKR";

  let payableTotal = subtotal;
  let discountAmount = 0;
  let appliedCouponCode: string | null = null;
  let appliedCouponId: string | null = null;

  const couponRaw = input.couponCode?.trim();
  if (couponRaw) {
    const couponResult = await validateCouponForCheckout({
      code: couponRaw,
      subtotal,
      buyerId: user.$id,
    });
    if (!couponResult.ok) {
      return fail<CreateOrderResult>(
        couponResult.error,
        ORDER_ERROR_CODES.COUPON_INVALID,
      );
    }
    discountAmount = couponResult.discountAmount;
    payableTotal = couponResult.payableTotal;
    appliedCouponCode = couponResult.code;
    appliedCouponId = couponResult.coupon.$id;
  }

  if (input.paymentMethod === "free" && payableTotal !== 0) {
    return fail<CreateOrderResult>(
      "Free checkout is only available when the order total is zero.",
      ORDER_ERROR_CODES.PAYMENT_METHOD_MISMATCH,
    );
  }

  if (input.paymentMethod === "payhere") {
    const payhereEnabled = await isPayHereCheckoutEnabled();
    if (!payhereEnabled) {
      return fail<CreateOrderResult>(
        "Online card checkout is not available yet.",
        ORDER_ERROR_CODES.PAYMENT_METHOD_INVALID,
      );
    }
  }

  if (
    (input.paymentMethod === "payhere" ||
      input.paymentMethod === "bank_transfer" ||
      input.paymentMethod === "cod") &&
    payableTotal <= 0
  ) {
    return fail<CreateOrderResult>(
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
  let transactionId: string | undefined;

  try {
    const { tables } = await createAdminClient();
    const tx = await tables.createTransaction({ ttl: 120 });
    transactionId = tx.$id;

    const orderRow = await tables.createRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_ORDERS,
      rowId: ID.unique(),
      data: {
        buyerId,
        sellerId,
        status: "pending_payment",
        totalAmount: payableTotal,
        currency: resolvedCurrency,
        shippingAddress,
        paymentMethod: input.paymentMethod,
        couponCode: appliedCouponCode,
        discountAmount,
      },
      permissions,
      transactionId,
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
        transactionId,
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
        amount: payableTotal,
        currency: resolvedCurrency,
      },
      permissions: childPermissions,
      transactionId,
    });
    paymentId = paymentRow.$id;

    await decrementStockForLines(tables, prepared, transactionId);

    if (appliedCouponId && orderId && discountAmount > 0) {
      const redemption = await recordCouponRedemption({
        couponId: appliedCouponId,
        orderId,
        buyerId,
        discountAmount,
        transactionId,
        tables,
      });
      if (!redemption.ok) {
        const err = new Error(redemption.error);
        (err as Error & { code: OrderErrorCode }).code =
          ORDER_ERROR_CODES.COUPON_INVALID;
        throw err;
      }
    }

    await tables.updateTransaction({
      transactionId,
      commit: true,
    });
  } catch (error) {
    if (transactionId) {
      try {
        const { tables } = await createAdminClient();
        await tables.updateTransaction({ transactionId, commit: false });
      } catch (abortError) {
        logError("orders.create.abort-tx", abortError, { orderId });
      }
    }
    await rollbackOrderRows({ orderId, orderItemIds, paymentId });
    logError("orders.create", error, { buyerId });
    const code = (error as Error & { code?: OrderErrorCode }).code;
    if (code === ORDER_ERROR_CODES.COUPON_INVALID && error instanceof Error) {
      return fail<CreateOrderResult>(error.message, code);
    }
    return fail<CreateOrderResult>(
      "Could not place your order. Please try again.",
      ORDER_ERROR_CODES.CREATE_FAILED,
    );
  }

  const cleared = await clearCart();
  if (cleared.error) {
    logError("orders.create.clearCart", cleared.error, { orderId });
  }

  return {
    ok: true,
    orderId: orderId!,
    paymentMethod: input.paymentMethod,
  };
}

/** Cancel an owned early-status order; mark payment failed and restore stock. */
export async function cancelOrder(orderId: string): Promise<CancelOrderResult> {
  if (!hasAppwritePublicConfig()) {
    return fail<CancelOrderResult>(
      "Orders are not configured yet.",
      ORDER_ERROR_CODES.NOT_ALLOWED,
    );
  }

  const user = await getLoggedInUser();
  if (!user) {
    return fail<CancelOrderResult>(
      "You must be signed in to cancel an order.",
      ORDER_ERROR_CODES.NOT_AUTHENTICATED,
    );
  }

  const ip = await getClientIp();
  const limited = await assertDurableRateLimit({
    bucket: "cancel-order",
    key: `${user.$id}:${ip}`,
    ...RATE_LIMITS.cancelOrder,
  });
  if (!limited.ok) {
    return fail<CancelOrderResult>(
      RATE_LIMIT_MESSAGE,
      ORDER_ERROR_CODES.RATE_LIMITED,
    );
  }

  const trimmed = orderId?.trim();
  if (!trimmed) {
    return fail<CancelOrderResult>("Invalid order id.", ORDER_ERROR_CODES.NOT_FOUND);
  }

  const order = await getOwnOrder(trimmed);
  if (!order) {
    return fail<CancelOrderResult>("Order not found.", ORDER_ERROR_CODES.NOT_FOUND);
  }

  if (!isOrderCancelable(order.status)) {
    return fail<CancelOrderResult>(
      "This order can no longer be cancelled.",
      ORDER_ERROR_CODES.NOT_CANCELABLE,
    );
  }

  try {
    const { tables } = await createAdminClient();
    const payment = await getOwnPaymentForOrder(order.$id);
    const items = await getOwnOrderItems(order.$id);
    const tx = await tables.createTransaction({ ttl: 120 });
    const transactionId = tx.$id;

    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_ORDERS,
      rowId: order.$id,
      data: { status: "cancelled" },
      transactionId,
    });

    if (payment && payment.status !== "failed" && payment.status !== "refunded") {
      await tables.updateRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_PAYMENTS,
        rowId: payment.$id,
        data: { status: "failed" },
        transactionId,
      });
    }

    await restoreStockForLines(tables, items, transactionId);

    await tables.updateTransaction({ transactionId, commit: true });
  } catch (error) {
    logError("orders.cancel", error, { orderId: order.$id });
    return fail<CancelOrderResult>(
      "Could not cancel your order. Please try again.",
      ORDER_ERROR_CODES.UPDATE_FAILED,
    );
  }

  return { ok: true, orderStatus: "cancelled" };
}

export type ReorderResult =
  | { ok: true; addedCount: number; skippedCount: number; message: string }
  | { ok: false; error: string; code?: OrderErrorCode };

/** Re-add purchasable lines from a completed order into the buyer's cart (IDOR-safe). */
export async function reorderOwnOrder(orderId: string): Promise<ReorderResult> {
  const user = await getLoggedInUser();
  if (!user) {
    return {
      ok: false,
      error: "You must be signed in to reorder.",
      code: ORDER_ERROR_CODES.NOT_AUTHENTICATED,
    };
  }

  const ip = await getClientIp();
  const limited = await assertDurableRateLimit({
    bucket: "reorder",
    key: `${user.$id}:${ip}`,
    ...RATE_LIMITS.reorder,
  });
  if (!limited.ok) {
    return { ok: false, error: RATE_LIMIT_MESSAGE, code: ORDER_ERROR_CODES.RATE_LIMITED };
  }

  const order = await getOwnOrder(orderId);
  if (!order) {
    return {
      ok: false,
      error: "Order not found.",
      code: ORDER_ERROR_CODES.NOT_FOUND,
    };
  }

  if (order.status !== "completed") {
    return {
      ok: false,
      error: "You can only reorder completed orders.",
      code: ORDER_ERROR_CODES.NOT_ALLOWED,
    };
  }

  const items = await getOwnOrderItems(orderId);
  if (items.length === 0) {
    return {
      ok: false,
      error: "No items to reorder.",
      code: ORDER_ERROR_CODES.NOT_FOUND,
    };
  }

  let addedCount = 0;
  let skippedCount = 0;

  for (const item of items) {
    const result = await addToCart({
      productId: item.productId,
      quantity: item.quantity,
    });

    if (result.success) {
      addedCount += 1;
      continue;
    }

    if (
      result.errorCode === CART_ERROR_CODES.SELLER_MISMATCH &&
      addedCount === 0 &&
      skippedCount === 0
    ) {
      return {
        ok: false,
        error:
          result.error ??
          "Your cart has items from another seller. Clear your cart first.",
        code: ORDER_ERROR_CODES.NOT_ALLOWED,
      };
    }

    skippedCount += 1;
  }

  if (addedCount === 0) {
    return {
      ok: false,
      error: "None of the items from this order are available to buy right now.",
      code: ORDER_ERROR_CODES.PRODUCT_UNAVAILABLE,
    };
  }

  const message =
    skippedCount > 0
      ? `Added ${addedCount} item(s) to cart. ${skippedCount} unavailable and skipped.`
      : `Added ${addedCount} item(s) to cart.`;

  return { ok: true, addedCount, skippedCount, message };
}

export function checkoutContinuationPath(
  method: PaymentMethod,
  orderId: string,
): string {
  const id = encodeURIComponent(orderId);
  switch (method) {
    case "free":
      return `/checkout/free?orderId=${id}`;
    case "cod":
      return `/checkout/cod?orderId=${id}`;
    case "bank_transfer":
      return `/checkout/bank?orderId=${id}`;
    case "payhere":
      return `/checkout/payhere?orderId=${id}`;
  }
}
