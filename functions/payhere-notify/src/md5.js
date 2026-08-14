/**
 * PayHere notify signature helpers (Function-safe).
 * md5sig formula: docs/agent/PAYHERE.md — never log the secret or PAN.
 */

import { createHash, timingSafeEqual } from "node:crypto";

export const PAYHERE_NOTIFY_FIELDS = [
  "merchant_id",
  "order_id",
  "payment_id",
  "payhere_amount",
  "payhere_currency",
  "status_code",
  "md5sig",
  "method",
  "status_message",
  "custom_1",
  "custom_2",
];

export function md5Upper(text) {
  return createHash("md5")
    .update(String(text), "utf8")
    .digest("hex")
    .toUpperCase();
}

export function formatPayHereAmount(amount) {
  const n = typeof amount === "number" ? amount : Number(amount);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n.toFixed(2);
}

export function computeNotifyMd5sig(params) {
  const merchantId = String(params.merchantId ?? "");
  const orderId = String(params.orderId ?? "");
  const payhereAmount = String(params.payhereAmount ?? "");
  const payhereCurrency = String(params.payhereCurrency ?? "");
  const statusCode = String(params.statusCode ?? "");
  const merchantSecret = String(params.merchantSecret ?? "");
  const secretHash = md5Upper(merchantSecret);
  return md5Upper(
    `${merchantId}${orderId}${payhereAmount}${payhereCurrency}${statusCode}${secretHash}`,
  );
}

export function md5sigMatches(expected, posted) {
  const a = Buffer.from(String(expected ?? "").toUpperCase(), "utf8");
  const b = Buffer.from(String(posted ?? "").toUpperCase(), "utf8");
  if (a.length !== b.length || a.length === 0) return false;
  return timingSafeEqual(a, b);
}

function firstString(value) {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  if (value == null) return "";
  return String(value);
}

/** Allowlisted form fields only — never copies card_no / PAN.
 * @returns {Record<string, string>}
 */
export function parseNotifyForm(raw) {
  const out = {};
  for (const key of PAYHERE_NOTIFY_FIELDS) {
    out[key] = "";
  }

  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    for (const key of PAYHERE_NOTIFY_FIELDS) {
      if (key in raw) out[key] = firstString(raw[key]).trim();
    }
    return out;
  }

  const text = typeof raw === "string" ? raw : "";
  if (!text.trim()) return out;

  const params = new URLSearchParams(text);
  for (const key of PAYHERE_NOTIFY_FIELDS) {
    const value = params.get(key);
    if (value != null) out[key] = value.trim();
  }
  return out;
}

export function amountsMatch(dbAmount, postedAmount) {
  const a = formatPayHereAmount(dbAmount);
  const b = formatPayHereAmount(postedAmount);
  return a !== null && b !== null && a === b;
}

export function currenciesMatch(dbCurrency, postedCurrency) {
  return (
    String(dbCurrency ?? "")
      .trim()
      .toUpperCase() ===
    String(postedCurrency ?? "")
      .trim()
      .toUpperCase()
  );
}

export function mapNotifyStatus(statusCode) {
  const c = String(statusCode ?? "").trim();
  if (c === "2") return "success";
  if (c === "0") return "pending";
  if (c === "-1") return "canceled";
  if (c === "-2") return "failed";
  if (c === "-3") return "chargeback";
  return "unknown";
}

export function payhereIdempotencyKey(payherePaymentId) {
  return `payhere:${String(payherePaymentId ?? "").trim()}`;
}
