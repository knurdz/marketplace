"use server";

/**
 * Cash on delivery order confirmation.
 * Session + IDOR + DB amounts. Buyer acceptance sets order `processing`
 * and leaves payment `pending` until the seller collects cash on delivery.
 */

import { Query } from "node-appwrite";
import {
  DATABASE_ID,
  TABLE_ORDER_ITEMS,
  TABLE_ORDERS,
  TABLE_PAYMENTS,
  hasAppwritePublicConfig,
} from "@/lib/appwrite/config";
import { createAdminClient } from "@/lib/appwrite/server";
import { getLoggedInUser } from "@/lib/appwrite/session";
import { logError } from "@/lib/observability/log-error";
import { assertDurableRateLimit } from "@/lib/security/durable-rate-limit";
import {
  getClientIp,
  RATE_LIMIT_MESSAGE,
  RATE_LIMITS,
} from "@/lib/security/rate-limit";
import type { Order, OrderItem, Payment } from "@/lib/types";
import {
  codConfirmIdempotencyKey,
  COD_CONFIRM_NOT_FOUND,
  evaluateCodConfirm,
} from "./cod-order-rules";
import { notifyCodAccepted } from "./order-notify";
import { asOrder, asOrderItem, asPayment, getOwnOrder } from "./orders";

const ORDER_ID_MAX = 36;
const NOT_CONFIGURED =
  "Cash on delivery confirmation is not configured yet." as const;
const GENERIC_FAILURE =
  "Unable to confirm this order. Please try again later." as const;

export type ConfirmCodOrderRequest = { orderId: string };

export type ConfirmCodOrderResult =
  | { ok: true }
  | { ok: false; error: string };

function adminSdkAvailable(): boolean {
  return (
    hasAppwritePublicConfig() && Boolean(process.env.APPWRITE_API_KEY?.trim())
  );
}

function normalizeOrderId(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const orderId = raw.trim().slice(0, ORDER_ID_MAX);
  return orderId.length > 0 ? orderId : null;
}

async function loadAdminOrder(orderId: string): Promise<Order | null> {
  try {
    const { tables } = await createAdminClient();
    const row = await tables.getRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_ORDERS,
      rowId: orderId,
    });
    return asOrder(row as unknown as Record<string, unknown>);
  } catch (error) {
    logError("cod.loadOrder", error, { orderId });
    return null;
  }
}

async function loadAdminPaymentForOrder(
  orderId: string,
): Promise<Payment | null> {
  try {
    const { tables } = await createAdminClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_PAYMENTS,
      queries: [Query.equal("orderId", orderId), Query.limit(1)],
    });
    const row = result.rows[0];
    if (!row) return null;
    return asPayment(row as unknown as Record<string, unknown>);
  } catch (error) {
    logError("cod.loadPayment", error, { orderId });
    return null;
  }
}

async function loadAdminOrderItems(orderId: string): Promise<OrderItem[]> {
  try {
    const { tables } = await createAdminClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_ORDER_ITEMS,
      queries: [Query.equal("orderId", orderId), Query.limit(100)],
    });
    const items: OrderItem[] = [];
    for (const row of result.rows) {
      const item = asOrderItem(row as unknown as Record<string, unknown>);
      if (item) items.push(item);
    }
    return items;
  } catch (error) {
    logError("cod.loadItems", error, { orderId });
    return [];
  }
}

async function applyCodAcceptance(params: {
  orderId: string;
  paymentId: string;
  updateOrder: boolean;
  markPaymentPaid: boolean;
}): Promise<void> {
  const { tables } = await createAdminClient();
  const tx = await tables.createTransaction({ ttl: 120 });
  const transactionId = tx.$id;
  const idempotencyKey = codConfirmIdempotencyKey(params.orderId);

  if (params.updateOrder) {
    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_ORDERS,
      rowId: params.orderId,
      data: { status: params.markPaymentPaid ? "paid" : "processing" },
      transactionId,
    });
  }

  await tables.updateRow({
    databaseId: DATABASE_ID,
    tableId: TABLE_PAYMENTS,
    rowId: params.paymentId,
    data: params.markPaymentPaid
      ? { status: "paid", idempotencyKey }
      : { idempotencyKey },
    transactionId,
  });

  await tables.updateTransaction({
    transactionId,
    commit: true,
  });
}

function alreadyAccepted(order: Order, payment: Payment): boolean {
  if (payment.status === "paid") return true;
  return (
    payment.status === "pending" &&
    (order.status === "processing" ||
      order.status === "shipped" ||
      order.status === "ready_pickup" ||
      order.status === "completed")
  );
}

/**
 * Confirm a COD order: own order, method=cod, move to processing, payment stays pending.
 */
export async function confirmCodOrder(
  request: ConfirmCodOrderRequest,
): Promise<ConfirmCodOrderResult> {
  const orderId = normalizeOrderId(request.orderId);
  if (!orderId) {
    return { ok: false, error: "Invalid order id." };
  }

  if (!hasAppwritePublicConfig() || !adminSdkAvailable()) {
    return { ok: false, error: NOT_CONFIGURED };
  }

  const user = await getLoggedInUser();
  if (!user) {
    return { ok: false, error: "You must be signed in to confirm your order." };
  }

  const ip = await getClientIp();
  const limited = await assertDurableRateLimit({
    bucket: "cod-confirm",
    key: `${user.$id}:${ip}`,
    ...RATE_LIMITS.checkout,
  });
  if (!limited.ok) {
    return { ok: false, error: RATE_LIMIT_MESSAGE };
  }

  const owned = await getOwnOrder(orderId);
  if (!owned || owned.buyerId !== user.$id) {
    return { ok: false, error: COD_CONFIRM_NOT_FOUND };
  }

  const [order, payment, items] = await Promise.all([
    loadAdminOrder(orderId),
    loadAdminPaymentForOrder(orderId),
    loadAdminOrderItems(orderId),
  ]);

  if (!order || !payment) {
    return { ok: false, error: COD_CONFIRM_NOT_FOUND };
  }

  const decision = evaluateCodConfirm({
    buyerId: user.$id,
    order,
    payment,
    items,
  });

  if (decision.action === "reject") {
    return { ok: false, error: decision.error };
  }

  if (decision.action === "noop") {
    return { ok: true };
  }

  const updateOrder =
    decision.action === "accept" ||
    (decision.action === "repair" && decision.repairOrder);
  const markPaymentPaid = decision.action === "repair" && payment.status === "paid";

  try {
    await applyCodAcceptance({
      orderId: order.$id,
      paymentId: payment.$id,
      updateOrder,
      markPaymentPaid,
    });
    if (decision.action === "accept") {
      await notifyCodAccepted({
        orderId: order.$id,
        buyerId: order.buyerId,
        sellerId: order.sellerId,
      });
    }
    return { ok: true };
  } catch (error) {
    logError("cod.confirm", error, { orderId });
    const [refreshedOrder, refreshedPayment] = await Promise.all([
      loadAdminOrder(orderId),
      loadAdminPaymentForOrder(orderId),
    ]);
    if (
      refreshedOrder &&
      refreshedPayment &&
      alreadyAccepted(refreshedOrder, refreshedPayment)
    ) {
      return { ok: true };
    }
    return { ok: false, error: GENERIC_FAILURE };
  }
}
