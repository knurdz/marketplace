"use server";

/**
 * Free order confirmation (Member 1 step 1.24).
 * Session + IDOR + DB amounts; admin SDK writes `paid` + stock once.
 * Never calls PayHere. See docs/agent/PAYHERE.md.
 */

import { Query } from "node-appwrite";
import {
  DATABASE_ID,
  TABLE_ORDER_ITEMS,
  TABLE_ORDERS,
  TABLE_PAYMENTS,
  TABLE_PRODUCTS,
  hasAppwritePublicConfig,
} from "@/lib/appwrite/config";
import { createAdminClient } from "@/lib/appwrite/server";
import { getLoggedInUser } from "@/lib/appwrite/session";
import {
  assertRateLimit,
  getClientIp,
  RATE_LIMIT_MESSAGE,
  RATE_LIMITS,
} from "@/lib/security/rate-limit";
import type { Order, OrderItem, Payment } from "@/lib/types";
import type {
  ConfirmFreeOrderRequest,
  ConfirmFreeOrderResult,
} from "@/lib/types/payhere";
import {
  evaluateFreeConfirm,
  FREE_CONFIRM_NOT_FOUND,
  FREE_CONFIRM_STOCK,
  freeConfirmIdempotencyKey,
} from "./free-order-rules";
import { asOrder, asOrderItem, asPayment, getOwnOrder } from "./orders";
import { asProduct, clampedStockDecrement } from "./products";

const ORDER_ID_MAX = 36;
const NOT_CONFIGURED =
  "Free order confirmation is not configured yet." as const;
const GENERIC_FAILURE =
  "Unable to confirm this order. Please try again later." as const;

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
  } catch {
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
  } catch {
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
  } catch {
    return [];
  }
}

type StockPlan = { productId: string; decrement: number };

async function planStockDecrements(
  items: OrderItem[],
): Promise<{ ok: true; plans: StockPlan[] } | { ok: false; error: string }> {
  const qtyByProduct = new Map<string, number>();
  for (const item of items) {
    qtyByProduct.set(
      item.productId,
      (qtyByProduct.get(item.productId) ?? 0) + item.quantity,
    );
  }

  try {
    const { tables } = await createAdminClient();
    const plans: StockPlan[] = [];

    for (const [productId, quantity] of qtyByProduct) {
      let product;
      try {
        const row = await tables.getRow({
          databaseId: DATABASE_ID,
          tableId: TABLE_PRODUCTS,
          rowId: productId,
        });
        product = asProduct(row as unknown as Record<string, unknown>);
      } catch {
        product = null;
      }

      if (!product || product.stock < quantity) {
        return { ok: false, error: FREE_CONFIRM_STOCK };
      }

      plans.push({
        productId: product.$id,
        decrement: clampedStockDecrement(product.stock, quantity),
      });
    }

    return { ok: true, plans };
  } catch {
    return { ok: false, error: GENERIC_FAILURE };
  }
}

async function applyPaidSettlement(params: {
  orderId: string;
  paymentId: string;
  plans: StockPlan[];
  updateOrder: boolean;
  updatePayment: boolean;
  decrementStock: boolean;
}): Promise<void> {
  const { tables } = await createAdminClient();
  const tx = await tables.createTransaction({ ttl: 120 });
  const transactionId = tx.$id;
  const idempotencyKey = freeConfirmIdempotencyKey(params.orderId);

  if (params.updatePayment) {
    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PAYMENTS,
      rowId: params.paymentId,
      data: {
        status: "paid",
        idempotencyKey,
      },
      transactionId,
    });
  }

  if (params.updateOrder) {
    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_ORDERS,
      rowId: params.orderId,
      data: { status: "paid" },
      transactionId,
    });
  }

  if (params.decrementStock) {
    for (const plan of params.plans) {
      if (plan.decrement <= 0) continue;
      await tables.decrementRowColumn({
        databaseId: DATABASE_ID,
        tableId: TABLE_PRODUCTS,
        rowId: plan.productId,
        column: "stock",
        value: plan.decrement,
        min: 0,
        transactionId,
      });
    }
  }

  await tables.updateTransaction({
    transactionId,
    commit: true,
  });
}

async function paymentAlreadyPaid(orderId: string): Promise<boolean> {
  const payment = await loadAdminPaymentForOrder(orderId);
  return payment?.status === "paid";
}

/**
 * Confirm a free order: own order, method=free, DB amount 0, mark paid once.
 */
export async function confirmFreeOrder(
  request: ConfirmFreeOrderRequest,
): Promise<ConfirmFreeOrderResult> {
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
  const limited = assertRateLimit({
    bucket: "free-confirm",
    key: `${user.$id}:${ip}`,
    ...RATE_LIMITS.checkout,
  });
  if (!limited.ok) {
    return { ok: false, error: RATE_LIMIT_MESSAGE };
  }

  // Session-scoped ownership check first (IDOR: other buyers see not found).
  const owned = await getOwnOrder(orderId);
  if (!owned || owned.buyerId !== user.$id) {
    return { ok: false, error: FREE_CONFIRM_NOT_FOUND };
  }

  const [order, payment, items] = await Promise.all([
    loadAdminOrder(orderId),
    loadAdminPaymentForOrder(orderId),
    loadAdminOrderItems(orderId),
  ]);

  if (!order || !payment) {
    return { ok: false, error: FREE_CONFIRM_NOT_FOUND };
  }

  const decision = evaluateFreeConfirm({
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

  let plans: StockPlan[] = [];
  const decrementStock = decision.action === "settle";
  const updateOrder =
    decision.action === "settle" ||
    (decision.action === "repair" && decision.repairOrder);
  const updatePayment =
    decision.action === "settle" ||
    (decision.action === "repair" && decision.repairPayment);

  if (decrementStock) {
    const stock = await planStockDecrements(items);
    if (!stock.ok) {
      return { ok: false, error: stock.error };
    }
    plans = stock.plans;
  }

  try {
    await applyPaidSettlement({
      orderId: order.$id,
      paymentId: payment.$id,
      plans,
      updateOrder,
      updatePayment,
      decrementStock,
    });
    return { ok: true };
  } catch {
    if (await paymentAlreadyPaid(orderId)) {
      return { ok: true };
    }
    return { ok: false, error: GENERIC_FAILURE };
  }
}
