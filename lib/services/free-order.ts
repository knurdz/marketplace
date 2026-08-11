"use server";

/**
 * Free order confirmation client (step 2.7 / Member 1 step 1.24).
 * Member 1 owns the real confirm body (ownership, amount=0, idempotent paid writes).
 * See docs/agent/PAYHERE.md — contract name `confirmFreeOrder`.
 */

import { getLoggedInUser } from "@/lib/appwrite/session";
import type {
  ConfirmFreeOrderRequest,
  ConfirmFreeOrderResult,
} from "@/lib/types/payhere";

const ORDER_ID_MAX = 36;
const NOT_CONFIGURED =
  "Free order confirmation is not configured yet." as const;

function normalizeOrderId(
  raw: string | null | undefined,
): string | null {
  if (raw == null) return null;
  const orderId = raw.trim().slice(0, ORDER_ID_MAX);
  return orderId.length > 0 ? orderId : null;
}

/**
 * Confirm a free order via Member 1 contract.
 * Stub: validates session + orderId only — never writes `paid` from Member 2.
 */
export async function confirmFreeOrder(
  request: ConfirmFreeOrderRequest,
): Promise<ConfirmFreeOrderResult> {
  const orderId = normalizeOrderId(request.orderId);
  if (!orderId) {
    return { ok: false, error: "Invalid order id." };
  }

  const user = await getLoggedInUser();
  if (!user) {
    return { ok: false, error: "You must be signed in to confirm your order." };
  }

  // Member 1 step 1.24 replaces this body with live confirm (Function or server route).
  void orderId;
  void user;
  return { ok: false, error: NOT_CONFIGURED };
}
