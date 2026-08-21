"use server";

/**
 * PayHere checkout hash client (step 1.25).
 * Calls Appwrite Function `payhere-checkout-hash` — sandbox action URL only until merchant authorization.
 * See docs/agent/PAYHERE.md. Merchant secret never leaves Function env.
 */

import { ExecutionMethod } from "node-appwrite";
import {
  FUNCTION_PAYHERE_CHECKOUT_HASH,
  hasAppwritePublicConfig,
} from "@/lib/appwrite/config";
import { createSessionClient } from "@/lib/appwrite/server";
import { getLoggedInUser } from "@/lib/appwrite/session";
import { isPayHereCheckoutEnabled } from "@/lib/services/platform-settings";
import {
  assertRateLimit,
  getClientIp,
  RATE_LIMIT_MESSAGE,
  RATE_LIMITS,
} from "@/lib/security/rate-limit";
import {
  isPayHereSandboxActionUrl,
  parsePayHereCheckoutPayload,
  type PayHereCheckoutHashRequest,
  type PayHereCheckoutHashResult,
} from "@/lib/types/payhere";

const ORDER_ID_MAX = 36;
const NOT_CONFIGURED = "PayHere checkout is not configured yet.";
const GENERIC_FAILURE =
  "Unable to start PayHere checkout. Please try again later.";

/** Normalize orderId; empty/invalid → null. Not exported — "use server" allows async exports only. */
function normalizePayHereOrderId(
  raw: string | null | undefined,
): string | null {
  if (raw == null) return null;
  const orderId = raw.trim().slice(0, ORDER_ID_MAX);
  return orderId.length > 0 ? orderId : null;
}

function mapExecutionError(error: unknown): string {
  if (!(error instanceof Error)) return NOT_CONFIGURED;
  const message = error.message.toLowerCase();
  // Missing function / not found / forbidden execute — treat as not ready.
  if (
    message.includes("function") &&
    (message.includes("not found") ||
      message.includes("could not be found") ||
      message.includes("404"))
  ) {
    return NOT_CONFIGURED;
  }
  if (
    message.includes("not found") ||
    message.includes("404") ||
    message.includes("unknown function")
  ) {
    return NOT_CONFIGURED;
  }
  return GENERIC_FAILURE;
}

/**
 * Request a PayHere checkout form payload for an order (signed-in buyer).
 * Amount/currency must be resolved inside the Function from DB — never trust client totals.
 * Only sandbox `actionUrl` is accepted (step 1.25). Bank/free checkout never call this.
 */
export async function requestPayHereCheckout(
  orderId: string,
): Promise<PayHereCheckoutHashResult> {
  const normalized = normalizePayHereOrderId(orderId);
  if (!normalized) {
    return { ok: false, error: "Invalid order id." };
  }

  if (!hasAppwritePublicConfig()) {
    return { ok: false, error: NOT_CONFIGURED };
  }

  const payhereEnabled = await isPayHereCheckoutEnabled();
  if (!payhereEnabled) {
    return { ok: false, error: NOT_CONFIGURED };
  }

  const user = await getLoggedInUser();
  if (!user) {
    return { ok: false, error: "You must be signed in to checkout." };
  }

  const ip = await getClientIp();
  const limited = assertRateLimit({
    bucket: "payhere-checkout",
    key: `${user.$id}:${ip}`,
    ...RATE_LIMITS.checkout,
  });
  if (!limited.ok) {
    return { ok: false, error: RATE_LIMIT_MESSAGE };
  }

  const body: PayHereCheckoutHashRequest = { orderId: normalized };

  try {
    const { functions } = await createSessionClient();
    const execution = await functions.createExecution({
      functionId: FUNCTION_PAYHERE_CHECKOUT_HASH,
      body: JSON.stringify(body),
      async: false,
      method: ExecutionMethod.POST,
      headers: { "content-type": "application/json" },
    });

    if (execution.status === "failed") {
      return { ok: false, error: GENERIC_FAILURE };
    }

    if (
      execution.responseStatusCode < 200 ||
      execution.responseStatusCode >= 300
    ) {
      // Prefer typed Function JSON error if present; never leak internals.
      try {
        const errBody = JSON.parse(execution.responseBody) as {
          error?: unknown;
        };
        if (
          typeof errBody?.error === "string" &&
          errBody.error.length > 0 &&
          errBody.error.length <= 200 &&
          !/secret|api.?key|stack/i.test(errBody.error)
        ) {
          return { ok: false, error: errBody.error };
        }
      } catch {
        // ignore parse errors
      }
      if (
        execution.responseStatusCode === 404 ||
        execution.responseStatusCode === 501
      ) {
        return { ok: false, error: NOT_CONFIGURED };
      }
      return { ok: false, error: GENERIC_FAILURE };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(execution.responseBody);
    } catch {
      return { ok: false, error: GENERIC_FAILURE };
    }

    // Allow either bare payload or `{ ok: true, payload }` from Function.
    let candidate = parsed;
    if (
      parsed &&
      typeof parsed === "object" &&
      "payload" in (parsed as object) &&
      (parsed as { ok?: unknown }).ok === true
    ) {
      candidate = (parsed as { payload: unknown }).payload;
    }

    const payload = parsePayHereCheckoutPayload(candidate);
    if (!payload || !isPayHereSandboxActionUrl(payload.actionUrl)) {
      return { ok: false, error: GENERIC_FAILURE };
    }

    return { ok: true, payload };
  } catch (error) {
    return { ok: false, error: mapExecutionError(error) };
  }
}
