import { AppwriteException, ID, Query } from "node-appwrite";
import {
  DATABASE_ID,
  TABLE_AUDIT_LOGS,
  TABLE_BANK_SLIPS,
  TABLE_ORDER_ITEMS,
  TABLE_ORDERS,
  TABLE_PAYMENTS,
  hasAppwritePublicConfig,
} from "@/lib/appwrite/config";
import { requireLabel } from "@/lib/appwrite/roles";
import { createAdminClient } from "@/lib/appwrite/server";
import { logError } from "@/lib/observability/log-error";
import type { BankSlip, Order, OrderItem, Payment } from "@/lib/types";
import {
  bankConfirmIdempotencyKey,
  evaluateBankSlipApprove,
  evaluateBankSlipReject,
  evaluateBankSlipRejectAndCancel,
  shouldListPendingBankSlip,
} from "./bank-slip-review-rules";
import {
  notifyBankSlipRejected,
  notifyOrderPaid,
} from "./order-notify";
import { restoreStockForLines } from "./stock";
import {
  asBankSlip,
  asOrder,
  asOrderItem,
  asPayment,
} from "./orders";

export { asBankSlip } from "./orders";
export {
  bankConfirmIdempotencyKey,
  evaluateBankSlipApprove,
  evaluateBankSlipReject,
  evaluateBankSlipRejectAndCancel,
  shouldListPendingBankSlip,
} from "./bank-slip-review-rules";

const MAX_REVIEW_NOTE_LENGTH = 500;
const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;
const SUPERSEDED_REVIEW_NOTE =
  "Superseded: another slip for this payment was approved.";

export type PendingBankSlipView = {
  slip: BankSlip;
  uploadedAt: string;
  paymentAmount: number;
  paymentCurrency: string;
  buyerId: string;
};

export type ListPendingBankSlipsResult = {
  slips: PendingBankSlipView[];
  nextCursor: string | null;
};

export type BankSlipReviewResult =
  | {
      ok: true;
      message: string;
      alreadyReviewed?: boolean;
    }
  | { ok: false; error: string };

type ReviewContext = {
  slip: BankSlip;
  payment: Payment;
  order: Order;
};

function adminSdkAvailable(): boolean {
  return hasAppwritePublicConfig() && Boolean(process.env.APPWRITE_API_KEY?.trim());
}

function clampLimit(raw?: number): number {
  return Math.min(Math.max(raw ?? DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);
}

function asNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return value.length > 0 ? value : null;
}

function parseReviewNote(note: string): string | BankSlipReviewResult {
  const trimmed = note.trim();
  if (!trimmed) {
    return { ok: false, error: "Review note is required." };
  }
  if (trimmed.length > MAX_REVIEW_NOTE_LENGTH) {
    return {
      ok: false,
      error: `Review note must be at most ${MAX_REVIEW_NOTE_LENGTH} characters.`,
    };
  }
  return trimmed;
}

async function loadBankSlip(bankSlipId: string): Promise<BankSlip | null> {
  const trimmed = bankSlipId?.trim();
  if (!trimmed) return null;

  try {
    const { tables } = await createAdminClient();
    const row = await tables.getRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_BANK_SLIPS,
      rowId: trimmed,
    });
    return asBankSlip(row as unknown as Record<string, unknown>);
  } catch {
    return null;
  }
}

async function loadPayment(paymentId: string): Promise<Payment | null> {
  try {
    const { tables } = await createAdminClient();
    const row = await tables.getRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PAYMENTS,
      rowId: paymentId,
    });
    return asPayment(row as unknown as Record<string, unknown>);
  } catch {
    return null;
  }
}

async function loadOrder(orderId: string): Promise<Order | null> {
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

async function loadReviewContext(
  bankSlipId: string,
): Promise<{ ok: true; ctx: ReviewContext } | { ok: false; error: string }> {
  const slip = await loadBankSlip(bankSlipId);
  if (!slip) {
    return { ok: false, error: "Bank slip not found." };
  }

  const [payment, order] = await Promise.all([
    loadPayment(slip.paymentId),
    loadOrder(slip.orderId),
  ]);

  if (!payment) {
    return { ok: false, error: "Payment not found." };
  }
  if (!order) {
    return { ok: false, error: "Order not found." };
  }

  return { ok: true, ctx: { slip, payment, order } };
}

async function loadOrderItems(orderId: string): Promise<OrderItem[]> {
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
}

async function listSiblingPendingSlipIds(
  paymentId: string,
  exceptSlipId: string,
): Promise<string[]> {
  try {
    const { tables } = await createAdminClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_BANK_SLIPS,
      queries: [
        Query.equal("paymentId", paymentId),
        Query.equal("status", "pending"),
        Query.limit(100),
      ],
    });

    const ids: string[] = [];
    for (const row of result.rows) {
      const id = typeof row.$id === "string" ? row.$id : "";
      if (id && id !== exceptSlipId) ids.push(id);
    }
    return ids;
  } catch {
    return [];
  }
}

