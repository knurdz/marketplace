/**
 * Step 1.22 + 1.25 checks for PayHere checkout hash helpers (no live Function / no secrets).
 * Run: npx tsx scripts/verify-payhere-checkout-hash.ts
 */
import { createHash } from "node:crypto";
import {
  computePayHereCheckoutHash,
  checkoutActionUrl,
  evaluateSandboxCheckoutPolicy,
  formatPayHereAmount,
  isSandboxEnv,
  parseOrderIdFromBody,
  payloadContainsSecret,
  PAYHERE_CHECKOUT_LIVE_URL,
  PAYHERE_CHECKOUT_SANDBOX_URL,
} from "../functions/payhere-checkout-hash/src/hash.js";
import {
  isPayHereSandboxActionUrl,
  parsePayHereCheckoutPayload,
} from "../lib/types/payhere";
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

function isBuiltPayload(result: unknown): result is {
  ok: true;
  payload: { actionUrl: string; fields: Record<string, string> };
} {
  if (!result || typeof result !== "object") return false;
  const obj = result as { ok?: unknown; payload?: unknown };
  return obj.ok === true && !!obj.payload && typeof obj.payload === "object";
}

function isPolicyBlocked(result: unknown): result is {
  ok: false;
  status: number;
  error: string;
} {
  if (!result || typeof result !== "object") return false;
  const obj = result as { ok?: unknown; status?: unknown; error?: unknown };
  return (
    obj.ok === false &&
    typeof obj.status === "number" &&
    typeof obj.error === "string"
  );
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
  evaluateSandboxCheckoutPolicy(undefined).ok === true,
  "unset PAYHERE_SANDBOX allowed",
);
assert(
  evaluateSandboxCheckoutPolicy("true").ok === true,
  "PAYHERE_SANDBOX true allowed",
);
const liveBlocked = evaluateSandboxCheckoutPolicy("live");
assert(isPolicyBlocked(liveBlocked), "live env blocked");
if (isPolicyBlocked(liveBlocked)) {
  assert(liveBlocked.status === 501, "live env 501");
  assert(
    liveBlocked.error === "PayHere checkout is not configured yet.",
    "live env same not-configured message",
  );
}
assert(
  evaluateSandboxCheckoutPolicy("false").ok === false,
  "false env blocked",
);
assert(
  checkoutActionUrl(false) === PAYHERE_CHECKOUT_LIVE_URL,
  "helper still knows live URL for later authorization",
);
assert(
  checkoutActionUrl(true) === PAYHERE_CHECKOUT_SANDBOX_URL,
  "helper sandbox URL",
);

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

assert(isBuiltPayload(forged), "happy path builds payload");
if (isBuiltPayload(forged)) {
  const sandboxPayload = forged.payload;
  assert(
    sandboxPayload.fields.amount === "1500.00",
    "amount comes from DB not client",
  );
  assert(
    sandboxPayload.actionUrl === PAYHERE_CHECKOUT_SANDBOX_URL,
    "sandbox action url",
  );
  assert(
    sandboxPayload.fields.hash === expected,
    "payload hash uses DB amount",
  );
  assert(
    !JSON.stringify(sandboxPayload).includes(secret),
    "merchant secret not in payload JSON",
  );
  assert(
    payloadContainsSecret(sandboxPayload, secret) === false,
    "payloadContainsSecret false for clean payload",
  );
  assert(
    payloadContainsSecret({ merchant_secret: secret }, secret) === true,
    "detects secret key",
  );
  const parsed = parsePayHereCheckoutPayload(sandboxPayload);
  assert(parsed !== null, "payload matches Next parsePayHereCheckoutPayload");
  if (parsed) {
    assert(
      isPayHereSandboxActionUrl(parsed.actionUrl),
      "parsed actionUrl is sandbox",
    );
  }
  assert(
    sandboxPayload.fields.return_url.includes("orderId=ord_abc"),
    "return_url includes order id",
  );
  assert(
    sandboxPayload.fields.first_name === "Ada" &&
      sandboxPayload.fields.last_name === "Buyer",
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
assert(isBuiltPayload(live), "live payload helper still builds");
if (isBuiltPayload(live)) {
  assert(
    live.payload.actionUrl === PAYHERE_CHECKOUT_LIVE_URL,
    "live action url",
  );
  assert(
    parsePayHereCheckoutPayload(live.payload) === null,
    "Next parser rejects live actionUrl",
  );
  assert(
    isPayHereSandboxActionUrl(live.payload.actionUrl) === false,
    "live URL is not sandbox",
  );
}

assert(
  parsePayHereCheckoutPayload({
    actionUrl: PAYHERE_CHECKOUT_SANDBOX_URL,
    merchant_secret: "nope",
    fields: {},
  }) === null,
  "parser rejects secret-like keys",
);

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
assert(isPolicyBlocked(missingSecret), "missing secret → not configured");
if (isPolicyBlocked(missingSecret)) {
  assert(missingSecret.status === 501, "501 when secret missing");
}

console.log("payhere-checkout-hash helper checks passed");
