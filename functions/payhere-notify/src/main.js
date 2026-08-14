import { Client, Query, TablesDB } from "node-appwrite";
import { parseNotifyForm } from "./md5.js";
import { decideNotifyAction, verifyNotifySignature } from "./notify.js";

const DATABASE_ID = process.env.DATABASE_ID?.trim() || "marketplace";
const TABLE_ORDERS = "orders";
const TABLE_ORDER_ITEMS = "order_items";
const TABLE_PAYMENTS = "payments";
const TABLE_PRODUCTS = "products";

function header(req, name) {
  const headers = req.headers || {};
  const want = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (String(key).toLowerCase() === want) {
      return Array.isArray(value)
        ? String(value[0] ?? "")
        : String(value ?? "");
    }
  }
  return "";
}

function ok(res) {
  return res.text("OK", 200);
}

function asNumber(value, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

async function loadOrderPaymentItems(tables, orderId) {
  let orderRow;
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
  const paymentRow = paymentResult.rows?.[0];
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
    payherePaymentId:
      typeof paymentRow.payherePaymentId === "string"
        ? paymentRow.payherePaymentId
        : null,
  };

  const itemsResult = await tables.listRows({
    databaseId: DATABASE_ID,
    tableId: TABLE_ORDER_ITEMS,
    queries: [Query.equal("orderId", orderId), Query.limit(100)],
  });
  const items = [];
  for (const row of itemsResult.rows ?? []) {
    items.push({
      productId: String(row.productId ?? ""),
      quantity: Math.max(1, Math.floor(asNumber(row.quantity, 1))),
    });
  }

  return { order, payment, items };
}

async function planStockDecrements(tables, items) {
  const qtyByProduct = new Map();
  for (const item of items) {
    if (!item.productId) continue;
    qtyByProduct.set(
      item.productId,
      (qtyByProduct.get(item.productId) ?? 0) + item.quantity,
    );
  }

  const plans = [];
  for (const [productId, quantity] of qtyByProduct) {
    let stockBefore = 0;
    try {
      const row = await tables.getRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_PRODUCTS,
        rowId: productId,
      });
      stockBefore = Math.max(0, Math.floor(asNumber(row.stock)));
    } catch {
      stockBefore = 0;
    }
    const decrement = Math.min(stockBefore, quantity);
    if (decrement > 0) {
      plans.push({ productId, decrement });
    }
  }
  return plans;
}

async function applySettle(tables, params) {
  const tx = await tables.createTransaction({ ttl: 120 });
  const transactionId = tx.$id;

  await tables.updateRow({
    databaseId: DATABASE_ID,
    tableId: TABLE_PAYMENTS,
    rowId: params.paymentId,
    data: {
      status: "paid",
      payherePaymentId: params.payherePaymentId,
      idempotencyKey: params.idempotencyKey,
    },
    transactionId,
  });

  if (
    params.orderStatus === "pending_payment" ||
    params.orderStatus === "payment_review"
  ) {
    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_ORDERS,
      rowId: params.orderId,
      data: { status: "paid" },
      transactionId,
    });
  }

  for (const plan of params.plans) {
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

  await tables.updateTransaction({
    transactionId,
    commit: true,
  });
}

async function paymentAlreadyPaid(tables, orderId) {
  const { payment } = await loadOrderPaymentItems(tables, orderId);
  return payment?.status === "paid";
}

async function handlePayHereNotify({ req, res, log, error }) {
  if (req.method && req.method !== "POST") {
    return res.text("Method not allowed.", 405);
  }

  const merchantId = process.env.PAYHERE_MERCHANT_ID?.trim() || "";
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || "";
  if (!merchantId || !merchantSecret.trim()) {
    error("payhere-notify missing Function env (no secrets logged)");
    return res.text("Not configured.", 500);
  }

  const posted = parseNotifyForm(req.bodyText ?? req.body ?? req.bodyJson);
  const sig = verifyNotifySignature(posted, merchantSecret, merchantId);
  if (!sig.ok) {
    log(`payhere-notify ignored reason=${sig.reason}`);
    return ok(res);
  }

  const endpoint = process.env.APPWRITE_FUNCTION_API_ENDPOINT?.trim();
  const projectId = process.env.APPWRITE_FUNCTION_PROJECT_ID?.trim();
  const apiKey =
    header(req, "x-appwrite-key").trim() ||
    process.env.APPWRITE_API_KEY?.trim() ||
    "";

  if (!endpoint || !projectId || !apiKey) {
    error("payhere-notify missing Appwrite Function credentials");
    return res.text("Not configured.", 500);
  }

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);
  const tables = new TablesDB(client);

  const orderId = posted.order_id;
  try {
    const loaded = await loadOrderPaymentItems(tables, orderId);
    const decision = decideNotifyAction({
      posted,
      order: loaded.order,
      payment: loaded.payment,
    });

    if (decision.action === "noop") {
      log(`payhere-notify noop order=${orderId} status=${posted.status_code}`);
      return ok(res);
    }

    if (decision.action === "reject") {
      log(`payhere-notify reject order=${orderId} reason=${decision.reason}`);
      return ok(res);
    }

    if (decision.action === "mark_failed") {
      await tables.updateRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_PAYMENTS,
        rowId: loaded.payment.$id,
        data: { status: "failed" },
      });
      log(`payhere-notify payment_failed order=${orderId}`);
      return ok(res);
    }

    if (decision.action === "mark_refunded") {
      const tx = await tables.createTransaction({ ttl: 120 });
      const transactionId = tx.$id;
      await tables.updateRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_PAYMENTS,
        rowId: loaded.payment.$id,
        data: { status: "refunded" },
        transactionId,
      });
      await tables.updateRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_ORDERS,
        rowId: loaded.order.$id,
        data: { status: "refunded" },
        transactionId,
      });
      await tables.updateTransaction({ transactionId, commit: true });
      log(`payhere-notify refunded order=${orderId}`);
      return ok(res);
    }

    const plans = await planStockDecrements(tables, loaded.items);
    try {
      await applySettle(tables, {
        paymentId: loaded.payment.$id,
        orderId: loaded.order.$id,
        orderStatus: loaded.order.status,
        payherePaymentId: decision.payherePaymentId,
        idempotencyKey: decision.idempotencyKey,
        plans,
      });
    } catch (err) {
      if (await paymentAlreadyPaid(tables, orderId)) {
        log(`payhere-notify settle race already_paid order=${orderId}`);
        return ok(res);
      }
      error(
        `payhere-notify settle failed: ${err instanceof Error ? err.message : "unknown"}`,
      );
      return res.text("Retry.", 500);
    }

    log(`payhere-notify settled order=${orderId}`);
    return ok(res);
  } catch (err) {
    error(
      `payhere-notify failed: ${err instanceof Error ? err.message : "unknown"}`,
    );
    return res.text("Retry.", 500);
  }
}

export default handlePayHereNotify;
