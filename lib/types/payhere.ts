/**
 * PayHere Function / free-confirm contracts (step 1.20).
 * Frozen names/payloads for Members 2 + 4 — see docs/agent/PAYHERE.md.
 * Merchant secret never appears in these types or client responses.
 */

/** Appwrite Function IDs — must match console when Member 1 deploys (steps 1.22–1.23). */
export const FUNCTION_PAYHERE_CHECKOUT_HASH = "payhere-checkout-hash";
export const FUNCTION_PAYHERE_NOTIFY = "payhere-notify";

export const PAYHERE_FUNCTION_IDS = [
  FUNCTION_PAYHERE_CHECKOUT_HASH,
  FUNCTION_PAYHERE_NOTIFY,
] as const;
export type PayHereFunctionId = (typeof PAYHERE_FUNCTION_IDS)[number];

export const PAYHERE_CHECKOUT_SANDBOX_URL =
  "https://sandbox.payhere.lk/pay/checkout";
export const PAYHERE_CHECKOUT_LIVE_URL =
  "https://www.payhere.lk/pay/checkout";

/** Request body sent to `payhere-checkout-hash`. */
export type PayHereCheckoutHashRequest = {
  orderId: string;
};

/** Hidden form fields for POST to PayHere checkout (no secret). */
export type PayHereCheckoutFields = {
  merchant_id: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  order_id: string;
  items: string;
  currency: string;
  /** Amount formatted to 2 decimal places, e.g. "1000.00". */
  amount: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  hash: string;
};

export type PayHereCheckoutPayload = {
  actionUrl: string;
  fields: PayHereCheckoutFields;
};

export type PayHereCheckoutHashResult =
  | { ok: true; payload: PayHereCheckoutPayload }
  | { ok: false; error: string };

/**
 * Notify POST field names from PayHere (form-urlencoded).
 * Member 4 verifies md5sig; never trust without verification.
 */
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
export type PayHereNotifyField = (typeof PAYHERE_NOTIFY_FIELDS)[number];

export type PayHereNotifyPayload = Partial<
  Record<PayHereNotifyField, string>
> & {
  merchant_id?: string;
  order_id?: string;
  payment_id?: string;
  payhere_amount?: string;
  payhere_currency?: string;
  status_code?: string;
  md5sig?: string;
};

/** PayHere status_code → meaning (notify). */
export const PAYHERE_STATUS_CODES = {
  success: "2",
  pending: "0",
  canceled: "-1",
  failed: "-2",
  chargebacked: "-3",
} as const;

/**
 * Free checkout confirm — contract for Member 2 (server action).
 * Not a PayHere Function; documented alongside for a single payments contract.
 */
export type ConfirmFreeOrderRequest = {
  orderId: string;
};

export type ConfirmFreeOrderResult =
  | { ok: true }
  | { ok: false; error: string };

const FIELD_KEYS = [
  "merchant_id",
  "return_url",
  "cancel_url",
  "notify_url",
  "order_id",
  "items",
  "currency",
  "amount",
  "first_name",
  "last_name",
  "email",
  "phone",
  "address",
  "city",
  "country",
  "hash",
] as const satisfies readonly (keyof PayHereCheckoutFields)[];

const SECRET_KEY_RE =
  /secret|password|api[_-]?key|merchant_secret|private[_-]?key/i;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Validate Function JSON into a safe checkout payload.
 * Rejects objects that include secret-like keys.
 */
export function parsePayHereCheckoutPayload(
  raw: unknown,
): PayHereCheckoutPayload | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;

  for (const key of Object.keys(obj)) {
    if (SECRET_KEY_RE.test(key)) return null;
  }

  if (!isNonEmptyString(obj.actionUrl)) return null;
  const fieldsRaw = obj.fields;
  if (!fieldsRaw || typeof fieldsRaw !== "object") return null;
  const fieldsObj = fieldsRaw as Record<string, unknown>;

  for (const key of Object.keys(fieldsObj)) {
    if (SECRET_KEY_RE.test(key)) return null;
  }

  const fields = {} as PayHereCheckoutFields;
  for (const key of FIELD_KEYS) {
    const value = fieldsObj[key];
    if (!isNonEmptyString(value)) return null;
    fields[key] = value.trim();
  }

  return {
    actionUrl: obj.actionUrl.trim(),
    fields,
  };
}
