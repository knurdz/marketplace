/**
 * Eligibility + checkout field assembly from DB snapshots (no client amounts).
 */

import {
  buildCheckoutUrls,
  checkoutActionUrl,
  computePayHereCheckoutHash,
  formatPayHereAmount,
  itemsDescription,
  payloadContainsSecret,
  shippingToPayHere,
  splitDisplayName,
} from "./hash.js";

export const NOT_FOUND = "Order not found.";
export const NOT_PAYHERE = "This order cannot be paid with PayHere.";
export const ALREADY_PAID = "This order is already paid.";
export const CLOSED = "This order can no longer be paid.";
export const BAD_AMOUNT = "PayHere checkout is only available for paid orders.";
export const NO_ITEMS = "Order has no items.";
export const GENERIC =
  "Unable to start PayHere checkout. Please try again later.";

export function evaluatePayHereHashRequest(params) {
  const userId = String(params.userId ?? "");
  const order = params.order;
  const payment = params.payment;
  const items = Array.isArray(params.items) ? params.items : [];

  if (!userId || !order || order.buyerId !== userId) {
    return { ok: false, error: NOT_FOUND, status: 404 };
  }
  if (!payment || payment.orderId !== order.$id) {
    return { ok: false, error: NOT_FOUND, status: 404 };
  }
  if (order.paymentMethod !== "payhere" || payment.method !== "payhere") {
    return { ok: false, error: NOT_PAYHERE, status: 400 };
  }
  if (payment.status === "paid") {
    return { ok: false, error: ALREADY_PAID, status: 409 };
  }
  if (order.status === "cancelled" || order.status === "refunded") {
    return { ok: false, error: CLOSED, status: 400 };
  }
  if (order.status !== "pending_payment") {
    return { ok: false, error: CLOSED, status: 400 };
  }
  if (payment.status !== "pending") {
    return { ok: false, error: CLOSED, status: 400 };
  }

  const payAmt = formatPayHereAmount(payment.amount);
  const orderAmt = formatPayHereAmount(order.totalAmount);
  if (!payAmt || !orderAmt) {
    return { ok: false, error: BAD_AMOUNT, status: 400 };
  }
  if (payAmt !== orderAmt) {
    return { ok: false, error: GENERIC, status: 500 };
  }
  if (items.length === 0) {
    return { ok: false, error: NO_ITEMS, status: 400 };
  }
  for (const item of items) {
    if (item.orderId !== order.$id) {
      return { ok: false, error: NOT_FOUND, status: 404 };
    }
  }

  return { ok: true, amountFormatted: payAmt };
}

/**
 * Build the checkout payload Member 2 POSTs to PayHere.
 * Amount/currency/items come from `order` / `payment` / `items` only.
 */
export function buildPayHereCheckoutPayload(params) {
  const decision = evaluatePayHereHashRequest(params);
  if (!decision.ok) return decision;

  const merchantId = String(params.merchantId ?? "").trim();
  const merchantSecret = String(params.merchantSecret ?? "");
  const appUrl = String(params.appUrl ?? "").replace(/\/$/, "");
  const notifyUrl = String(params.notifyUrl ?? "").trim();
  const currency = String(params.payment.currency ?? "").trim();

  if (
    !merchantId ||
    !merchantSecret.trim() ||
    !appUrl ||
    !notifyUrl ||
    !currency
  ) {
    return {
      ok: false,
      error: "PayHere checkout is not configured yet.",
      status: 501,
    };
  }

  const urls = buildCheckoutUrls({
    appUrl,
    orderId: params.order.$id,
    notifyUrl,
  });
  const names = splitDisplayName(params.displayName, params.email);
  const ship = shippingToPayHere(params.order.shippingAddress);
  const phone = String(params.phone ?? "").trim() || "N/A";
  const email = String(params.email ?? "").trim();
  if (!email) {
    return { ok: false, error: GENERIC, status: 500 };
  }

  const hash = computePayHereCheckoutHash({
    merchantId,
    orderId: params.order.$id,
    amountFormatted: decision.amountFormatted,
    currency,
    merchantSecret,
  });

  const payload = {
    actionUrl: checkoutActionUrl(params.sandbox !== false),
    fields: {
      merchant_id: merchantId,
      return_url: urls.return_url,
      cancel_url: urls.cancel_url,
      notify_url: urls.notify_url,
      order_id: params.order.$id,
      items: itemsDescription(params.items),
      currency,
      amount: decision.amountFormatted,
      first_name: names.firstName,
      last_name: names.lastName,
      email,
      phone: phone.slice(0, 32),
      address: ship.address,
      city: ship.city,
      country: ship.country,
      hash,
    },
  };

  if (payloadContainsSecret(payload, merchantSecret)) {
    return { ok: false, error: GENERIC, status: 500 };
  }

  return { ok: true, payload };
}
