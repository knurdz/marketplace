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
