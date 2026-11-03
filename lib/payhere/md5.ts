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
] as const;

export function md5Upper(text: string): string {
  return createHash("md5")
    .update(String(text), "utf8")
    .digest("hex")
    .toUpperCase();
}

export function formatPayHereAmount(amount: unknown): string | null {
  const n = typeof amount === "number" ? amount : Number(amount);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n.toFixed(2);
}

export function computeNotifyMd5sig(params: {
  merchantId: string;
  orderId: string;
  payhereAmount: string;
  payhereCurrency: string;
  statusCode: string;
  merchantSecret: string;
}): string {
  const secretHash = md5Upper(params.merchantSecret);
  return md5Upper(
    `${params.merchantId}${params.orderId}${params.payhereAmount}${params.payhereCurrency}${params.statusCode}${secretHash}`,
  );
}

export function md5sigMatches(expected: string, posted: string): boolean {
  const a = Buffer.from(String(expected ?? "").toUpperCase(), "utf8");
  const b = Buffer.from(String(posted ?? "").toUpperCase(), "utf8");
  if (a.length !== b.length || a.length === 0) return false;
  return timingSafeEqual(a, b);
}

function firstString(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  if (value == null) return "";
  return String(value);
}

export function parseNotifyForm(raw: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of PAYHERE_NOTIFY_FIELDS) {
    out[key] = "";
  }

  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    for (const key of PAYHERE_NOTIFY_FIELDS) {
      if (key in (raw as object)) {
        out[key] = firstString((raw as Record<string, unknown>)[key]).trim();
      }
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

export function amountsMatch(dbAmount: unknown, postedAmount: unknown): boolean {
  const a = formatPayHereAmount(dbAmount);
  const b = formatPayHereAmount(postedAmount);
  return a !== null && b !== null && a === b;
}

export function currenciesMatch(
  dbCurrency: unknown,
  postedCurrency: unknown,
): boolean {
  return (
    String(dbCurrency ?? "").trim().toUpperCase() ===
    String(postedCurrency ?? "").trim().toUpperCase()
  );
}

export function mapNotifyStatus(statusCode: string) {
  const c = String(statusCode ?? "").trim();
  if (c === "2") return "success";
  if (c === "0") return "pending";
  if (c === "-1") return "canceled";
  if (c === "-2") return "failed";
  if (c === "-3") return "chargeback";
  return "unknown";
}

export function payhereIdempotencyKey(payherePaymentId: string): string {
  return `payhere:${String(payherePaymentId ?? "").trim()}`;
}
