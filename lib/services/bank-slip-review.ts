import { AppwriteException, ID, Query } from "node-appwrite";
import {
  DATABASE_ID,
  TABLE_AUDIT_LOGS,
  TABLE_BANK_SLIPS,
  TABLE_ORDER_ITEMS,
  TABLE_ORDERS,
  TABLE_PAYMENTS,
  TABLE_PRODUCTS,
  hasAppwritePublicConfig,
} from "@/lib/appwrite/config";
import { requireLabel } from "@/lib/appwrite/roles";
import { createAdminClient } from "@/lib/appwrite/server";
import type { BankSlip, OrderItem } from "@/lib/types";
import { asProduct, clampedStockDecrement } from "./products";
import {
  asBankSlip,
  asOrder,
  asOrderItem,
  asPayment,
} from "./orders";

export { asBankSlip } from "./orders";

const MAX_REVIEW_NOTE_LENGTH = 500;
const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

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
      oversoldWarnings?: string[];
    }
  | { ok: false; error: string };

type StockDecrementPlan = {
  productId: string;
  title: string;
  requestedQty: number;
  stockBefore: number;
  actualDecrement: number;
  clamped: boolean;
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

async function planStockDecrements(
  items: OrderItem[],
): Promise<StockDecrementPlan[]> {
  const { tables } = await createAdminClient();
  const plans: StockDecrementPlan[] = [];

  for (const item of items) {
    let stockBefore = 0;
    try {
      const row = await tables.getRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_PRODUCTS,
        rowId: item.productId,
      });
      const product = asProduct(row as unknown as Record<string, unknown>);
      stockBefore = product?.stock ?? 0;
    } catch {
      stockBefore = 0;
    }

    const actualDecrement = clampedStockDecrement(stockBefore, item.quantity);
    plans.push({
      productId: item.productId,
      title: item.title,
      requestedQty: item.quantity,
      stockBefore,
      actualDecrement,
      clamped: stockBefore < item.quantity,
    });
  }

  return plans;
}

function oversoldWarningsFromPlans(plans: StockDecrementPlan[]): string[] {
  return plans
    .filter((p) => p.clamped)
    .map(
      (p) =>
        `"${p.title}": ordered ${p.requestedQty}, stock was ${p.stockBefore} — decremented ${p.actualDecrement} (clamped at 0).`,
    );
}

