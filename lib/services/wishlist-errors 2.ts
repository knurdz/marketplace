export const WISHLIST_ERROR_CODES = {
  NOT_AUTHENTICATED: "WISHLIST_NOT_AUTHENTICATED",
  NOT_CONFIGURED: "WISHLIST_NOT_CONFIGURED",
  PRODUCT_UNAVAILABLE: "WISHLIST_PRODUCT_UNAVAILABLE",
  NOT_FOUND: "WISHLIST_NOT_FOUND",
  NOT_ALLOWED: "WISHLIST_NOT_ALLOWED",
  RATE_LIMITED: "WISHLIST_RATE_LIMITED",
} as const;

export type WishlistErrorCode =
  (typeof WISHLIST_ERROR_CODES)[keyof typeof WISHLIST_ERROR_CODES];

export type WishlistActionState = {
  error?: string;
  success?: string;
  errorCode?: WishlistErrorCode;
  saved?: boolean;
};
