import {
  amountsMatch,
  computeNotifyMd5sig,
  currenciesMatch,
  mapNotifyStatus,
  md5sigMatches,
  payhereIdempotencyKey,
} from "./md5";

export function verifyNotifySignature(
  posted: Record<string, string>,
  merchantSecret: string,
  expectedMerchantId: string,
) {
  const merchantId = String(posted.merchant_id ?? "").trim();
  const orderId = String(posted.order_id ?? "").trim();
  const payhereAmount = String(posted.payhere_amount ?? "").trim();
  const payhereCurrency = String(posted.payhere_currency ?? "").trim();
  const statusCode = String(posted.status_code ?? "").trim();
  const md5sig = String(posted.md5sig ?? "").trim();

  if (
    !merchantId ||
    !orderId ||
    !payhereAmount ||
    !payhereCurrency ||
    !statusCode ||
    !md5sig
  ) {
    return { ok: false as const, reason: "missing_fields" };
  }

  if (expectedMerchantId && merchantId !== String(expectedMerchantId).trim()) {
    return { ok: false as const, reason: "merchant_mismatch" };
  }

  const expected = computeNotifyMd5sig({
    merchantId,
    orderId,
    payhereAmount,
    payhereCurrency,
    statusCode,
    merchantSecret,
  });

  if (!md5sigMatches(expected, md5sig)) {
    return { ok: false as const, reason: "bad_sig" };
  }

  return { ok: true as const };
}

type OrderSnap = {
  $id: string;
  status: string;
  totalAmount: number;
  currency: string;
  paymentMethod: string;
};

type PaymentSnap = {
  $id: string;
  orderId: string;
  method: string;
  status: string;
  amount: number;
  currency: string;
};

export function decideNotifyAction(params: {
  posted: Record<string, string>;
  order: OrderSnap | null;
  payment: PaymentSnap | null;
}) {
  const { posted, order, payment } = params;

  if (!order || !payment) {
    return { action: "reject" as const, reason: "order_not_found" };
  }

  if (payment.orderId !== order.$id || posted.order_id !== order.$id) {
    return { action: "reject" as const, reason: "order_mismatch" };
  }

  if (order.paymentMethod !== "payhere" || payment.method !== "payhere") {
    return { action: "reject" as const, reason: "wrong_method" };
  }

  const kind = mapNotifyStatus(posted.status_code);

  if (kind === "pending" || kind === "unknown") {
    return { action: "noop" as const };
  }

  if (kind === "canceled" || kind === "failed") {
    if (payment.status === "paid" || payment.status === "refunded") {
      return { action: "noop" as const };
    }
    return { action: "mark_failed" as const };
  }

  if (kind === "chargeback") {
    if (payment.status === "refunded") {
      return { action: "noop" as const };
    }
    if (payment.status === "paid") {
      return { action: "mark_refunded" as const };
    }
    return { action: "noop" as const };
  }

  if (payment.status === "paid") {
    return { action: "noop" as const };
  }

  if (order.status === "cancelled" || order.status === "refunded") {
    return { action: "reject" as const, reason: "order_closed" };
  }

  if (!amountsMatch(order.totalAmount, payment.amount)) {
    return { action: "reject" as const, reason: "order_payment_amount_mismatch" };
  }

  if (!amountsMatch(payment.amount, posted.payhere_amount)) {
    return { action: "reject" as const, reason: "amount_mismatch" };
  }

  if (!currenciesMatch(payment.currency, posted.payhere_currency)) {
    return { action: "reject" as const, reason: "currency_mismatch" };
  }

  const payherePaymentId = String(posted.payment_id ?? "").trim();
  if (!payherePaymentId) {
    return { action: "reject" as const, reason: "missing_payment_id" };
  }

  return {
    action: "settle" as const,
    payherePaymentId,
    idempotencyKey: payhereIdempotencyKey(payherePaymentId),
  };
}
