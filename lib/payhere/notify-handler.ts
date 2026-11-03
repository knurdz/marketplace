import { NextResponse } from "next/server";
import {
  DATABASE_ID,
  TABLE_NOTIFICATIONS,
  TABLE_ORDER_ITEMS,
  TABLE_ORDERS,
  TABLE_PAYMENTS,
  TABLE_PAYHERE_NOTIFY_LOGS,
} from "@/lib/appwrite/config";
import { createAdminClient } from "@/lib/appwrite/server";
import { AppwriteException, ID } from "@/lib/db/appwrite-shim";
import { Query } from "@/lib/db/query";
import { restoreStockForLines } from "@/lib/services/stock";
import { notifyLogRowFromDecision } from "@/lib/services/notify-log-redact";
import { parseNotifyForm } from "./md5";
import { decideNotifyAction, verifyNotifySignature } from "./notify-decision";

const OPEN_PAYMENT_STATUSES = ["pending", "awaiting_verification", "failed"];

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

async function loadOrderPaymentItems(
  tables: Awaited<ReturnType<typeof createAdminClient>>["tables"],
  orderId: string,
) {
  let orderRow: Record<string, unknown>;
  try {
    orderRow = await tables.getRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_ORDERS,
      rowId: orderId,
    });
  } catch {
    return { order: null, payment: null, items: [] };
  }

  const order = {
    $id: String(orderRow.$id),
    buyerId: String(orderRow.buyerId ?? ""),
    sellerId: String(orderRow.sellerId ?? ""),
    status: String(orderRow.status ?? ""),
    totalAmount: asNumber(orderRow.totalAmount),
    currency: String(orderRow.currency ?? ""),
    paymentMethod: String(orderRow.paymentMethod ?? ""),
  };

  const paymentResult = await tables.listRows({
    databaseId: DATABASE_ID,
    tableId: TABLE_PAYMENTS,
    queries: [Query.equal("orderId", orderId), Query.limit(1)],
  });
  const paymentRow = paymentResult.rows[0];
  if (!paymentRow) {
    return { order, payment: null, items: [] };
  }

  const payment = {
    $id: String(paymentRow.$id),
    orderId: String(paymentRow.orderId ?? ""),
    method: String(paymentRow.method ?? ""),
    status: String(paymentRow.status ?? ""),
    amount: asNumber(paymentRow.amount),
    currency: String(paymentRow.currency ?? ""),
  };

  const itemsResult = await tables.listRows({
    databaseId: DATABASE_ID,
    tableId: TABLE_ORDER_ITEMS,
    queries: [Query.equal("orderId", orderId), Query.limit(100)],
  });
  const items = itemsResult.rows.map((row) => ({
    productId: String(row.productId ?? ""),
    quantity: Math.max(1, Math.floor(asNumber(row.quantity, 1))),
  }));

  return { order, payment, items };
}

async function persistNotifyLog(
  tables: Awaited<ReturnType<typeof createAdminClient>>["tables"],
  row: Record<string, unknown> | null,
) {
  if (!row) return;
  try {
    await tables.createRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PAYHERE_NOTIFY_LOGS,
      rowId: ID.unique(),
      data: row,
    });
  } catch {
    // never break PayHere contract
  }
}

async function notifyPaid(
  tables: Awaited<ReturnType<typeof createAdminClient>>["tables"],
  order: { buyerId: string; sellerId: string; $id: string },
) {
  const buyerId = order.buyerId;
  const sellerId = order.sellerId;
  const orderId = order.$id;
  if (!buyerId || !orderId) return;

  async function create(
    userId: string,
    type: string,
    title: string,
    body: string,
    link: string,
  ) {
    try {
      await tables.createRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_NOTIFICATIONS,
        rowId: ID.unique(),
        data: {
          userId,
          type,
          title,
          body,
          read: false,
          link,
          meta: null,
        },
      });
    } catch {
      /* ignore */
    }
  }

  await create(
    buyerId,
    "order.paid",
    "Payment confirmed",
    "Your PayHere payment was confirmed.",
    `/orders/${orderId}`,
  );
  if (sellerId) {
    await create(
      sellerId,
      "order.paid",
      "New paid order",
      "A buyer paid for an order via PayHere.",
      `/seller/orders/${orderId}`,
    );
  }
}

