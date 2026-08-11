export const REPORT_ERROR_CODES = {
  NOT_AUTHENTICATED: "REPORT_NOT_AUTHENTICATED",
  NOT_CONFIGURED: "REPORT_NOT_CONFIGURED",
  PRODUCT_UNAVAILABLE: "REPORT_PRODUCT_UNAVAILABLE",
  INVALID_INPUT: "REPORT_INVALID_INPUT",
  NOT_ALLOWED: "REPORT_NOT_ALLOWED",
  RATE_LIMITED: "REPORT_RATE_LIMITED",
} as const;

export type ReportErrorCode =
  (typeof REPORT_ERROR_CODES)[keyof typeof REPORT_ERROR_CODES];

export type ReportActionState = {
  error?: string;
  success?: string;
  errorCode?: ReportErrorCode;
};
