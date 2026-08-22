/**
 * Compare live Appwrite tables/columns/enums/indexes against code constants.
 * Run: npm run schema:verify
 */
import { Client, TablesDB } from "node-appwrite";
import { ALL_TABLE_IDS } from "../lib/appwrite/config";
import { PAYMENT_METHODS, ORDER_STATUSES } from "../lib/types/status";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`FAIL: ${message}`);
}

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.trim();
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID?.trim();
const apiKey = process.env.APPWRITE_API_KEY?.trim();

if (!endpoint || !projectId || !apiKey) {
  console.error("Missing Appwrite env (endpoint, project id, API key).");
  process.exit(1);
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);
const db = new TablesDB(client);
const DATABASE_ID = "marketplace";

async function main() {
  const tables = await db.listTables({ databaseId: DATABASE_ID });
  const have = new Set(tables.tables.map((t) => t.$id));

  const missing = ALL_TABLE_IDS.filter((id) => !have.has(id));
  assert(missing.length === 0, `missing tables: ${missing.join(", ")}`);

  const orderCols = await db.listColumns({
    databaseId: DATABASE_ID,
    tableId: "orders",
  });
  const orderKeys = new Set(orderCols.columns.map((c) => c.key));
  for (const key of [
    "buyerId",
    "sellerId",
    "status",
    "totalAmount",
    "currency",
    "shippingAddress",
    "paymentMethod",
    "couponCode",
    "discountAmount",
  ]) {
    assert(orderKeys.has(key), `orders missing column ${key}`);
  }

  const paymentMethodCol = orderCols.columns.find(
    (c) => c.key === "paymentMethod",
  ) as { elements?: string[] } | undefined;
  for (const method of PAYMENT_METHODS) {
    assert(
      paymentMethodCol?.elements?.includes(method) ?? false,
      `orders.paymentMethod missing ${method}`,
    );
  }

  const statusCol = orderCols.columns.find((c) => c.key === "status") as
    | { elements?: string[] }
    | undefined;
  for (const status of ORDER_STATUSES) {
    assert(
      statusCol?.elements?.includes(status) ?? false,
      `orders.status missing ${status}`,
    );
  }

  const paymentCols = await db.listColumns({
    databaseId: DATABASE_ID,
    tableId: "payments",
  });
  const paymentMethod = paymentCols.columns.find((c) => c.key === "method") as
    | { elements?: string[] }
    | undefined;
  for (const method of PAYMENT_METHODS) {
    assert(
      paymentMethod?.elements?.includes(method) ?? false,
      `payments.method missing ${method}`,
    );
  }

  const reviewIndexes = await db.listIndexes({
    databaseId: DATABASE_ID,
    tableId: "reviews",
  });
  assert(
    reviewIndexes.indexes.some((i) => i.key === "order_buyer_product_unique"),
    "reviews missing order_buyer_product_unique",
  );

  const redemptionIndexes = await db.listIndexes({
    databaseId: DATABASE_ID,
    tableId: "coupon_redemptions",
  });
  assert(
    redemptionIndexes.indexes.some((i) => i.key === "coupon_buyer_unique"),
    "coupon_redemptions missing coupon_buyer_unique",
  );

  const rateLimitIndexes = await db.listIndexes({
    databaseId: DATABASE_ID,
    tableId: "rate_limits",
  });
  assert(
    rateLimitIndexes.indexes.some((i) => i.key === "bucket_key_unique"),
    "rate_limits missing bucket_key_unique",
  );

  const sellerCols = await db.listColumns({
    databaseId: DATABASE_ID,
    tableId: "seller_profiles",
  });
  const sellerKeys = new Set(sellerCols.columns.map((c) => c.key));
  assert(
    sellerKeys.has("bankTransferNotes"),
    "seller_profiles missing bankTransferNotes",
  );

  const slipIndexes = await db.listIndexes({
    databaseId: DATABASE_ID,
    tableId: "bank_slips",
  });
  assert(
    slipIndexes.indexes.some((i) => i.key === "fileId_idx"),
    "bank_slips missing fileId_idx",
  );

  console.log("verify-schema-drift: OK");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
