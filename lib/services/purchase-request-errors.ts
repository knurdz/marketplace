export const PURCHASE_REQUEST_ERROR_CODES = {
  NOT_CONFIGURED: "NOT_CONFIGURED",
  NOT_AUTHENTICATED: "NOT_AUTHENTICATED",
  NOT_ALLOWED: "NOT_ALLOWED",
  RATE_LIMITED: "RATE_LIMITED",
  INVALID_INPUT: "INVALID_INPUT",
  PRODUCT_UNAVAILABLE: "PRODUCT_UNAVAILABLE",
  BUYER_PHONE_REQUIRED: "BUYER_PHONE_REQUIRED",
  SELLER_PHONE_REQUIRED: "SELLER_PHONE_REQUIRED",
  OWN_PRODUCT: "OWN_PRODUCT",
  ALREADY_REQUESTED: "ALREADY_REQUESTED",
  INSUFFICIENT_STOCK: "INSUFFICIENT_STOCK",
  NOT_FOUND: "NOT_FOUND",
  ALREADY_RESOLVED: "ALREADY_RESOLVED",
} as const;

export type PurchaseRequestErrorCode =
  (typeof PURCHASE_REQUEST_ERROR_CODES)[keyof typeof PURCHASE_REQUEST_ERROR_CODES];

export type PurchaseRequestActionState = {
  error?: string;
  errorCode?: PurchaseRequestErrorCode;
  success?: string;
  requestId?: string;
};

export type CreatePurchaseRequestResult =
  | { ok: true; requestId: string }
  | { ok: false; error: string; errorCode: PurchaseRequestErrorCode };

export type ResolvePurchaseRequestResult =
  | { ok: true; status: "sold" | "cancelled" }
  | { ok: false; error: string; errorCode: PurchaseRequestErrorCode };
