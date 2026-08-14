/**
 * Step 1.23 checks for PayHere notify md5sig + action mapping (no live Function).
 * Run: npx tsx scripts/verify-payhere-notify.ts
 */
import { createHash } from "node:crypto";
import {
  amountsMatch,
  computeNotifyMd5sig,
  formatPayHereAmount,
  md5sigMatches,
  parseNotifyForm,
  payhereIdempotencyKey,
} from "../functions/payhere-notify/src/md5.js";
import {
  decideNotifyAction,
  verifyNotifySignature,
} from "../functions/payhere-notify/src/notify.js";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`FAIL: ${message}`);
}

function md5Upper(text: string): string {
  return createHash("md5").update(text, "utf8").digest("hex").toUpperCase();
}

const secret = "test-merchant-secret";
const merchantId = "123456";
const orderId = "ord_abc";
const amount = "1500.00";
const currency = "LKR";
const statusOk = "2";

const expectedSig = md5Upper(
  `${merchantId}${orderId}${amount}${currency}${statusOk}${md5Upper(secret)}`,
);

assert(
  computeNotifyMd5sig({
    merchantId,
    orderId,
    payhereAmount: amount,
    payhereCurrency: currency,
    statusCode: statusOk,
    merchantSecret: secret,
  }) === expectedSig,
  "notify md5sig matches PayHere formula",
);

assert(
  md5sigMatches(expectedSig, expectedSig.toLowerCase()),
  "sig case-insensitive",
);
assert(!md5sigMatches(expectedSig, "0".repeat(32)), "wrong sig rejected");
assert(formatPayHereAmount(1500) === "1500.00", "amount format");
assert(amountsMatch(1500, "1500.00"), "DB amount matches posted");
assert(!amountsMatch(1500, "1.00"), "forged amount rejected");
assert(payhereIdempotencyKey("ph_99") === "payhere:ph_99", "idempotency key");

const form = parseNotifyForm(
  `merchant_id=${merchantId}&order_id=${orderId}&payment_id=ph_99&payhere_amount=${amount}&payhere_currency=${currency}&status_code=${statusOk}&md5sig=${expectedSig}&card_no=4111111111111111`,
);
assert(form.order_id === orderId, "form order_id");
assert(!("card_no" in form), "PAN field not parsed");
assert(form.md5sig === expectedSig, "form md5sig");

assert(
  verifyNotifySignature(form, secret, merchantId).ok === true,
  "valid signature accepted",
);
assert(
  verifyNotifySignature({ ...form, md5sig: "DEADBEEF" }, secret, merchantId)
    .ok === false,
  "tampered sig rejected",
);
assert(
  verifyNotifySignature(form, secret, "other-merchant").ok === false,
  "merchant id mismatch rejected",
);

const order = {
  $id: orderId,
  buyerId: "buyer_1",
  status: "pending_payment",
  totalAmount: 1500,
  currency: "LKR",
  paymentMethod: "payhere",
};
const payment = {
  $id: "pay_1",
  orderId,
  method: "payhere",
  status: "pending",
  amount: 1500,
  currency: "LKR",
  payherePaymentId: null,
};

const settle = decideNotifyAction({ posted: form, order, payment });
assert(settle.action === "settle", "success settles");
if (settle.action === "settle") {
  assert(settle.payherePaymentId === "ph_99", "stores PayHere payment id");
}

const replay = decideNotifyAction({
  posted: form,
  order: { ...order, status: "paid" },
  payment: { ...payment, status: "paid", payherePaymentId: "ph_99" },
});
assert(replay.action === "noop", "replay of paid is idempotent noop");

const forgedAmt = decideNotifyAction({
  posted: { ...form, payhere_amount: "1.00" },
  order,
  payment,
});
assert(
  forgedAmt.action === "reject",
  "valid-looking notify with wrong amount rejected",
);

const failed = decideNotifyAction({
  posted: { ...form, status_code: "-2" },
  order,
  payment,
});
assert(failed.action === "mark_failed", "failed status marks payment failed");

const chargeback = decideNotifyAction({
  posted: { ...form, status_code: "-3" },
  order: { ...order, status: "paid" },
  payment: { ...payment, status: "paid" },
});
assert(chargeback.action === "mark_refunded", "chargeback on paid → refunded");

const pending = decideNotifyAction({
  posted: { ...form, status_code: "0" },
  order,
  payment,
});
assert(pending.action === "noop", "pending leaves unpaid");

console.log("payhere-notify helper checks passed");