function approveConflictResult(
  loaded: { ok: true; ctx: ReviewContext } | { ok: false; error: string },
): BankSlipReviewResult | null {
  if (!loaded.ok) return null;
  const decision = evaluateBankSlipApprove(loaded.ctx);
  if (decision.action === "noop") {
    return {
      ok: true,
      message: decision.message,
      alreadyReviewed: true,
    };
  }
  return null;
}

function rejectConflictResult(
  loaded: { ok: true; ctx: ReviewContext } | { ok: false; error: string },
): BankSlipReviewResult | null {
  if (!loaded.ok) return null;
  const decision = evaluateBankSlipReject(loaded.ctx);
  if (decision.action === "noop") {
    return {
      ok: true,
      message: decision.message,
      alreadyReviewed: true,
    };
  }
  if (decision.action === "refuse") {
    return { ok: false, error: decision.error };
  }
  return null;
}

/** Relative admin-only URL for slip image (proxy re-checks auth). */
export async function getBankSlipReviewUrl(fileId: string): Promise<string> {
  await requireLabel("admin");
  const trimmed = fileId?.trim();
  if (!trimmed) {
    throw new Error("Missing file id.");
  }
  return `/api/admin/bank-slips/${encodeURIComponent(trimmed)}`;
}

/** Admin-scoped pending bank slip queue with payment/order context. */
export async function listPendingBankSlips(opts?: {
  limit?: number;
  cursor?: string;
}): Promise<ListPendingBankSlipsResult> {
  await requireLabel("admin");
  if (!adminSdkAvailable()) {
    return { slips: [], nextCursor: null };
  }

  const limit = clampLimit(opts?.limit);
  const cursor = opts?.cursor?.trim() || undefined;
  const queries = [
    Query.equal("status", "pending"),
    Query.orderDesc("$createdAt"),
    Query.limit(limit),
  ];
  if (cursor) {
    queries.push(Query.cursorAfter(cursor));
  }

  try {
    const { tables } = await createAdminClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_BANK_SLIPS,
      queries,
    });

    const slips: PendingBankSlipView[] = [];

    for (const row of result.rows) {
      const slip = asBankSlip(row as unknown as Record<string, unknown>);
      if (!slip) continue;

      const uploadedAt = asNullableString(row.$createdAt) ?? "";

      let payment: Payment | null = null;
      let order: Order | null = null;
      let paymentAmount = 0;
      let paymentCurrency = "LKR";
      let buyerId = slip.uploadedBy;

      try {
        const [paymentRow, orderRow] = await Promise.all([
          tables.getRow({
            databaseId: DATABASE_ID,
            tableId: TABLE_PAYMENTS,
            rowId: slip.paymentId,
          }),
          tables.getRow({
            databaseId: DATABASE_ID,
            tableId: TABLE_ORDERS,
            rowId: slip.orderId,
          }),
        ]);

        payment = asPayment(paymentRow as unknown as Record<string, unknown>);
        if (payment) {
          paymentAmount = payment.amount;
          paymentCurrency = payment.currency;
        }

        order = asOrder(orderRow as unknown as Record<string, unknown>);
        if (order) {
          buyerId = order.buyerId;
        }
      } catch {
        // skip unverifiable leftovers
      }

      if (!shouldListPendingBankSlip({ slip, payment, order })) {
        continue;
      }

      slips.push({
        slip,
        uploadedAt,
        paymentAmount,
        paymentCurrency,
        buyerId,
      });
    }

    const lastRow = result.rows[result.rows.length - 1];
    const nextCursor =
      result.rows.length === limit && lastRow?.$id
        ? String(lastRow.$id)
        : null;

    return { slips, nextCursor };
  } catch {
    return { slips: [], nextCursor: null };
  }
}

/**
 * Approve a pending bank slip: payment paid, order paid.
 * Idempotent: already-reviewed or already-paid payment → safe no-op.
 */
