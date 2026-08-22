/**
 * Sanitized PayHere notify ops rows (step 1.26).
 * Never copies md5sig, merchant secret, or card/PAN fields.
 */

export const NOTIFY_PAYLOAD_ALLOWLIST = [
  "merchant_id",
  "order_id",
  "payment_id",
  "payhere_amount",
  "payhere_currency",
  "status_code",
  "method",
  "status_message",
  "custom_1",
  "custom_2",
];

const SECRET_KEY_RE =
  /md5sig|merchant_secret|card_no|card_number|cardno|card_holder|cvv|cvc|pan|api[_-]?key|secret|hash/i;

/**
 * @param {Record<string, unknown> | null | undefined} posted
 * @returns {Record<string, string>}
 */
export function sanitizeNotifyPayload(posted) {
  const out = {};
  if (!posted || typeof posted !== "object") return out;
  for (const key of NOTIFY_PAYLOAD_ALLOWLIST) {
    if (SECRET_KEY_RE.test(key)) continue;
    const value = posted[key];
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (!trimmed) continue;
    out[key] = trimmed.slice(0, 255);
  }
  return out;
}

function compactString(value, max) {
  if (value == null) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

/**
 * Map notify decision / Function kind onto a TablesDB row (no secrets).
 *
 * @param {{
 *   posted?: Record<string, string>,
 *   decision?: { action?: string, reason?: string, payherePaymentId?: string },
 *   kind?: string,
 *   reason?: string,
 *   httpStatus?: number,
 *   paymentStatus?: string,
 * }} params
 * @returns {{
 *   outcome: string,
 *   httpStatus: number,
 *   sanitizedPayload: string,
 *   orderId?: string,
 *   payherePaymentId?: string,
 *   statusCode?: string,
 *   reason?: string,
 * }}
 */
export function notifyLogRowFromDecision(params) {
  const posted = params?.posted && typeof params.posted === "object" ? params.posted : {};
  const decision = params?.decision;
  const kind = String(params?.kind ?? "").trim();
  let outcome = "unknown";
  let reason = compactString(params?.reason, 64);

  if (kind === "ignored") {
    outcome = "ignored";
    reason = reason ?? "bad_sig";
  } else if (kind === "config_error") {
    outcome = "config_error";
    reason = reason ?? "missing_env";
  } else if (kind === "settle_failed") {
    outcome = "settle_failed";
    reason = reason ?? "settle_failed";
  } else if (kind === "already_paid") {
    outcome = "already_paid";
  } else if (kind === "error") {
    outcome = "error";
  } else if (kind === "settled") {
    outcome = "settled";
  } else if (decision?.action === "reject") {
    outcome = "rejected";
    reason = reason ?? compactString(decision.reason, 64);
  } else if (decision?.action === "mark_failed") {
    outcome = "payment_failed";
  } else if (decision?.action === "mark_refunded") {
    outcome = "refunded";
  } else if (decision?.action === "settle") {
    outcome = "settled";
  } else if (decision?.action === "noop") {
    outcome = params?.paymentStatus === "paid" ? "already_paid" : "noop";
  }

  const sanitized = sanitizeNotifyPayload(posted);
  const sanitizedPayload = JSON.stringify(sanitized).slice(0, 2000);

  const httpStatus = Number(params?.httpStatus);
  const row = {
    outcome: outcome.slice(0, 32),
    httpStatus: Number.isFinite(httpStatus) ? httpStatus : 200,
    sanitizedPayload,
  };

  const orderId = compactString(posted.order_id, 36);
  if (orderId) row.orderId = orderId;

  const payherePaymentId =
    compactString(decision?.payherePaymentId, 64) ??
    compactString(posted.payment_id, 64);
  if (payherePaymentId) row.payherePaymentId = payherePaymentId;

  const statusCode = compactString(posted.status_code, 8);
  if (statusCode) row.statusCode = statusCode;

  if (reason) row.reason = reason;

  return row;
}

export function notifyLogRowHasSecret(row) {
  const json = JSON.stringify(row ?? {});
  return /\bmd5sig\b|card_no|merchant_secret|card_holder_name|\bcvv\b/i.test(
    json,
  );
}