async function isAlreadyProcessed(
  bankSlipId: string,
): Promise<{ already: true; message: string } | { already: false }> {
  const slip = await loadBankSlip(bankSlipId);
  if (!slip) {
    return { already: false };
  }

  if (slip.status !== "pending") {
    return {
      already: true,
      message:
        slip.status === "approved"
          ? "This bank slip was already approved."
          : "This bank slip was already rejected.",
    };
  }

  try {
    const { tables } = await createAdminClient();
    const paymentRow = await tables.getRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PAYMENTS,
      rowId: slip.paymentId,
    });
    const payment = asPayment(paymentRow as unknown as Record<string, unknown>);
    if (payment?.status === "paid") {
      return {
        already: true,
        message: "Payment was already marked paid.",
      };
    }
  } catch {
    // fall through to process
  }

  return { already: false };
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

        const payment = asPayment(paymentRow as unknown as Record<string, unknown>);
        if (payment) {
          paymentAmount = payment.amount;
          paymentCurrency = payment.currency;
        }

        const order = asOrder(orderRow as unknown as Record<string, unknown>);
        if (order) {
          buyerId = order.buyerId;
        }
      } catch {
        // keep defaults
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
 * Approve a pending bank slip: payment paid, order paid, stock decremented once.
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

  const already = await isAlreadyProcessed(trimmedId);
  if (already.already) {
    return {
      ok: true,
      message: already.message,
      alreadyReviewed: true,
    };
  }

  const slip = await loadBankSlip(trimmedId);
  if (!slip) {
    return { ok: false, error: "Bank slip not found." };
  }

  if (slip.status !== "pending") {
    return {
      ok: true,
      message: "This bank slip was already reviewed.",
      alreadyReviewed: true,
    };
  }

  const { tables } = await createAdminClient();

  let payment;
  try {
    const paymentRow = await tables.getRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PAYMENTS,
      rowId: slip.paymentId,
    });
    payment = asPayment(paymentRow as unknown as Record<string, unknown>);
  } catch {
    return { ok: false, error: "Payment not found." };
  }

  if (!payment) {
    return { ok: false, error: "Payment not found." };
  }

  if (payment.status === "paid") {
    return {
      ok: true,
      message: "Payment was already marked paid.",
      alreadyReviewed: true,
    };
  }

  if (payment.method !== "bank_transfer") {
    return { ok: false, error: "Payment is not a bank transfer." };
  }

  const items = await loadOrderItems(slip.orderId);
  if (items.length === 0) {
    return { ok: false, error: "Order has no items." };
  }

  const stockPlans = await planStockDecrements(items);
  const oversoldWarnings = oversoldWarningsFromPlans(stockPlans);

  const auditRowId = ID.unique();
  const productsDecrementedMeta = JSON.stringify(
    stockPlans.map((p) => ({
      productId: p.productId,
      requestedQty: p.requestedQty,
      decremented: p.actualDecrement,
      stockBefore: p.stockBefore,
      clamped: p.clamped,
    })),
  );

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

    for (const plan of stockPlans) {
      if (plan.actualDecrement <= 0) continue;
      await tables.decrementRowColumn({
        databaseId: DATABASE_ID,
        tableId: TABLE_PRODUCTS,
        rowId: plan.productId,
        column: "stock",
        value: plan.actualDecrement,
        min: 0,
        transactionId,
      });
    }

    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_ORDERS,
      rowId: slip.orderId,
      data: { status: "paid" },
      transactionId,
    });

    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PAYMENTS,
      rowId: slip.paymentId,
      data: { status: "paid" },
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
        resourceId: slip.orderId,
        meta: JSON.stringify({
          bankSlipId: slip.$id,
          paymentId: slip.paymentId,
          productsDecremented: productsDecrementedMeta,
          oversoldCount: String(oversoldWarnings.length),
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
    const retry = await isAlreadyProcessed(trimmedId);
    if (retry.already) {
      return {
        ok: true,
        message: retry.message,
        alreadyReviewed: true,
      };
    }

    const message =
      error instanceof AppwriteException
        ? error.message
        : "Failed to approve bank slip.";
    return { ok: false, error: message };
  }

  let message = "Bank slip approved. Payment and order marked paid.";
  if (oversoldWarnings.length > 0) {
    message += ` Warning: ${oversoldWarnings.length} product(s) had insufficient stock.`;
  }

  return {
    ok: true,
    message,
    oversoldWarnings:
      oversoldWarnings.length > 0 ? oversoldWarnings : undefined,
  };
}

/**
 * Reject a pending bank slip: payment failed; no order/stock changes.
 * Idempotent: already-rejected → safe no-op.
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

  const slip = await loadBankSlip(trimmedId);
  if (!slip) {
    return { ok: false, error: "Bank slip not found." };
  }

  if (slip.status === "rejected") {
    return {
      ok: true,
      message: "This bank slip was already rejected.",
      alreadyReviewed: true,
    };
  }

  if (slip.status === "approved") {
    return {
      ok: true,
      message: "This bank slip was already approved.",
      alreadyReviewed: true,
    };
  }

  if (slip.status !== "pending") {
    return {
      ok: true,
      message: "This bank slip was already reviewed.",
      alreadyReviewed: true,
    };
  }

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
      rowId: slip.paymentId,
      data: { status: "failed" },
      transactionId,
    });

    await tables.createRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_AUDIT_LOGS,
      rowId: auditRowId,
      data: {
        actorId: adminUserId,
        event: "bank_slip.rejected",
        resourceType: "order",
        resourceId: slip.orderId,
        meta: JSON.stringify({
          bankSlipId: slip.$id,
          paymentId: slip.paymentId,
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
    const retrySlip = await loadBankSlip(trimmedId);
    if (retrySlip && retrySlip.status !== "pending") {
      return {
        ok: true,
        message:
          retrySlip.status === "rejected"
            ? "This bank slip was already rejected."
            : "This bank slip was already reviewed.",
        alreadyReviewed: true,
      };
    }

    const message =
      error instanceof AppwriteException
        ? error.message
        : "Failed to reject bank slip.";
    return { ok: false, error: message };
  }

  return { ok: true, message: "Bank slip rejected. Payment marked failed." };
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
