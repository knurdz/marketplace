/**
 * PayHere checkout hash helpers (Function-safe, no Appwrite SDK).
 * Formula: docs/agent/PAYHERE.md — secret never appears in return values.
 */

import { createHash } from "node:crypto";

export const PAYHERE_CHECKOUT_SANDBOX_URL =
  "https://sandbox.payhere.lk/pay/checkout";
export const PAYHERE_CHECKOUT_LIVE_URL = "https://www.payhere.lk/pay/checkout";

const SECRET_KEY_RE =
  /secret|password|api[_-]?key|merchant_secret|private[_-]?key/i;

export function md5Upper(text) {
  return createHash("md5")
    .update(String(text), "utf8")
    .digest("hex")
    .toUpperCase();
}

/** Amount with exactly two decimal places, or null if not a paid amount. */
export function formatPayHereAmount(amount) {
  const n = typeof amount === "number" ? amount : Number(amount);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n.toFixed(2);
}

export function computePayHereCheckoutHash(params) {
  const merchantId = String(params.merchantId ?? "");
  const orderId = String(params.orderId ?? "");
  const amountFormatted = String(params.amountFormatted ?? "");
  const currency = String(params.currency ?? "");
  const merchantSecret = String(params.merchantSecret ?? "");
  const secretHash = md5Upper(merchantSecret);
  return md5Upper(
    `${merchantId}${orderId}${amountFormatted}${currency}${secretHash}`,
  );
}

export function checkoutActionUrl(sandbox) {
  return sandbox ? PAYHERE_CHECKOUT_SANDBOX_URL : PAYHERE_CHECKOUT_LIVE_URL;
}

export function isSandboxEnv(raw) {
  if (raw == null || String(raw).trim() === "") return true;
  const v = String(raw).trim().toLowerCase();
  if (["0", "false", "no", "off", "live"].includes(v)) return false;
  return true;
}

export function splitDisplayName(displayName, email) {
  const parts = String(displayName ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length >= 2) {
    return {
      firstName: parts[0].slice(0, 50),
      lastName: parts.slice(1).join(" ").slice(0, 50),
    };
  }
  if (parts.length === 1) {
    return { firstName: parts[0].slice(0, 50), lastName: "Buyer" };
  }
  const local = String(email ?? "")
    .split("@")[0]
    ?.trim();
  return {
    firstName: (local || "Buyer").slice(0, 50),
    lastName: "Buyer",
  };
}

export function shippingToPayHere(shippingAddress) {
  const lines = String(shippingAddress ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const address = (lines.join(", ") || "N/A").slice(0, 200);
  let city = "Colombo";
  if (lines.length >= 3) {
    city = lines[lines.length - 3].slice(0, 50);
  } else if (lines.length === 2) {
    city = lines[1].slice(0, 50);
  }
  return { address, city, country: "Sri Lanka" };
}

export function itemsDescription(items) {
  const parts = [];
  for (const item of items) {
    const title = String(item.title ?? "").trim() || "Item";
    const qty = Number(item.quantity) || 1;
    parts.push(qty > 1 ? `${title} x${qty}` : title);
  }
  const joined = parts.join(", ").trim();
  return (joined || "Order").slice(0, 255);
}

export function buildCheckoutUrls(params) {
  const base = String(params.appUrl ?? "").replace(/\/$/, "");
  const orderId = String(params.orderId ?? "");
  const notifyUrl = String(params.notifyUrl ?? "").trim();
  return {
    return_url: `${base}/checkout/payhere/return?orderId=${encodeURIComponent(orderId)}`,
    cancel_url: `${base}/checkout/payhere/cancel?orderId=${encodeURIComponent(orderId)}`,
    notify_url: notifyUrl,
  };
}

export function payloadContainsSecret(obj, merchantSecret) {
  const json = JSON.stringify(obj);
  if (
    merchantSecret &&
    merchantSecret.length > 0 &&
    json.includes(merchantSecret)
  ) {
    return true;
  }
  return objectHasSecretKey(obj);
}

function objectHasSecretKey(value) {
  if (!value || typeof value !== "object") return false;
  for (const [key, nested] of Object.entries(value)) {
    if (SECRET_KEY_RE.test(key)) return true;
    if (objectHasSecretKey(nested)) return true;
  }
  return false;
}

export function parseOrderIdFromBody(raw) {
  let body = raw;
  if (typeof body === "string") {
    const trimmed = body.trim();
    if (!trimmed) return null;
    try {
      body = JSON.parse(trimmed);
    } catch {
      return null;
    }
  }
  if (!body || typeof body !== "object") return null;
  const orderId =
    typeof body.orderId === "string" ? body.orderId.trim().slice(0, 36) : "";
  return orderId.length > 0 ? orderId : null;
}
