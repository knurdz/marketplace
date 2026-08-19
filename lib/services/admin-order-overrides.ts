import { ID, Query } from "node-appwrite";
import {
  DATABASE_ID,
  TABLE_AUDIT_LOGS,
  TABLE_ORDERS,
  TABLE_PAYMENTS,
  hasAppwritePublicConfig,
} from "@/lib/appwrite/config";
import { requireLabel } from "@/lib/appwrite/roles";
import { createAdminClient } from "@/lib/appwrite/server";
import {
  canAdminCancelOrder,
  canAdminRefundOrder,
  type Order,
  type Payment,
} from "@/lib/types";
import { asOrder, asPayment } from "./orders";

const MAX_REASON = 500;

export type AdminOrderOverrideResult =
  | { ok: true; message: string; alreadyApplied: boolean }
  | { ok: false; error: string };

function adminSdkAvailable(): boolean {
  return hasAppwritePublicConfig() && Boolean(process.env.APPWRITE_API_KEY?.trim());
}

function parseReason(raw: string): { ok: true; reason: string } | { ok: false; error: string } {
  const reason = raw.trim();
  if (!reason) {
    return { ok: false, error: "A reason is required." };
  }
  if (reason.length > MAX_REASON) {
    return { ok: false, error: `Reason must be ${MAX_REASON} characters or fewer.` };
  }
  return { ok: true, reason };
}

async function writeAuditLog(params: {
  actorId: string;
  event: string;
  resourceType: string;
  resourceId: string;
  meta: Record<string, string>;
}): Promise<void> {
  const { tables } = await createAdminClient();
  await tables.createRow({
    databaseId: DATABASE_ID,
    tableId: TABLE_AUDIT_LOGS,
    rowId: ID.unique(),
    data: {
      actorId: params.actorId,
      event: params.event.slice(0, 128),
      resourceType: params.resourceType.slice(0, 64),
      resourceId: params.resourceId,
      meta: JSON.stringify(params.meta).slice(0, 4000),
    },
    permissions: [],
  });
}

async function loadOrderAndPayment(
  orderId: string,
): Promise<{ order: Order; payment: Payment } | null> {
  const { tables } = await createAdminClient();
  let order: Order | null = null;
  try {
    const orderRow = await tables.getRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_ORDERS,
      rowId: orderId,
    });
    order = asOrder(orderRow as unknown as Record<string, unknown>);
  } catch {
    return null;
  }
  if (!order) return null;

  const paymentResult = await tables.listRows({
    databaseId: DATABASE_ID,
    tableId: TABLE_PAYMENTS,
    queries: [Query.equal("orderId", order.$id), Query.limit(1)],
  });
  const paymentRow = paymentResult.rows[0] as unknown as
    | Record<string, unknown>
    | undefined;
  if (!paymentRow) return null;
  const payment = asPayment(paymentRow);
  if (!payment) return null;
  return { order, payment };
}

/**
 * Admin cancel: unpaid early order → cancelled; payment → failed.
 * Idempotent when the order is already cancelled. No stock restore.
 */
export async function cancelAdminOrder(
  orderId: string,
  reason: string,
): Promise<AdminOrderOverrideResult> {
  const admin = await requireLabel("admin");

  if (!adminSdkAvailable()) {
    return { ok: false, error: "Admin backend is not configured." };
  }

  const trimmedId = orderId?.trim();
  if (!trimmedId) {
    return { ok: false, error: "Missing order." };
  }

  const parsed = parseReason(reason);
  if (!parsed.ok) return parsed;

  try {
    const loaded = await loadOrderAndPayment(trimmedId);
    if (!loaded) {
      return { ok: false, error: "Order not found." };
    }

    const { order, payment } = loaded;

    if (order.status === "cancelled") {
      return {
        ok: true,
        message: "This order was already cancelled.",
        alreadyApplied: true,
      };
    }

    if (!canAdminCancelOrder(order.status, payment.status)) {
      return {
        ok: false,
        error: "This order cannot be cancelled. Use refund after payment is paid.",
      };
    }

    const { tables } = await createAdminClient();
    const tx = await tables.createTransaction({ ttl: 120 });
    const transactionId = tx.$id;

    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_ORDERS,
      rowId: order.$id,
      data: { status: "cancelled" },
      transactionId,
    });

    if (payment.status !== "failed") {
      await tables.updateRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_PAYMENTS,
        rowId: payment.$id,
        data: { status: "failed" },
        transactionId,
      });
    }

    await tables.updateTransaction({ transactionId, commit: true });

    try {
      await writeAuditLog({
        actorId: admin.$id,
        event: "order.cancelled",
        resourceType: "order",
        resourceId: order.$id,
        meta: {
          fromOrderStatus: order.status,
          fromPaymentStatus: payment.status,
          paymentId: payment.$id,
          method: payment.method,
          reason: parsed.reason,
        },
      });
    } catch {
      return {
        ok: true,
        message:
          "Order cancelled but audit log failed. Please notify an operator.",
        alreadyApplied: false,
      };
    }

    return {
      ok: true,
      message: "Order cancelled.",
      alreadyApplied: false,
    };
  } catch {
    return { ok: false, error: "Could not cancel this order. Please try again." };
  }
}

/**
 * Admin refund: paid-through-completed order → refunded; payment → refunded.
 * Platform ledger only (same statuses as PayHere chargeback notify). No stock restore.
 */
export async function refundAdminOrder(
  orderId: string,
  reason: string,
): Promise<AdminOrderOverrideResult> {
  const admin = await requireLabel("admin");

  if (!adminSdkAvailable()) {
    return { ok: false, error: "Admin backend is not configured." };
  }

  const trimmedId = orderId?.trim();
  if (!trimmedId) {
    return { ok: false, error: "Missing order." };
  }

  const parsed = parseReason(reason);
  if (!parsed.ok) return parsed;

  try {
    const loaded = await loadOrderAndPayment(trimmedId);
    if (!loaded) {
      return { ok: false, error: "Order not found." };
    }

    const { order, payment } = loaded;

    if (order.status === "refunded" && payment.status === "refunded") {
      return {
        ok: true,
        message: "This order was already refunded.",
        alreadyApplied: true,
      };
    }

    if (!canAdminRefundOrder(order.status, payment.status)) {
      return {
        ok: false,
        error:
          "This order cannot be refunded. Cancel unpaid orders, or wait until payment is paid.",
      };
    }

    const { tables } = await createAdminClient();
    const tx = await tables.createTransaction({ ttl: 120 });
    const transactionId = tx.$id;

    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_ORDERS,
      rowId: order.$id,
      data: { status: "refunded" },
      transactionId,
    });

    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PAYMENTS,
      rowId: payment.$id,
      data: { status: "refunded" },
      transactionId,
    });

    await tables.updateTransaction({ transactionId, commit: true });

    try {
      await writeAuditLog({
        actorId: admin.$id,
        event: "order.refunded",
        resourceType: "order",
        resourceId: order.$id,
        meta: {
          fromOrderStatus: order.status,
          fromPaymentStatus: payment.status,
          paymentId: payment.$id,
          method: payment.method,
          reason: parsed.reason,
        },
      });
    } catch {
      return {
        ok: true,
        message:
          "Order refunded but audit log failed. Please notify an operator.",
        alreadyApplied: false,
      };
    }

    return {
      ok: true,
      message: "Order refunded on the platform ledger.",
      alreadyApplied: false,
    };
  } catch {
    return { ok: false, error: "Could not refund this order. Please try again." };
  }
}
