"use server";

import { hasAppwritePublicConfig } from "@/lib/appwrite/config";
import { getLoggedInUser } from "@/lib/appwrite/session";
import { isPayHereCheckoutEnabled } from "@/lib/services/platform-settings";
import { assertDurableRateLimit } from "@/lib/security/durable-rate-limit";
import {
  getClientIp,
  RATE_LIMIT_MESSAGE,
  RATE_LIMITS,
} from "@/lib/security/rate-limit";
import {
  isPayHereSandboxActionUrl,
  parsePayHereCheckoutPayload,
  type PayHereCheckoutHashResult,
} from "@/lib/types/payhere";
import { runPayHereCheckoutHash } from "@/lib/payhere/checkout-hash";

const ORDER_ID_MAX = 36;
const NOT_CONFIGURED = "PayHere checkout is not configured yet.";
const GENERIC_FAILURE =
  "Unable to start PayHere checkout. Please try again later.";

function normalizePayHereOrderId(
  raw: string | null | undefined,
): string | null {
  if (raw == null) return null;
  const orderId = raw.trim().slice(0, ORDER_ID_MAX);
  return orderId.length > 0 ? orderId : null;
}

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
  const limited = await assertDurableRateLimit({
    bucket: "payhere-checkout",
    key: `${user.$id}:${ip}`,
    ...RATE_LIMITS.checkout,
  });
  if (!limited.ok) {
    return { ok: false, error: RATE_LIMIT_MESSAGE };
  }

  const result = await runPayHereCheckoutHash({
    userId: user.$id,
    orderId: normalized,
  });

  if (!result.ok) {
    return result;
  }

  const payload = parsePayHereCheckoutPayload(result.payload);
  if (!payload || !isPayHereSandboxActionUrl(payload.actionUrl)) {
    return { ok: false, error: GENERIC_FAILURE };
  }

  return { ok: true, payload };
}
