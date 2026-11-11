import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../lib/db/schema.ts";

const url = process.env.DATABASE_URL?.trim();
if (!url) {
  console.error("Missing DATABASE_URL");
  process.exit(1);
}

const pool = mysql.createPool(url);
const db = drizzle(pool, { schema, mode: "default" });
const reqId = process.argv[2];
if (!reqId) {
  console.error("Usage: node --env-file=.env.local scripts/verify-purchase-request-sold.mjs <requestId>");
  process.exit(1);
}

const [req] = await db
  .select()
  .from(schema.purchaseRequests)
  .where(eq(schema.purchaseRequests.id, reqId));
if (!req) {
  console.error("Request not found");
  process.exit(1);
}
console.log("request", {
  status: req.status,
  quantity: req.quantity,
  productId: req.productId,
});

const [prod] = await db
  .select()
  .from(schema.products)
  .where(eq(schema.products.id, req.productId));
console.log("stock before", prod?.stock);

const conn = await pool.getConnection();
try {
  await conn.beginTransaction();
  const [dec] = await conn.execute(
    "UPDATE `products` SET `stock` = `stock` - ? WHERE id = ? AND `stock` - ? >= 0",
    [req.quantity, req.productId, req.quantity],
  );
  const affected = Number(dec.affectedRows ?? 0);
  if (affected === 0) throw new Error("stock decrement failed");
  await conn.execute(
    "UPDATE `purchase_requests` SET `status` = 'sold' WHERE id = ? AND `status` = 'requested'",
    [reqId],
  );
  await conn.commit();
} catch (error) {
  await conn.rollback();
  throw error;
} finally {
  conn.release();
}

const [req2] = await db
  .select()
  .from(schema.purchaseRequests)
  .where(eq(schema.purchaseRequests.id, reqId));
const [prod2] = await db
  .select()
  .from(schema.products)
  .where(eq(schema.products.id, req.productId));
console.log("request after", req2?.status);
console.log("stock after", prod2?.stock);
await pool.end();
