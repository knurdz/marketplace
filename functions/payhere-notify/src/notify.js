/**
 * Pure notify decision (no Appwrite). Verify md5sig before any settle action.
 */

import {
  amountsMatch,
  computeNotifyMd5sig,
  currenciesMatch,
  mapNotifyStatus,
  md5sigMatches,
  payhereIdempotencyKey,
} from "./md5.js";

/**
 * @returns {{ ok: false, reason: string } | { ok: true }}
 */
export function verifyNotifySignature(
  posted,
  merchantSecret,
  expectedMerchantId,
) {
  const merchantId = String(posted.merchant_id ?? "").trim();
  const orderId = String(posted.order_id ?? "").trim();
  const payhereAmount = String(posted.payhere_amount ?? "").trim();
  const payhereCurrency = String(posted.payhere_currency ?? "").trim();
  const statusCode = String(posted.status_code ?? "").trim();
  const md5sig = String(posted.md5sig ?? "").trim();

  if (
    !merchantId ||
    !orderId ||
    !payhereAmount ||
    !payhereCurrency ||
    !statusCode ||
    !md5sig
  ) {
    return { ok: false, reason: "missing_fields" };
  }

  if (expectedMerchantId && merchantId !== String(expectedMerchantId).trim()) {
    return { ok: false, reason: "merchant_mismatch" };
  }

  const expected = computeNotifyMd5sig({
    merchantId,
    orderId,
    payhereAmount,
    payhereCurrency,
    statusCode,
    merchantSecret,
  });

  if (!md5sigMatches(expected, md5sig)) {
    return { ok: false, reason: "bad_sig" };
  }

  return { ok: true };
}

/**
 * After signature OK, decide DB action from status + current rows.
 *
 * @returns
 *   | { action: "noop" }
 *   | { action: "settle"; payherePaymentId: string; idempotencyKey: string }
 *   | { action: "mark_failed" }
 *   | { action: "mark_refunded" }
 *   | { action: "reject"; reason: string }
 */
export function decideNotifyAction(params) {
  const posted = params.posted;
  const order = params.order;
  const payment = params.payment;

  if (!order || !payment) {
    return { action: "reject", reason: "order_not_found" };
  }

  if (payment.orderId !== order.$id || posted.order_id !== order.$id) {
    return { action: "reject", reason: "order_mismatch" };
  }

  if (order.paymentMethod !== "payhere" || payment.method !== "payhere") {
    return { action: "reject", reason: "wrong_method" };
  }

  const kind = mapNotifyStatus(posted.status_code);

  if (kind === "pending" || kind === "unknown") {
    return { action: "noop" };
  }

  if (kind === "canceled" || kind === "failed") {
    if (payment.status === "paid" || payment.status === "refunded") {
      return { action: "noop" };
    }
    return { action: "mark_failed" };
  }

  if (kind === "chargeback") {
    if (payment.status === "refunded") {
      return { action: "noop" };
    }
    if (payment.status === "paid") {
      return { action: "mark_refunded" };
    }
    return { action: "noop" };
  }

  // success
  if (payment.status === "paid") {
    return { action: "noop" };
  }

  if (order.status === "cancelled" || order.status === "refunded") {
    return { action: "reject", reason: "order_closed" };
  }

  if (!amountsMatch(order.totalAmount, payment.amount)) {
    return { action: "reject", reason: "order_payment_amount_mismatch" };
  }

  if (!amountsMatch(payment.amount, posted.payhere_amount)) {
    return { action: "reject", reason: "amount_mismatch" };
  }

  if (!currenciesMatch(payment.currency, posted.payhere_currency)) {
    return { action: "reject", reason: "currency_mismatch" };
  }

  const payherePaymentId = String(posted.payment_id ?? "").trim();
  if (!payherePaymentId) {
    return { action: "reject", reason: "missing_payment_id" };
  }

  return {
    action: "settle",
    payherePaymentId,
    idempotencyKey: payhereIdempotencyKey(payherePaymentId),
  };
}