export async function approveBankSlipCore(
  adminUserId: string,
  bankSlipId: string,
): Promise<BankSlipReviewResult> {
  if (!adminSdkAvailable()) {
    return { ok: false, error: "Admin backend is not configured." };
  }

  const trimmedId = bankSlipId?.trim();
  if (!trimmedId) {
    return { ok: false, error: "Missing bank slip." };
  }

  const loaded = await loadReviewContext(trimmedId);
  if (!loaded.ok) return loaded;

  const decision = evaluateBankSlipApprove(loaded.ctx);
  if (decision.action === "refuse") {
    return { ok: false, error: decision.error };
  }
  if (decision.action === "noop") {
    return {
      ok: true,
      message: decision.message,
      alreadyReviewed: true,
    };
  }

  const { slip, payment, order } = loaded.ctx;
  const items = await loadOrderItems(slip.orderId);
  if (items.length === 0) {
    return { ok: false, error: "Order has no items." };
  }

  const siblingIds = await listSiblingPendingSlipIds(payment.$id, slip.$id);

  const { tables } = await createAdminClient();
  const auditRowId = ID.unique();

  try {
    const tx = await tables.createTransaction({ ttl: 120 });
    const transactionId = tx.$id;

    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_BANK_SLIPS,
      rowId: slip.$id,
      data: {
        status: "approved",
        reviewedBy: adminUserId,
      },
      transactionId,
    });

    for (const siblingId of siblingIds) {
      await tables.updateRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_BANK_SLIPS,
        rowId: siblingId,
        data: {
          status: "rejected",
          reviewedBy: adminUserId,
          reviewNote: SUPERSEDED_REVIEW_NOTE,
        },
        transactionId,
      });
    }

    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_ORDERS,
      rowId: order.$id,
      data: { status: "paid" },
      transactionId,
    });

    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PAYMENTS,
      rowId: payment.$id,
      data: {
        status: "paid",
        idempotencyKey: bankConfirmIdempotencyKey(order.$id),
      },
      transactionId,
    });

    await tables.createRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_AUDIT_LOGS,
      rowId: auditRowId,
      data: {
        actorId: adminUserId,
        event: "bank_slip.approved",
        resourceType: "order",
        resourceId: order.$id,
        meta: JSON.stringify({
          bankSlipId: slip.$id,
          paymentId: payment.$id,
          supersededSlipCount: String(siblingIds.length),
        }).slice(0, 4000),
      },
      permissions: [],
      transactionId,
    });

    await tables.updateTransaction({
      transactionId,
      commit: true,
    });
  } catch (error) {
    logError("bank-slip.approve", error, { bankSlipId: trimmedId });
    const retry = approveConflictResult(await loadReviewContext(trimmedId));
    if (retry) return retry;

    const message =
      error instanceof AppwriteException
        ? error.message
        : "Failed to approve bank slip.";
    return { ok: false, error: message };
  }

  await notifyOrderPaid({
    orderId: order.$id,
    buyerId: order.buyerId,
    sellerId: order.sellerId,
  });

  return {
    ok: true,
    message: "Bank slip approved. Payment and order marked paid.",
  };
}

/**
 * Reject a pending bank slip and reopen the order so the buyer can re-upload.
 * Idempotent: already-rejected → safe no-op. Never overwrites paid/refunded.
 * Does not restore stock (order is still open).
 */
export async function rejectBankSlipCore(
  adminUserId: string,
  bankSlipId: string,
  reviewNote: string,
): Promise<BankSlipReviewResult> {
  if (!adminSdkAvailable()) {
    return { ok: false, error: "Admin backend is not configured." };
  }

  const parsedNote = parseReviewNote(reviewNote);
  if (typeof parsedNote !== "string") return parsedNote;

  const trimmedId = bankSlipId?.trim();
  if (!trimmedId) {
    return { ok: false, error: "Missing bank slip." };
  }

  const loaded = await loadReviewContext(trimmedId);
  if (!loaded.ok) return loaded;

  const decision = evaluateBankSlipReject(loaded.ctx);
  if (decision.action === "refuse") {
    return { ok: false, error: decision.error };
  }
  if (decision.action === "noop") {
    return {
      ok: true,
      message: decision.message,
      alreadyReviewed: true,
    };
  }

  const { slip, payment, order } = loaded.ctx;
  const reopen = decision.action === "reopen";
  const { tables } = await createAdminClient();
  const auditRowId = ID.unique();

  try {
    const tx = await tables.createTransaction({ ttl: 120 });
    const transactionId = tx.$id;

    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_BANK_SLIPS,
      rowId: slip.$id,
      data: {
        status: "rejected",
        reviewedBy: adminUserId,
        reviewNote: parsedNote,
      },
      transactionId,
    });

    if (reopen) {
      await tables.updateRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_PAYMENTS,
        rowId: payment.$id,
        data: { status: "pending" },
        transactionId,
      });
      await tables.updateRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_ORDERS,
        rowId: order.$id,
        data: { status: "pending_payment" },
        transactionId,
      });
    }

    await tables.createRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_AUDIT_LOGS,
      rowId: auditRowId,
      data: {
        actorId: adminUserId,
        event: "bank_slip.rejected",
        resourceType: "order",
        resourceId: order.$id,
        meta: JSON.stringify({
          bankSlipId: slip.$id,
          paymentId: payment.$id,
          reviewNote: parsedNote,
          reopened: String(reopen),
        }).slice(0, 4000),
      },
      permissions: [],
      transactionId,
    });

    await tables.updateTransaction({
      transactionId,
      commit: true,
    });
  } catch (error) {
    logError("bank-slip.reject", error, { bankSlipId: trimmedId });
    const retry = rejectConflictResult(await loadReviewContext(trimmedId));
    if (retry) return retry;

    const message =
      error instanceof AppwriteException
        ? error.message
        : "Failed to reject bank slip.";
    return { ok: false, error: message };
  }

  await notifyBankSlipRejected({
    orderId: order.$id,
    buyerId: order.buyerId,
    cancelled: false,
  });

  return {
    ok: true,
    message: reopen
      ? "Bank slip rejected. Buyer can upload a new slip."
      : "Bank slip rejected.",
  };
}

