/**
 * Server-side error logger. Records DbException type/code/message and a call-site
 * tag. Never logs payloads, secrets, card data, or raw bank account numbers.
 */

import { DbException } from "@/lib/db/compat";

const SENSITIVE_KEY =
  /secret|password|token|authorization|cookie|md5sig|card|pan|cvv|account/i;

function sanitizeExtra(
  extra?: Record<string, string | number | boolean | null | undefined>,
): Record<string, string | number | boolean | null> {
  if (!extra) return {};
  const out: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(extra)) {
    if (SENSITIVE_KEY.test(key)) continue;
    if (value === undefined) continue;
    out[key] = value;
  }
  return out;
}

export function logError(
  tag: string,
  error: unknown,
  extra?: Record<string, string | number | boolean | null | undefined>,
): void {
  const payload: Record<string, unknown> = {
    tag,
    ...sanitizeExtra(extra),
  };

  if (error instanceof DbException) {
    payload.dbType = error.type;
    payload.dbCode = error.code;
    payload.message = error.message;
  } else if (error instanceof Error) {
    payload.name = error.name;
    payload.message = error.message;
  } else if (error != null) {
    payload.message = String(error);
  }

  console.error("[knurdz]", payload);
}

/** Server-side info logger (tags, masked identifiers). */
export function logInfo(
  tag: string,
  extra?: Record<string, string | number | boolean | null | undefined>,
): void {
  console.info("[knurdz]", { tag, ...sanitizeExtra(extra) });
}
