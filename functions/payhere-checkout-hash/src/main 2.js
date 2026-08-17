import { Account, Client, Query, TablesDB } from "node-appwrite";
import { evaluateSandboxCheckoutPolicy, parseOrderIdFromBody } from "./hash.js";
import { buildPayHereCheckoutPayload } from "./payload.js";

const DATABASE_ID = process.env.DATABASE_ID?.trim() || "marketplace";
const TABLE_ORDERS = "orders";
const TABLE_ORDER_ITEMS = "order_items";
const TABLE_PAYMENTS = "payments";
const TABLE_PROFILES = "profiles";

const NOT_CONFIGURED = "PayHere checkout is not configured yet.";
const GENERIC = "Unable to start PayHere checkout. Please try again later.";
const SIGN_IN = "You must be signed in to checkout.";

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

function fail(res, error, status) {
  return res.json({ ok: false, error }, status);
}

function readFunctionEnv() {
  const merchantId = process.env.PAYHERE_MERCHANT_ID?.trim() || "";
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || "";
  const appUrl = (process.env.APP_URL || "").trim().replace(/\/$/, "");
  const notifyUrl = (process.env.PAYHERE_NOTIFY_URL || "").trim();
  const sandboxRaw = process.env.PAYHERE_SANDBOX;
  return { merchantId, merchantSecret, appUrl, notifyUrl, sandboxRaw };
}

function asNumber(value, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

async function handleCheckoutHash({ req, res, log, error }) {
  if (req.method && req.method !== "POST") {
    return fail(res, "Method not allowed.", 405);
  }

  const env = readFunctionEnv();
  if (
    !env.merchantId ||
    !env.merchantSecret.trim() ||
    !env.appUrl ||
    !env.notifyUrl
  ) {
    log("payhere-checkout-hash missing Function env (no secrets logged)");
    return fail(res, NOT_CONFIGURED, 501);
  }

  const sandboxPolicy = evaluateSandboxCheckoutPolicy(env.sandboxRaw);
  if (!sandboxPolicy.ok) {
    log("payhere-checkout-hash refused live PayHere (not authorized)");
    return fail(res, sandboxPolicy.error, sandboxPolicy.status);
  }

  const userId = header(req, "x-appwrite-user-id").trim();
  const jwt = header(req, "x-appwrite-user-jwt").trim();
  if (!userId || !jwt) {
    return fail(res, SIGN_IN, 401);
  }

  const orderId = parseOrderIdFromBody(
    req.bodyJson ?? req.bodyText ?? req.body,
  );
  if (!orderId) {
    return fail(res, "Invalid order id.", 400);
  }

  const endpoint = process.env.APPWRITE_FUNCTION_API_ENDPOINT?.trim();
  const projectId = process.env.APPWRITE_FUNCTION_PROJECT_ID?.trim();
  if (!endpoint || !projectId) {
    error("payhere-checkout-hash missing Appwrite Function endpoint/project");
    return fail(res, NOT_CONFIGURED, 501);
  }

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setJWT(jwt);
  const account = new Account(client);
  const tables = new TablesDB(client);

  try {
    const user = await account.get();
    if (!user?.$id || user.$id !== userId || user.status === false) {
      return fail(res, SIGN_IN, 401);
    }

    let orderRow;
    try {
      orderRow = await tables.getRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_ORDERS,
        rowId: orderId,
      });
    } catch {
      return fail(res, "Order not found.", 404);
    }

    const order = {
      $id: String(orderRow.$id),
      buyerId: String(orderRow.buyerId ?? ""),
      sellerId: String(orderRow.sellerId ?? ""),
      status: String(orderRow.status ?? ""),
      totalAmount: asNumber(orderRow.totalAmount),
      currency: String(orderRow.currency ?? ""),
      shippingAddress: String(orderRow.shippingAddress ?? ""),
      paymentMethod: String(orderRow.paymentMethod ?? ""),
    };

    const paymentResult = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_PAYMENTS,
      queries: [Query.equal("orderId", orderId), Query.limit(1)],
    });
    const paymentRow = paymentResult.rows?.[0];
    if (!paymentRow) {
      return fail(res, "Order not found.", 404);
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
    const items = [];
    for (const row of itemsResult.rows ?? []) {
      items.push({
        $id: String(row.$id),
        orderId: String(row.orderId ?? ""),
        productId: String(row.productId ?? ""),
        title: String(row.title ?? ""),
        quantity: Math.max(1, Math.floor(asNumber(row.quantity, 1))),
      });
    }

    let displayName = String(user.name ?? "").trim();
    let phone = "";
    try {
      const profile = await tables.getRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_PROFILES,
        rowId: user.$id,
      });
      if (String(profile.userId ?? "") === user.$id) {
        if (
          typeof profile.displayName === "string" &&
          profile.displayName.trim()
        ) {
          displayName = profile.displayName.trim();
        }
        if (typeof profile.phone === "string" && profile.phone.trim()) {
          phone = profile.phone.trim();
        }
      }
    } catch {
      // profile optional
    }

    const built = buildPayHereCheckoutPayload({
      userId: user.$id,
      order,
      payment,
      items,
      merchantId: env.merchantId,
      merchantSecret: env.merchantSecret,
      appUrl: env.appUrl,
      notifyUrl: env.notifyUrl,
      sandbox: true,
      email: String(user.email ?? "").trim(),
      displayName,
      phone,
    });

    if (!built.ok) {
      return fail(res, built.error, built.status);
    }

    log(`payhere-checkout-hash ok order=${order.$id}`);
    return res.json({ ok: true, payload: built.payload }, 200);
  } catch (err) {
    error(
      `payhere-checkout-hash failed: ${err instanceof Error ? err.message : "unknown"}`,
    );
    return fail(res, GENERIC, 500);
  }
}

export default handleCheckoutHash;
