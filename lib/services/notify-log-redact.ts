/**
 * Redact PayHere/notify log text before any admin UI render.
 * Never display merchant secret, md5sig/hash, API keys, or card/PAN fields.
 */

export const NOTIFY_LOG_OUTCOMES = [
  "ignored",
  "rejected",
  "payment_failed",
  "settle_failed",
  "already_paid",
  "settled",
  "noop",
  "refunded",
  "config_error",
  "error",
  "unknown",
] as const;

export type NotifyLogOutcome = (typeof NOTIFY_LOG_OUTCOMES)[number];

export type ParsedNotifyLog = {
  outcome: NotifyLogOutcome;
  orderId: string | null;
  reason: string | null;
  statusCode: string | null;
};

const SECRET_ASSIGNMENT =
  /(?:md5sig|merchant_secret|merchantSecret|merchant_id_secret|card_no|card_number|cardno|card_holder_name|cvv|cvc|pan|api[_-]?key|x-appwrite-key|authorization|password|passwd|secret|hash)\s*[:=]\s*([^\s&"'\\,;]+)/gi;

const SECRET_JSON =
  /"(md5sig|hash|merchant_secret|merchantSecret|card_no|card_number|cardno|card_holder_name|cvv|cvc|pan|api_key|apiKey|password|secret)"\s*:\s*"(?:\\.|[^"\\])*"/gi;

const BEARER_TOKEN = /\bBearer\s+[A-Za-z0-9._\-+=/]+/gi;

export function redactNotifyLogText(raw: string): string {
  if (!raw) return "";
  let out = raw;
  out = out.replace(BEARER_TOKEN, "Bearer [redacted]");
  out = out.replace(SECRET_JSON, '"$1":"[redacted]"');
  out = out.replace(SECRET_ASSIGNMENT, (match, value: string) =>
    match.replace(value, "[redacted]"),
  );
  return out;
}

export function parseNotifyLogText(text: string): ParsedNotifyLog {
  const orderMatch = text.match(/\border=([A-Za-z0-9._-]+)/);
  const reasonMatch = text.match(/\breason=([A-Za-z0-9._-]+)/);
  const statusMatch = text.match(/\bstatus=([0-9-]+)/);

  let outcome: NotifyLogOutcome = "unknown";
  if (
    /missing Function env|missing Appwrite Function credentials/i.test(text)
  ) {
    outcome = "config_error";
  } else if (/payhere-notify ignored/.test(text)) {
    outcome = "ignored";
  } else if (/payhere-notify reject/.test(text)) {
    outcome = "rejected";
  } else if (/payment_failed/.test(text)) {
    outcome = "payment_failed";
  } else if (/settle race already_paid/.test(text)) {
    outcome = "already_paid";
  } else if (/settle failed/.test(text)) {
    outcome = "settle_failed";
  } else if (/payhere-notify settled/.test(text)) {
    outcome = "settled";
  } else if (/payhere-notify refunded/.test(text)) {
    outcome = "refunded";
  } else if (/payhere-notify noop/.test(text)) {
    outcome = "noop";
  } else if (/payhere-notify failed/.test(text)) {
    outcome = "error";
  }

  return {
    outcome,
    orderId: orderMatch?.[1] ?? null,
    reason: reasonMatch?.[1] ?? null,
    statusCode: statusMatch?.[1] ?? null,
  };
}

const ISSUE_OUTCOMES = new Set<NotifyLogOutcome>([
  "ignored",
  "rejected",
  "payment_failed",
  "settle_failed",
  "config_error",
  "error",
]);

const NOTIFY_PAYLOAD_ALLOWLIST = [
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
] as const;

function sanitizeNotifyPayload(posted: Record<string, string>) {
  const out: Record<string, string> = {};
  for (const key of NOTIFY_PAYLOAD_ALLOWLIST) {
    const value = posted[key];
    if (typeof value === "string" && value.trim()) {
      out[key] = value.trim().slice(0, 255);
    }
  }
  return out;
}

function compactString(value: unknown, max: number): string | null {
  if (value == null) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

export function notifyLogRowFromDecision(params: {
  posted?: Record<string, string>;
  decision?: { action?: string; reason?: string; payherePaymentId?: string };
  kind?: string;
  reason?: string;
  httpStatus?: number;
  paymentStatus?: string;
}) {
  const posted =
    params?.posted && typeof params.posted === "object" ? params.posted : {};
  const decision = params?.decision;
  const kind = String(params?.kind ?? "").trim();
  let outcome: NotifyLogOutcome = "unknown";
  let reason = compactString(params?.reason, 64);

  if (kind === "ignored") {
    outcome = "ignored";
    reason = reason ?? "bad_sig";
  } else if (kind === "config_error") {
    outcome = "config_error";
    reason = reason ?? "missing_env";
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

  const sanitizedPayload = JSON.stringify(sanitizeNotifyPayload(posted)).slice(
    0,
    2000,
  );
  const httpStatus = Number(params?.httpStatus);
  const row: Record<string, unknown> = {
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

export function isNotifyLogIssue(
  outcome: NotifyLogOutcome,
  executionStatus: string,
  responseStatusCode: number,
): boolean {
  if (ISSUE_OUTCOMES.has(outcome)) return true;
  if (executionStatus === "failed") return true;
  if (responseStatusCode >= 400) return true;
  return false;
}
