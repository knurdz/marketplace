import type { PaymentMethod } from "@/lib/types";

export const ORDER_ERROR_CODES = {
  NOT_AUTHENTICATED: "ORDER_NOT_AUTHENTICATED",
  CART_EMPTY: "ORDER_CART_EMPTY",
  CART_ISSUES: "ORDER_CART_ISSUES",
  SELLER_MISSING: "ORDER_SELLER_MISSING",
  ADDRESS_INVALID: "ORDER_ADDRESS_INVALID",
  PAYMENT_METHOD_INVALID: "ORDER_PAYMENT_METHOD_INVALID",
  PAYMENT_METHOD_MISMATCH: "ORDER_PAYMENT_METHOD_MISMATCH",
  PRODUCT_UNAVAILABLE: "ORDER_PRODUCT_UNAVAILABLE",
  CURRENCY_MISMATCH: "ORDER_CURRENCY_MISMATCH",
  NOT_ALLOWED: "ORDER_NOT_ALLOWED",
  RATE_LIMITED: "ORDER_RATE_LIMITED",
  CREATE_FAILED: "ORDER_CREATE_FAILED",
} as const;

export type OrderErrorCode =
  (typeof ORDER_ERROR_CODES)[keyof typeof ORDER_ERROR_CODES];

export type CreateOrderInput = {
  line1: string;
  line2?: string;
  city: string;
  district: string;
  postalCode: string;
  paymentMethod: PaymentMethod;
};

export type CreateOrderResult =
  | { ok: true; orderId: string; paymentMethod: PaymentMethod }
  | { ok: false; error: string; code?: OrderErrorCode };

export type CreateOrderActionState = {
  ok?: boolean;
  orderId?: string;
  paymentMethod?: PaymentMethod;
  error?: string;
  code?: OrderErrorCode;
};
