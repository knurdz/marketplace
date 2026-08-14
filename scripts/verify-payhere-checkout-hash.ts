/**
 * Step 1.22 checks for PayHere checkout hash helpers (no live Function / no secrets).
 * Run: npx tsx scripts/verify-payhere-checkout-hash.ts
 */
import { createHash } from "node:crypto";
import { parsePayHereCheckoutPayload } from "../lib/types/payhere";
import {
  computePayHereCheckoutHash,
  formatPayHereAmount,
  isSandboxEnv,
  parseOrderIdFromBody,
  payloadContainsSecret,
  PAYHERE_CHECKOUT_LIVE_URL,
  PAYHERE_CHECKOUT_SANDBOX_URL,
} from "../functions/payhere-checkout-hash/src/hash.js";
import {
  ALREADY_PAID,
  BAD_AMOUNT,
  buildPayHereCheckoutPayload,
  evaluatePayHereHashRequest,
  NOT_FOUND,
  NOT_PAYHERE,
} from "../functions/payhere-checkout-hash/src/payload.js";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`FAIL: ${message}`);
}

function md5Upper(text: string): string {
  return createHash("md5").update(text, "utf8").digest("hex").toUpperCase();
}

const order = {
  $id: "ord_abc",
  buyerId: "buyer_1",
  sellerId: "seller_1",
  status: "pending_payment",
  totalAmount: 1500,
  currency: "LKR",
  shippingAddress: "12 Main St\nColombo\nColombo\n00100",
  paymentMethod: "payhere",
};

const payment = {
  $id: "pay_1",
  orderId: "ord_abc",
  method: "payhere",
  status: "pending",
  amount: 1500,
  currency: "LKR",
};

const items = [
  {
    $id: "item_1",
    orderId: "ord_abc",
    productId: "prod_1",
    title: "Campus Hoodie",
    quantity: 1,
  },
];

assert(formatPayHereAmount(1000) === "1000.00", "amount 1000 formats");
assert(formatPayHereAmount(10.5) === "10.50", "amount 10.5 formats");
assert(formatPayHereAmount(0) === null, "zero amount rejected");
assert(formatPayHereAmount(-1) === null, "negative amount rejected");

const secret = "test-merchant-secret";
const expected = md5Upper(`123456ord_abc1500.00LKR${md5Upper(secret)}`);
assert(
  computePayHereCheckoutHash({
    merchantId: "123456",
    orderId: "ord_abc",
    amountFormatted: "1500.00",
    currency: "LKR",
    merchantSecret: secret,
  }) === expected,
  "checkout hash matches PayHere formula",
);

assert(isSandboxEnv(undefined) === true, "sandbox default true");
assert(isSandboxEnv("true") === true, "sandbox true");
assert(isSandboxEnv("false") === false, "sandbox false");
assert(isSandboxEnv("live") === false, "sandbox live");

assert(
  parseOrderIdFromBody({ orderId: "ord_abc", amount: "0.00" }) === "ord_abc",
  "extra client amount ignored when reading orderId",
);
assert(parseOrderIdFromBody({}) === null, "missing orderId");
assert(parseOrderIdFromBody("not-json") === null, "invalid json");

assert(
  evaluatePayHereHashRequest({
    userId: "other",
    order,
    payment,
    items,
  }).error === NOT_FOUND,
  "IDOR other buyer",
);

assert(
  evaluatePayHereHashRequest({
    userId: "buyer_1",
    order: { ...order, paymentMethod: "free" },
    payment: { ...payment, method: "free", amount: 0 },
    items,
  }).error === NOT_PAYHERE,
  "free method rejected",
);

assert(
  evaluatePayHereHashRequest({
    userId: "buyer_1",
    order,
    payment: { ...payment, amount: 0 },
    items,
  }).error === BAD_AMOUNT,
  "zero payment amount rejected",
);

assert(
  evaluatePayHereHashRequest({
    userId: "buyer_1",
    order,
    payment: { ...payment, status: "paid" },
    items,
  }).error === ALREADY_PAID,
  "already paid rejected",
);

const forged = buildPayHereCheckoutPayload({
  userId: "buyer_1",
  order,
  payment,
  items,
  merchantId: "123456",
  merchantSecret: secret,
  appUrl: "https://knurdz.example",
  notifyUrl: "https://example.com/functions/payhere-notify/executions",
  sandbox: true,
  email: "buyer@knurdz.demo",
  displayName: "Ada Buyer",
  phone: "0771234567",
  clientAmount: "0.01",
});

assert(forged.ok === true, "happy path builds payload");
if (forged.ok) {
  assert(
    forged.payload.fields.amount === "1500.00",
    "amount comes from DB not client",
  );
  assert(
    forged.payload.actionUrl === PAYHERE_CHECKOUT_SANDBOX_URL,
    "sandbox action url",
  );
  assert(
    forged.payload.fields.hash === expected,
    "payload hash uses DB amount",
  );
  assert(
    !JSON.stringify(forged.payload).includes(secret),
    "merchant secret not in payload JSON",
  );
  assert(
    payloadContainsSecret(forged.payload, secret) === false,
    "payloadContainsSecret false for clean payload",
  );
  assert(
    payloadContainsSecret({ merchant_secret: secret }, secret) === true,
    "detects secret key",
  );
  const parsed = parsePayHereCheckoutPayload(forged.payload);
  assert(parsed !== null, "payload matches Next parsePayHereCheckoutPayload");
  assert(
    forged.payload.fields.return_url.includes("orderId=ord_abc"),
    "return_url includes order id",
  );
  assert(
    forged.payload.fields.first_name === "Ada" &&
      forged.payload.fields.last_name === "Buyer",
    "display name split",
  );
}

const live = buildPayHereCheckoutPayload({
  userId: "buyer_1",
  order,
  payment,
  items,
  merchantId: "123456",
  merchantSecret: secret,
  appUrl: "https://knurdz.example",
  notifyUrl: "https://example.com/notify",
  sandbox: false,
  email: "buyer@knurdz.demo",
  displayName: "Ada Buyer",
  phone: "0771234567",
});
assert(live.ok === true, "live payload ok");
if (live.ok) {
  assert(
    live.payload.actionUrl === PAYHERE_CHECKOUT_LIVE_URL,
    "live action url",
  );
}

const missingSecret = buildPayHereCheckoutPayload({
  userId: "buyer_1",
  order,
  payment,
  items,
  merchantId: "123456",
  merchantSecret: "",
  appUrl: "https://knurdz.example",
  notifyUrl: "https://example.com/notify",
  sandbox: true,
  email: "buyer@knurdz.demo",
  displayName: "Ada",
  phone: "",
});
assert(missingSecret.ok === false, "missing secret → not configured");
if (!missingSecret.ok) {
  assert(missingSecret.status === 501, "501 when secret missing");
}

console.log("payhere-checkout-hash helper checks passed");