/**
 * Reject the slip and cancel the order (no retry). Restores reserved stock.
 */
export async function rejectAndCancelBankSlipCore(
  adminUserId: string,
  bankSlipId: string,
  reviewNote: string,
): Promise<BankSlipReviewResult> {
  if (!adminSdkAvailable()) {
    return { ok: false, error: "Admin backend is not configured." };
  }

  const parsedNote = parseReviewNote(reviewNote);
  if (typeof parsedNote !== "string") return parsedNote;

  const trimmedId = bankSlipId?.trim();
  if (!trimmedId) {
    return { ok: false, error: "Missing bank slip." };
  }

  const loaded = await loadReviewContext(trimmedId);
  if (!loaded.ok) return loaded;

  const decision = evaluateBankSlipRejectAndCancel(loaded.ctx);
  if (decision.action === "refuse") {
    return { ok: false, error: decision.error };
  }
  if (decision.action === "noop") {
    return {
      ok: true,
      message: decision.message,
      alreadyReviewed: true,
    };
  }

  const { slip, payment, order } = loaded.ctx;
  const items = await loadOrderItems(order.$id);
  const { tables } = await createAdminClient();
  const auditRowId = ID.unique();

  try {
    const tx = await tables.createTransaction({ ttl: 120 });
    const transactionId = tx.$id;

    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_BANK_SLIPS,
      rowId: slip.$id,
      data: {
        status: "rejected",
        reviewedBy: adminUserId,
        reviewNote: parsedNote,
      },
      transactionId,
    });

    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PAYMENTS,
      rowId: payment.$id,
      data: { status: "failed" },
      transactionId,
    });

    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_ORDERS,
      rowId: order.$id,
      data: { status: "cancelled" },
      transactionId,
    });

    await restoreStockForLines(tables, items, transactionId);

    await tables.createRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_AUDIT_LOGS,
      rowId: auditRowId,
      data: {
        actorId: adminUserId,
        event: "bank_slip.rejected_cancelled",
        resourceType: "order",
        resourceId: order.$id,
        meta: JSON.stringify({
          bankSlipId: slip.$id,
          paymentId: payment.$id,
          reviewNote: parsedNote,
        }).slice(0, 4000),
      },
      permissions: [],
      transactionId,
    });

    await tables.updateTransaction({
      transactionId,
      commit: true,
    });
  } catch (error) {
    logError("bank-slip.reject-cancel", error, { bankSlipId: trimmedId });
    return { ok: false, error: "Failed to reject and cancel this order." };
  }

  await notifyBankSlipRejected({
    orderId: order.$id,
    buyerId: order.buyerId,
    cancelled: true,
  });

  return {
    ok: true,
    message: "Bank slip rejected and order cancelled.",
  };
}

/** Confirm a bank_slips row references this fileId (defense-in-depth for proxy). */
export async function bankSlipFileExists(fileId: string): Promise<boolean> {
  if (!adminSdkAvailable()) return false;
  const trimmed = fileId?.trim();
  if (!trimmed) return false;

  try {
    const { tables } = await createAdminClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_BANK_SLIPS,
      queries: [Query.equal("fileId", trimmed), Query.limit(1)],
    });
    return result.rows.length > 0;
  } catch {
    return false;
  }
}
