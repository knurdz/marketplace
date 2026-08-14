/**
 * Step 4.13: redact PayHere notify log text before admin UI.
 * Run: npx tsx scripts/verify-notify-log-redact.ts
 */
import {
  isNotifyLogIssue,
  parseNotifyLogText,
  redactNotifyLogText,
} from "../lib/services/notify-log-redact";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`FAIL: ${message}`);
}

const leaked = redactNotifyLogText(
  [
    "payhere-notify ignored reason=bad_sig md5sig=ABCDEF0123456789",
    'payload={"md5sig":"deadbeef","hash":"ffff","order_id":"ord_1"}',
    "merchant_secret=super-secret-value hash=ABC123",
    "card_no=4111111111111111 cvv=123 Authorization: Bearer tok_live_abc",
    "x-appwrite-key=sk_secret api_key=xyz",
  ].join("\n"),
);

assert(!leaked.includes("ABCDEF0123456789"), "md5sig assignment redacted");
assert(!leaked.includes("deadbeef"), "json md5sig redacted");
assert(!leaked.includes("ffff"), "json hash redacted");
assert(!leaked.includes("super-secret-value"), "merchant_secret redacted");
assert(!leaked.includes("ABC123"), "hash assignment redacted");
assert(!leaked.includes("4111111111111111"), "card_no redacted");
assert(!leaked.includes("tok_live_abc"), "bearer token redacted");
assert(!leaked.includes("sk_secret"), "x-appwrite-key redacted");
assert(leaked.includes("[redacted]"), "redaction marker present");
assert(leaked.includes("reason=bad_sig"), "safe reason kept");
assert(leaked.includes("ord_1"), "order id in json kept");

const ignored = parseNotifyLogText(
  "payhere-notify ignored reason=bad_sig",
);
assert(ignored.outcome === "ignored", "ignored outcome");
assert(ignored.reason === "bad_sig", "ignored reason");

const rejected = parseNotifyLogText(
  "payhere-notify reject order=ord_abc reason=amount_mismatch",
);
assert(rejected.outcome === "rejected", "rejected outcome");
assert(rejected.orderId === "ord_abc", "rejected order");
assert(rejected.reason === "amount_mismatch", "rejected reason");

const settled = parseNotifyLogText("payhere-notify settled order=ord_ok");
assert(settled.outcome === "settled", "settled outcome");
assert(!isNotifyLogIssue(settled.outcome, "completed", 200), "settled not issue");
assert(isNotifyLogIssue("ignored", "completed", 200), "ignored is issue");
assert(isNotifyLogIssue("unknown", "failed", 200), "failed execution is issue");
assert(isNotifyLogIssue("unknown", "completed", 500), "http 500 is issue");

console.log("notify-log redact checks passed");
