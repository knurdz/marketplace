/**
 * End-to-end PayHere check against the local MariaDB (needs `npm run seed` first).
 * Uses throwaway sandbox credentials set in-process only; creates and deletes its own order.
 * Run: npx tsx --env-file=.env.local scripts/verify-payhere-e2e.ts
 */
process.env.PAYHERE_MERCHANT_ID = "1211149";
process.env.PAYHERE_MERCHANT_SECRET = "e2e-test-secret";
process.env.PAYHERE_SANDBOX = "true";
process.env.PAYHERE_NOTIFY_URL = "https://example.test/api/payhere/notify";
process.env.APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

import { eq, inArray } from "drizzle-orm";
import { getDb, getPool, newId } from "../lib/db/client";
import {
  authUser,
  notifications,
  orderItems,
  orders,
  payhereNotifyLogs,
  payments,
  products,
} from "../lib/db/schema";
import { runPayHereCheckoutHash } from "../lib/payhere/checkout-hash";
import { computeNotifyMd5sig } from "../lib/payhere/md5";
import { handlePayHereNotifyRequest } from "../lib/payhere/notify-handler";

const MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID!;
const SECRET = process.env.PAYHERE_MERCHANT_SECRET!;
let failures = 0;

function check(ok: boolean, label: string) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}`);
  if (!ok) failures++;
}

function notifyBody(
  orderId: string,
  statusCode: string,
  opts: { amount?: string; paymentId?: string; secret?: string } = {},
) {
  const amount = opts.amount ?? "500.00";
  const md5sig = computeNotifyMd5sig({
    merchantId: MERCHANT_ID,
    orderId,
    payhereAmount: amount,
    payhereCurrency: "LKR",
    statusCode,
    merchantSecret: opts.secret ?? SECRET,
  });
  return new URLSearchParams({
    merchant_id: MERCHANT_ID,
    order_id: orderId,
    payment_id: opts.paymentId ?? "320025000001",
    payhere_amount: amount,
    payhere_currency: "LKR",
    status_code: statusCode,
    md5sig,
    method: "TEST",
    status_message: "Test",
  }).toString();
}

async function main() {
  const db = getDb();
  const [buyer] = await db.select().from(authUser).where(eq(authUser.email, "buyer@knurdz.demo"));
  const [seller] = await db.select().from(authUser).where(eq(authUser.email, "seller@knurdz.demo"));
  const [product] = await db.select().from(products).where(eq(products.id, "seed_demo_product"));
  if (!buyer || !seller || !product) throw new Error("Run `npm run seed` first.");

  const orderId = newId();
  const paymentId = newId();
  const stockBefore = product.stock;

  await db.insert(orders).values({
    id: orderId,
    buyerId: buyer.id,
    sellerId: seller.id,
    status: "pending_payment",
    totalAmount: "500.00",
    currency: "LKR",
    shippingAddress: "1 Test Road, Colombo, Sri Lanka",
    paymentMethod: "payhere",
  });
  await db.insert(orderItems).values({
    id: newId(),
    orderId,
    productId: product.id,
    title: product.title,
    quantity: 1,
    unitPrice: "500.00",
    lineTotal: "500.00",
  });
  await db.insert(payments).values({
    id: paymentId,
    orderId,
    method: "payhere",
    status: "pending",
    amount: "500.00",
    currency: "LKR",
  });

  const status = async () => {
    const [o] = await db.select().from(orders).where(eq(orders.id, orderId));
    const [p] = await db.select().from(payments).where(eq(payments.id, paymentId));
    return { order: o.status, payment: p.status };
  };

  try {
    // Checkout hash
    const stranger = await runPayHereCheckoutHash({ userId: seller.id, orderId });
    check(!stranger.ok, "checkout refused for a user who does not own the order");

    const checkout = await runPayHereCheckoutHash({ userId: buyer.id, orderId });
    check(checkout.ok, "checkout payload built for the buyer");
    if (checkout.ok) {
      const f = checkout.payload.fields as Record<string, string>;
      check(f.amount === "500.00" && f.currency === "LKR", "amount/currency formatted");
      check(/^[A-F0-9]{32}$/.test(f.hash), "hash is uppercase md5");
      check(!JSON.stringify(checkout.payload).includes(SECRET), "merchant secret not in payload");
      check(checkout.payload.actionUrl.includes("sandbox.payhere.lk"), "sandbox action URL");
    }

    // Notify: bad signature is ignored
    let res = await handlePayHereNotifyRequest(notifyBody(orderId, "2", { secret: "wrong" }));
    check(res.status === 200 && (await status()).payment === "pending", "bad signature ignored");

    // Notify: amount tampering rejected
    res = await handlePayHereNotifyRequest(notifyBody(orderId, "2", { amount: "1.00" }));
    check((await status()).payment === "pending", "amount mismatch rejected");

    // Notify: pending status is a no-op
    await handlePayHereNotifyRequest(notifyBody(orderId, "0"));
    check((await status()).payment === "pending", "status 0 (pending) is a no-op");

    // Notify: two concurrent success callbacks settle exactly once
    const results = await Promise.all([
      handlePayHereNotifyRequest(notifyBody(orderId, "2")),
      handlePayHereNotifyRequest(notifyBody(orderId, "2")),
    ]);
    check(results.every((r) => r.status === 200), "concurrent success notifies return 200");
    const afterPaid = await status();
    check(afterPaid.order === "paid" && afterPaid.payment === "paid", "order + payment marked paid");
    const paidNotes = await db
      .select()
      .from(notifications)
      .where(eq(notifications.link, `/orders/${orderId}`));
    check(paidNotes.length === 1, `buyer notified once (got ${paidNotes.length})`);

    // Notify: late failure must not downgrade a paid payment
    await handlePayHereNotifyRequest(notifyBody(orderId, "-2"));
    check((await status()).payment === "paid", "late failure does not overwrite paid");

    // Notify: chargeback refunds and restores stock
    await handlePayHereNotifyRequest(notifyBody(orderId, "-3"));
    const afterRefund = await status();
    check(
      afterRefund.order === "refunded" && afterRefund.payment === "refunded",
      "chargeback marks order + payment refunded",
    );
    const [p2] = await db.select().from(products).where(eq(products.id, product.id));
    check(p2.stock === stockBefore + 1, "chargeback restored stock");

    const logs = await db
      .select()
      .from(payhereNotifyLogs)
      .where(eq(payhereNotifyLogs.orderId, orderId));
    check(logs.length >= 6, `notify log rows written (${logs.length})`);
    check(!JSON.stringify(logs).includes(SECRET), "notify logs contain no secret");
  } finally {
    await db.delete(notifications).where(
      inArray(notifications.link, [`/orders/${orderId}`, `/seller/orders/${orderId}`]),
    );
    await db.delete(payhereNotifyLogs).where(eq(payhereNotifyLogs.orderId, orderId));
    await db.delete(payments).where(eq(payments.orderId, orderId));
    await db.delete(orderItems).where(eq(orderItems.orderId, orderId));
    await db.delete(orders).where(eq(orders.id, orderId));
    await db.update(products).set({ stock: stockBefore }).where(eq(products.id, product.id));
  }

  console.log(failures === 0 ? "\nAll PayHere checks passed." : `\n${failures} check(s) failed.`);
  if (failures) process.exitCode = 1;
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => getPool().end());
