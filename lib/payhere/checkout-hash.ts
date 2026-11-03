import {
  DATABASE_ID,
  TABLE_ORDER_ITEMS,
  TABLE_ORDERS,
  TABLE_PAYMENTS,
  TABLE_PROFILES,
} from "@/lib/appwrite/config";
import { createAdminClient } from "@/lib/appwrite/server";
import { Query } from "@/lib/db/query";
import {
  buildCheckoutUrls,
  checkoutActionUrl,
  computePayHereCheckoutHash,
  evaluateSandboxCheckoutPolicy,
  formatPayHereAmount,
  itemsDescription,
  payloadContainsSecret,
  shippingToPayHere,
  splitDisplayName,
} from "./hash";
import type { PayHereCheckoutHashResult } from "@/lib/types/payhere";

const NOT_CONFIGURED = "PayHere checkout is not configured yet.";
const GENERIC =
  "Unable to start PayHere checkout. Please try again later.";

function readFunctionEnv() {
  return {
    merchantId: process.env.PAYHERE_MERCHANT_ID?.trim() || "",
    merchantSecret: process.env.PAYHERE_MERCHANT_SECRET || "",
    appUrl: (process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "")
      .trim()
      .replace(/\/$/, ""),
    notifyUrl: (process.env.PAYHERE_NOTIFY_URL || "").trim(),
    sandboxRaw: process.env.PAYHERE_SANDBOX,
  };
}

export async function runPayHereCheckoutHash(params: {
  userId: string;
  orderId: string;
}): Promise<PayHereCheckoutHashResult> {
  const env = readFunctionEnv();
  const sandboxPolicy = evaluateSandboxCheckoutPolicy(env.sandboxRaw);
  if (!sandboxPolicy.ok) {
    return { ok: false, error: sandboxPolicy.error };
  }
  if (
    !env.merchantId ||
    !env.merchantSecret.trim() ||
    !env.appUrl ||
    !env.notifyUrl
  ) {
    return { ok: false, error: NOT_CONFIGURED };
  }

  const { tables } = await createAdminClient();
  let orderRow: Record<string, unknown>;
  try {
    orderRow = await tables.getRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_ORDERS,
      rowId: params.orderId,
    });
  } catch {
    return { ok: false, error: "Order not found." };
  }

  if (String(orderRow.buyerId) !== params.userId) {
    return { ok: false, error: "Order not found." };
  }

  const payments = await tables.listRows({
    databaseId: DATABASE_ID,
    tableId: TABLE_PAYMENTS,
    queries: [Query.equal("orderId", params.orderId), Query.limit(1)],
  });
  const paymentRow = payments.rows[0];
  if (!paymentRow) {
    return { ok: false, error: "Order not found." };
  }

  const itemsResult = await tables.listRows({
    databaseId: DATABASE_ID,
    tableId: TABLE_ORDER_ITEMS,
    queries: [Query.equal("orderId", params.orderId), Query.limit(100)],
  });

  if (
    orderRow.paymentMethod !== "payhere" ||
    paymentRow.method !== "payhere" ||
    paymentRow.status === "paid" ||
    orderRow.status !== "pending_payment" ||
    paymentRow.status !== "pending"
  ) {
    return { ok: false, error: GENERIC };
  }

  const payAmt = formatPayHereAmount(paymentRow.amount);
  const orderAmt = formatPayHereAmount(orderRow.totalAmount);
  if (!payAmt || !orderAmt || payAmt !== orderAmt) {
    return { ok: false, error: GENERIC };
  }

  let displayName = "";
  let phone = "";
  let email = "";
  try {
    const profile = await tables.getRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PROFILES,
      rowId: params.userId,
    });
    displayName = String(profile.displayName ?? "");
    phone = String(profile.phone ?? "");
  } catch {
    // optional
  }
  const { users } = await createAdminClient();
  const user = await users.get({ userId: params.userId });
  email = user.email;
  if (!email) {
    return { ok: false, error: GENERIC };
  }

  const urls = buildCheckoutUrls({
    appUrl: env.appUrl,
    orderId: params.orderId,
    notifyUrl: env.notifyUrl,
  });
  const names = splitDisplayName(displayName, email);
  const ship = shippingToPayHere(String(orderRow.shippingAddress ?? ""));
  const hash = computePayHereCheckoutHash({
    merchantId: env.merchantId,
    orderId: params.orderId,
    amountFormatted: payAmt,
    currency: String(paymentRow.currency ?? "LKR"),
    merchantSecret: env.merchantSecret,
  });

  const payload = {
    actionUrl: checkoutActionUrl(true),
    fields: {
      merchant_id: env.merchantId,
      return_url: urls.return_url,
      cancel_url: urls.cancel_url,
      notify_url: urls.notify_url,
      order_id: params.orderId,
      items: itemsDescription(itemsResult.rows),
      currency: String(paymentRow.currency ?? "LKR"),
      amount: payAmt,
      first_name: names.firstName,
      last_name: names.lastName,
      email,
      phone: (phone || "N/A").slice(0, 32),
      address: ship.address,
      city: ship.city,
      country: ship.country,
      hash,
    },
  };

  if (payloadContainsSecret(payload, env.merchantSecret)) {
    return { ok: false, error: GENERIC };
  }

  return { ok: true, payload };
}