export async function handlePayHereNotifyRequest(body: unknown) {
  const posted = parseNotifyForm(body);
  const merchantId = process.env.PAYHERE_MERCHANT_ID?.trim() || "";
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || "";
  if (!merchantId || !merchantSecret.trim()) {
    const { tables } = await createAdminClient();
    await persistNotifyLog(
      tables,
      notifyLogRowFromDecision({
        posted,
        kind: "config_error",
        reason: "missing_env",
        httpStatus: 500,
      }),
    );
    return new NextResponse("Not configured.", { status: 500 });
  }

  const sig = verifyNotifySignature(posted, merchantSecret, merchantId);
  if (!sig.ok) {
    const { tables } = await createAdminClient();
    await persistNotifyLog(
      tables,
      notifyLogRowFromDecision({
        posted,
        kind: "ignored",
        reason: sig.reason,
        httpStatus: 200,
      }),
    );
    return new NextResponse("OK", { status: 200 });
  }

  const { tables } = await createAdminClient();
  const orderId = posted.order_id;
  const loaded = await loadOrderPaymentItems(tables, orderId);
  const decision = decideNotifyAction({
    posted,
    order: loaded.order,
    payment: loaded.payment,
  });

  if (decision.action === "noop") {
    await persistNotifyLog(
      tables,
      notifyLogRowFromDecision({
        posted,
        decision,
        paymentStatus: loaded.payment?.status,
        httpStatus: 200,
      }),
    );
    return new NextResponse("OK", { status: 200 });
  }

  if (decision.action === "reject") {
    await persistNotifyLog(
      tables,
      notifyLogRowFromDecision({
        posted,
        decision,
        httpStatus: 200,
      }),
    );
    return new NextResponse("OK", { status: 200 });
  }

  const alreadyHandled = () =>
    persistNotifyLog(
      tables,
      notifyLogRowFromDecision({
        posted,
        decision: { action: "noop" },
        paymentStatus: loaded.payment?.status,
        httpStatus: 200,
      }),
    );

  if (decision.action === "mark_failed" && loaded.payment) {
    // A concurrent settle may have landed since the read; never overwrite paid/refunded.
    const claimed = await tables.updateRowIfColumnIn({
      databaseId: DATABASE_ID,
      tableId: TABLE_PAYMENTS,
      rowId: loaded.payment.$id,
      column: "status",
      values: OPEN_PAYMENT_STATUSES,
      data: { status: "failed" },
    });
    if (!claimed) {
      await alreadyHandled();
      return new NextResponse("OK", { status: 200 });
    }
    await persistNotifyLog(
      tables,
      notifyLogRowFromDecision({ posted, decision, httpStatus: 200 }),
    );
    return new NextResponse("OK", { status: 200 });
  }

  if (decision.action === "mark_refunded" && loaded.payment && loaded.order) {
    const { $id: transactionId } = await tables.createTransaction({ ttl: 120 });
    try {
      const claimed = await tables.updateRowIfColumnIn({
        databaseId: DATABASE_ID,
        tableId: TABLE_PAYMENTS,
        rowId: loaded.payment.$id,
        column: "status",
        values: ["paid"],
        data: { status: "refunded" },
        transactionId,
      });
      if (!claimed) {
        await tables.updateTransaction({ transactionId, rollback: true });
        await alreadyHandled();
        return new NextResponse("OK", { status: 200 });
      }
      await tables.updateRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_ORDERS,
        rowId: loaded.order.$id,
        data: { status: "refunded" },
        transactionId,
      });
      await restoreStockForLines(tables, loaded.items, transactionId);
      await tables.updateTransaction({ transactionId, commit: true });
    } catch {
      await tables.updateTransaction({ transactionId, rollback: true });
      return new NextResponse("Retry later.", { status: 500 });
    }
    await persistNotifyLog(
      tables,
      notifyLogRowFromDecision({ posted, decision, httpStatus: 200 }),
    );
    return new NextResponse("OK", { status: 200 });
  }

  if (decision.action === "settle" && loaded.payment && loaded.order) {
    const { $id: transactionId } = await tables.createTransaction({ ttl: 120 });
    try {
      // Conditional claim: duplicate/concurrent notifies settle (and notify) exactly once.
      const claimed = await tables.updateRowIfColumnIn({
        databaseId: DATABASE_ID,
        tableId: TABLE_PAYMENTS,
        rowId: loaded.payment.$id,
        column: "status",
        values: OPEN_PAYMENT_STATUSES,
        data: {
          status: "paid",
          payherePaymentId: decision.payherePaymentId,
          idempotencyKey: decision.idempotencyKey,
        },
        transactionId,
      });
      if (!claimed) {
        await tables.updateTransaction({ transactionId, rollback: true });
        await alreadyHandled();
        return new NextResponse("OK", { status: 200 });
      }
      await tables.updateRowIfColumnIn({
        databaseId: DATABASE_ID,
        tableId: TABLE_ORDERS,
        rowId: loaded.order.$id,
        column: "status",
        values: ["pending_payment", "payment_review"],
        data: { status: "paid" },
        transactionId,
      });
      await tables.updateTransaction({ transactionId, commit: true });
    } catch (error) {
      await tables.updateTransaction({ transactionId, rollback: true });
      if (error instanceof AppwriteException && error.code === 409) {
        // Same PayHere payment_id already settled another payment row.
        await persistNotifyLog(
          tables,
          notifyLogRowFromDecision({
            posted,
            decision: { action: "reject", reason: "duplicate_payment_id" },
            httpStatus: 200,
          }),
        );
        return new NextResponse("OK", { status: 200 });
      }
      return new NextResponse("Retry later.", { status: 500 });
    }
    await notifyPaid(tables, loaded.order);
    await persistNotifyLog(
      tables,
      notifyLogRowFromDecision({
        posted,
        decision,
        httpStatus: 200,
      }),
    );
    return new NextResponse("OK", { status: 200 });
  }

  return new NextResponse("OK", { status: 200 });
}
