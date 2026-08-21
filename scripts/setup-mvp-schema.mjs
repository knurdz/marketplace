/**
 * One-shot MVP TablesDB schema setup for Knurdz Marketplace.
 * Idempotent: skips existing tables/columns/indexes.
 * Usage: node --env-file=.env.local scripts/setup-mvp-schema.mjs
 */
import {
  Client,
  Permission,
  Role,
  TablesDB,
  TablesDBIndexType,
} from "node-appwrite";

const DATABASE_ID = "marketplace";

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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitColumnsAvailable(tableId, keys) {
  for (let attempt = 0; attempt < 40; attempt++) {
    const list = await db.listColumns({ databaseId: DATABASE_ID, tableId });
    const byKey = Object.fromEntries(list.columns.map((c) => [c.key, c]));
    const pending = keys.filter(
      (k) => !byKey[k] || byKey[k].status !== "available",
    );
    if (pending.length === 0) return;
    const failed = keys.filter((k) => byKey[k]?.status === "failed");
    if (failed.length) {
      throw new Error(
        `${tableId} columns failed: ${failed
          .map((k) => `${k}=${byKey[k].error}`)
          .join(", ")}`,
      );
    }
    await sleep(500);
  }
  throw new Error(`Timeout waiting for columns on ${tableId}`);
}

async function ensureTable(tableId, name, permissions, rowSecurity) {
  try {
    await db.getTable({ databaseId: DATABASE_ID, tableId });
    console.log(`= table exists: ${tableId}`);
  } catch {
    await db.createTable({
      databaseId: DATABASE_ID,
      tableId,
      name,
      permissions,
      rowSecurity,
      enabled: true,
    });
    console.log(`+ table created: ${tableId}`);
  }
}

function isIdempotentColumnError(e) {
  const msg = String(e?.message || e);
  return (
    msg.includes("already exists") ||
    e?.type === "column_limit_exceeded" ||
    msg.includes("column_limit_exceeded")
  );
}

async function ensureString(tableId, key, size, required, opts = {}) {
  try {
    await db.createStringColumn({
      databaseId: DATABASE_ID,
      tableId,
      key,
      size,
      required,
      ...opts,
    });
    console.log(`  + string ${tableId}.${key}`);
  } catch (e) {
    if (isIdempotentColumnError(e)) return;
    throw e;
  }
}

async function ensureEnum(tableId, key, elements, required, opts = {}) {
  try {
    await db.createEnumColumn({
      databaseId: DATABASE_ID,
      tableId,
      key,
      elements,
      required,
      ...opts,
    });
    console.log(`  + enum ${tableId}.${key}`);
  } catch (e) {
    if (isIdempotentColumnError(e)) return;
    throw e;
  }
}

async function ensureEnumElements(tableId, key, elements) {
  try {
    await db.updateEnumColumn({
      databaseId: DATABASE_ID,
      tableId,
      key,
      elements,
    });
    console.log(`  ~ enum elements ${tableId}.${key}`);
  } catch (e) {
    const msg = String(e?.message || e);
    if (msg.includes("not found") || msg.includes("could not be found")) {
      console.log(`  ! skip enum update ${tableId}.${key} (column missing)`);
      return;
    }
    throw e;
  }
}

async function ensureFloat(tableId, key, required, opts = {}) {
  try {
    await db.createFloatColumn({
      databaseId: DATABASE_ID,
      tableId,
      key,
      required,
      ...opts,
    });
    console.log(`  + float ${tableId}.${key}`);
  } catch (e) {
    if (isIdempotentColumnError(e)) return;
    throw e;
  }
}

async function ensureInt(tableId, key, required, opts = {}) {
  try {
    await db.createIntegerColumn({
      databaseId: DATABASE_ID,
      tableId,
      key,
      required,
      ...opts,
    });
    console.log(`  + integer ${tableId}.${key}`);
  } catch (e) {
    if (isIdempotentColumnError(e)) return;
    throw e;
  }
}

async function ensureBool(tableId, key, required, opts = {}) {
  try {
    await db.createBooleanColumn({
      databaseId: DATABASE_ID,
      tableId,
      key,
      required,
      ...opts,
    });
    console.log(`  + boolean ${tableId}.${key}`);
  } catch (e) {
    if (isIdempotentColumnError(e)) return;
    throw e;
  }
}

async function ensureIndex(tableId, key, type, columns) {
  try {
    await db.createIndex({
      databaseId: DATABASE_ID,
      tableId,
      key,
      type,
      columns,
    });
    console.log(`  + index ${tableId}.${key}`);
  } catch (e) {
    if (String(e?.message || e).includes("already exists")) return;
    throw e;
  }
}

const PRODUCT_STATUS = [
  "draft",
  "pending_review",
  "active",
  "rejected",
  "archived",
];
const ORDER_STATUS = [
  "pending_payment",
  "payment_review",
  "paid",
  "processing",
  "shipped",
  "ready_pickup",
  "completed",
  "cancelled",
  "refunded",
];
const PAYMENT_METHOD = ["payhere", "bank_transfer", "free", "cod"];
const PAYMENT_STATUS = [
  "pending",
  "awaiting_verification",
  "paid",
  "failed",
  "refunded",
];
const SELLER_STATUS = ["pending", "rejected", "approved"];
const SLIP_STATUS = ["pending", "approved", "rejected"];
const REPORT_STATUS = ["open", "reviewing", "resolved", "dismissed"];

async function setupSellerProfiles() {
  await ensureTable(
    "seller_profiles",
    "Seller Profiles",
    [
      Permission.create(Role.users()),
      Permission.read(Role.label("admin")),
      Permission.update(Role.label("admin")),
      Permission.delete(Role.label("admin")),
    ],
    true,
  );
  await ensureString("seller_profiles", "userId", 36, true);
  await ensureString("seller_profiles", "shopName", 128, true);
  await ensureString("seller_profiles", "slug", 128, true);
  await ensureString("seller_profiles", "bio", 2000, false);
  await ensureString("seller_profiles", "bannerFileId", 64, false);
  await ensureEnum("seller_profiles", "status", SELLER_STATUS, true);
  await ensureString("seller_profiles", "bankAccountName", 128, false);
  await ensureString("seller_profiles", "bankAccountNumber", 64, false);
  await ensureString("seller_profiles", "bankName", 128, false);
  await ensureString("seller_profiles", "rejectionReason", 500, false);
  await ensureString("seller_profiles", "returnPolicy", 2000, false);
  await ensureString("seller_profiles", "shippingPolicy", 2000, false);
  const keys = [
    "userId",
    "shopName",
    "slug",
    "bio",
    "bannerFileId",
    "status",
    "bankAccountName",
    "bankAccountNumber",
    "bankName",
    "rejectionReason",
    "returnPolicy",
    "shippingPolicy",
  ];
  await waitColumnsAvailable("seller_profiles", keys);
  await ensureIndex(
    "seller_profiles",
    "userId_unique",
    TablesDBIndexType.Unique,
    ["userId"],
  );
  await ensureIndex("seller_profiles", "slug_unique", TablesDBIndexType.Unique, [
    "slug",
  ]);
  await ensureIndex("seller_profiles", "status_idx", TablesDBIndexType.Key, [
    "status",
  ]);
}

async function setupProducts() {
  await ensureTable(
    "products",
    "Products",
    [Permission.create(Role.users()), Permission.read(Role.any())],
    true,
  );
  await ensureString("products", "sellerId", 36, true);
  await ensureString("products", "categoryId", 36, true);
  await ensureString("products", "title", 200, true);
  await ensureString("products", "description", 10000, true);
  await ensureFloat("products", "price", true, { min: 0 });
  await ensureBool("products", "isFree", true);
  await ensureEnum("products", "status", PRODUCT_STATUS, true);
  await ensureInt("products", "stock", true, { min: 0 });
  await ensureBool("products", "available", true);
  await ensureString("products", "currency", 8, true);
  await ensureBool("products", "featured", false);
  const keys = [
    "sellerId",
    "categoryId",
    "title",
    "description",
    "price",
    "isFree",
    "status",
    "stock",
    "available",
    "currency",
    "featured",
  ];
  await waitColumnsAvailable("products", keys);
  await ensureIndex("products", "sellerId_idx", TablesDBIndexType.Key, [
    "sellerId",
  ]);
  await ensureIndex("products", "categoryId_idx", TablesDBIndexType.Key, [
    "categoryId",
  ]);
  await ensureIndex("products", "status_idx", TablesDBIndexType.Key, ["status"]);
  await ensureIndex("products", "status_category_idx", TablesDBIndexType.Key, [
    "status",
    "categoryId",
  ]);
  await ensureIndex("products", "price_idx", TablesDBIndexType.Key, ["price"]);
  await ensureIndex("products", "title_fulltext", TablesDBIndexType.Fulltext, [
    "title",
  ]);
  await ensureIndex("products", "featured_idx", TablesDBIndexType.Key, [
    "featured",
    "status",
  ]);
}

async function setupProductImages() {
  await ensureTable(
    "product_images",
    "Product Images",
    [Permission.create(Role.users()), Permission.read(Role.any())],
    true,
  );
  await ensureString("product_images", "productId", 36, true);
  await ensureString("product_images", "fileId", 64, true);
  await ensureInt("product_images", "sortOrder", true, { min: 0 });
  await ensureString("product_images", "alt", 200, false);
  await waitColumnsAvailable("product_images", [
    "productId",
    "fileId",
    "sortOrder",
    "alt",
  ]);
  await ensureIndex("product_images", "productId_idx", TablesDBIndexType.Key, [
    "productId",
  ]);
}

async function setupCarts() {
  await ensureTable(
    "carts",
    "Carts",
    [Permission.create(Role.users())],
    true,
  );
  await ensureString("carts", "userId", 36, true);
  await ensureString("carts", "sellerId", 36, false);
  await waitColumnsAvailable("carts", ["userId", "sellerId"]);
  await ensureIndex("carts", "userId_unique", TablesDBIndexType.Unique, [
    "userId",
  ]);
}

async function setupCartItems() {
  await ensureTable(
    "cart_items",
    "Cart Items",
    [Permission.create(Role.users())],
    true,
  );
  await ensureString("cart_items", "cartId", 36, true);
  await ensureString("cart_items", "productId", 36, true);
  await ensureInt("cart_items", "quantity", true, { min: 1 });
  await ensureFloat("cart_items", "unitPrice", true, { min: 0 });
  await waitColumnsAvailable("cart_items", [
    "cartId",
    "productId",
    "quantity",
    "unitPrice",
  ]);
  await ensureIndex("cart_items", "cartId_idx", TablesDBIndexType.Key, [
    "cartId",
  ]);
  await ensureIndex("cart_items", "cart_product_unique", TablesDBIndexType.Unique, [
    "cartId",
    "productId",
  ]);
}

async function setupWishlistItems() {
  await ensureTable(
    "wishlist_items",
    "Wishlist Items",
    [Permission.create(Role.users())],
    true,
  );
  await ensureString("wishlist_items", "userId", 36, true);
  await ensureString("wishlist_items", "productId", 36, true);
  await waitColumnsAvailable("wishlist_items", ["userId", "productId"]);
  await ensureIndex("wishlist_items", "userId_idx", TablesDBIndexType.Key, [
    "userId",
  ]);
  await ensureIndex(
    "wishlist_items",
    "user_product_unique",
    TablesDBIndexType.Unique,
    ["userId", "productId"],
  );
  await ensureIndex("wishlist_items", "productId_idx", TablesDBIndexType.Key, [
    "productId",
  ]);
}

async function setupOrders() {
  await ensureTable(
    "orders",
    "Orders",
    [Permission.create(Role.users())],
    true,
  );
  await ensureString("orders", "buyerId", 36, true);
  await ensureString("orders", "sellerId", 36, true);
  await ensureEnum("orders", "status", ORDER_STATUS, true);
  await ensureFloat("orders", "totalAmount", true, { min: 0 });
  await ensureString("orders", "currency", 8, true);
  await ensureString("orders", "shippingAddress", 2000, true);
  await ensureEnum("orders", "paymentMethod", PAYMENT_METHOD, true);
  await ensureEnumElements("orders", "paymentMethod", PAYMENT_METHOD);
  await ensureString("orders", "couponCode", 32, false);
  await ensureFloat("orders", "discountAmount", false, { min: 0 });
  await waitColumnsAvailable("orders", [
    "buyerId",
    "sellerId",
    "status",
    "totalAmount",
    "currency",
    "shippingAddress",
    "paymentMethod",
    "couponCode",
    "discountAmount",
  ]);
  await ensureIndex("orders", "buyerId_idx", TablesDBIndexType.Key, ["buyerId"]);
  await ensureIndex("orders", "sellerId_idx", TablesDBIndexType.Key, [
    "sellerId",
  ]);
  await ensureIndex("orders", "status_idx", TablesDBIndexType.Key, ["status"]);
}

async function setupOrderItems() {
  await ensureTable(
    "order_items",
    "Order Items",
    [Permission.create(Role.users())],
    true,
  );
  await ensureString("order_items", "orderId", 36, true);
  await ensureString("order_items", "productId", 36, true);
  await ensureString("order_items", "title", 200, true);
  await ensureInt("order_items", "quantity", true, { min: 1 });
  await ensureFloat("order_items", "unitPrice", true, { min: 0 });
  await ensureFloat("order_items", "lineTotal", true, { min: 0 });
  await waitColumnsAvailable("order_items", [
    "orderId",
    "productId",
    "title",
    "quantity",
    "unitPrice",
    "lineTotal",
  ]);
  await ensureIndex("order_items", "orderId_idx", TablesDBIndexType.Key, [
    "orderId",
  ]);
}

async function setupPayments() {
  await ensureTable(
    "payments",
    "Payments",
    [Permission.create(Role.users()), Permission.read(Role.label("admin"))],
    true,
  );
  await ensureString("payments", "orderId", 36, true);
  await ensureEnum("payments", "method", PAYMENT_METHOD, true);
  await ensureEnumElements("payments", "method", PAYMENT_METHOD);
  await ensureEnum("payments", "status", PAYMENT_STATUS, true);
  await ensureFloat("payments", "amount", true, { min: 0 });
  await ensureString("payments", "currency", 8, true);
  await ensureString("payments", "payherePaymentId", 128, false);
  await ensureString("payments", "idempotencyKey", 128, false);
  await waitColumnsAvailable("payments", [
    "orderId",
    "method",
    "status",
    "amount",
    "currency",
    "payherePaymentId",
    "idempotencyKey",
  ]);
  await ensureIndex("payments", "orderId_idx", TablesDBIndexType.Key, [
    "orderId",
  ]);
  await ensureIndex(
    "payments",
    "idempotencyKey_unique",
    TablesDBIndexType.Unique,
    ["idempotencyKey"],
  );
}

async function setupBankSlips() {
  await ensureTable(
    "bank_slips",
    "Bank Slips",
    [
      Permission.create(Role.users()),
      Permission.read(Role.label("admin")),
      Permission.update(Role.label("admin")),
    ],
    true,
  );
  await ensureString("bank_slips", "paymentId", 36, true);
  await ensureString("bank_slips", "orderId", 36, true);
  await ensureString("bank_slips", "fileId", 64, true);
  await ensureString("bank_slips", "uploadedBy", 36, true);
  await ensureEnum("bank_slips", "status", SLIP_STATUS, true);
  await ensureString("bank_slips", "reviewedBy", 36, false);
  await ensureString("bank_slips", "reviewNote", 500, false);
  await waitColumnsAvailable("bank_slips", [
    "paymentId",
    "orderId",
    "fileId",
    "uploadedBy",
    "status",
    "reviewedBy",
    "reviewNote",
  ]);
  await ensureIndex("bank_slips", "paymentId_idx", TablesDBIndexType.Key, [
    "paymentId",
  ]);
  await ensureIndex("bank_slips", "orderId_idx", TablesDBIndexType.Key, [
    "orderId",
  ]);
}

async function setupReviews() {
  await ensureTable(
    "reviews",
    "Reviews",
    [Permission.create(Role.users()), Permission.read(Role.any())],
    true,
  );
  await ensureString("reviews", "orderId", 36, true);
  await ensureString("reviews", "productId", 36, true);
  await ensureString("reviews", "buyerId", 36, true);
  await ensureString("reviews", "sellerId", 36, true);
  await ensureInt("reviews", "productRating", true, { min: 1, max: 5 });
  await ensureInt("reviews", "sellerRating", false, { min: 1, max: 5 });
  await ensureString("reviews", "comment", 2000, false);
  await waitColumnsAvailable("reviews", [
    "orderId",
    "productId",
    "buyerId",
    "sellerId",
    "productRating",
    "sellerRating",
    "comment",
  ]);
  await ensureIndex("reviews", "productId_idx", TablesDBIndexType.Key, [
    "productId",
  ]);
  await ensureIndex("reviews", "order_buyer_unique", TablesDBIndexType.Unique, [
    "orderId",
    "buyerId",
  ]);
}

async function setupReports() {
  await ensureTable(
    "reports",
    "Reports",
    [
      Permission.create(Role.users()),
      Permission.read(Role.label("admin")),
      Permission.update(Role.label("admin")),
    ],
    true,
  );
  await ensureString("reports", "reporterId", 36, true);
  await ensureString("reports", "productId", 36, true);
  await ensureString("reports", "reason", 200, true);
  await ensureString("reports", "details", 2000, false);
  await ensureEnum("reports", "status", REPORT_STATUS, true);
  await waitColumnsAvailable("reports", [
    "reporterId",
    "productId",
    "reason",
    "details",
    "status",
  ]);
  await ensureIndex("reports", "status_idx", TablesDBIndexType.Key, ["status"]);
  await ensureIndex("reports", "productId_idx", TablesDBIndexType.Key, [
    "productId",
  ]);
}

async function setupNotifications() {
  await ensureTable(
    "notifications",
    "Notifications",
    [Permission.create(Role.users())],
    true,
  );
  await ensureString("notifications", "userId", 36, true);
  await ensureString("notifications", "type", 64, true);
  await ensureString("notifications", "title", 200, true);
  await ensureString("notifications", "body", 2000, true);
  await ensureBool("notifications", "read", true);
  await ensureString("notifications", "link", 500, false);
  await ensureString("notifications", "meta", 4000, false);
  await waitColumnsAvailable("notifications", [
    "userId",
    "type",
    "title",
    "body",
    "read",
    "link",
    "meta",
  ]);
  await ensureIndex("notifications", "userId_idx", TablesDBIndexType.Key, [
    "userId",
  ]);
  await ensureIndex("notifications", "user_read_idx", TablesDBIndexType.Key, [
    "userId",
    "read",
  ]);
}

async function setupPlatformSettings() {
  await ensureTable(
    "platform_settings",
    "Platform Settings",
    [
      Permission.read(Role.users()),
      Permission.create(Role.label("admin")),
      Permission.update(Role.label("admin")),
      Permission.delete(Role.label("admin")),
    ],
    false,
  );
  await ensureString("platform_settings", "key", 128, true);
  await ensureString("platform_settings", "value", 4000, true);
  await ensureString("platform_settings", "description", 500, false);
  await waitColumnsAvailable("platform_settings", [
    "key",
    "value",
    "description",
  ]);
  await ensureIndex(
    "platform_settings",
    "key_unique",
    TablesDBIndexType.Unique,
    ["key"],
  );
}

async function setupAuditLogs() {
  // Admin SDK only — empty client permissions.
  await ensureTable("audit_logs", "Audit Logs", [], false);
  await ensureString("audit_logs", "actorId", 36, false);
  // Use `event` (not `action`) — `action` can stick in processing on Appwrite TablesDB.
  await ensureString("audit_logs", "event", 128, true);
  await ensureString("audit_logs", "resourceType", 64, true);
  await ensureString("audit_logs", "resourceId", 36, false);
  await ensureString("audit_logs", "meta", 4000, false);
  await ensureString("audit_logs", "ip", 64, false);
  await waitColumnsAvailable("audit_logs", [
    "actorId",
    "event",
    "resourceType",
    "resourceId",
    "meta",
    "ip",
  ]);
  await ensureIndex("audit_logs", "actorId_idx", TablesDBIndexType.Key, [
    "actorId",
  ]);
  await ensureIndex("audit_logs", "resource_idx", TablesDBIndexType.Key, [
    "resourceType",
    "resourceId",
  ]);
}

async function setupCoupons() {
  await ensureTable("coupons", "Coupons", [], false);
  await ensureString("coupons", "code", 32, true);
  await ensureEnum("coupons", "type", ["percent", "fixed"], true);
  await ensureFloat("coupons", "value", true, { min: 0 });
  await ensureBool("coupons", "active", true);
  await ensureInt("coupons", "maxRedemptions", true, { min: 0 });
  await ensureInt("coupons", "redemptionCount", true, { min: 0 });
  await ensureFloat("coupons", "minOrderAmount", true, { min: 0 });
  await ensureString("coupons", "expiresAt", 64, false);
  await ensureString("coupons", "createdBy", 36, true);
  await waitColumnsAvailable("coupons", [
    "code",
    "type",
    "value",
    "active",
    "maxRedemptions",
    "redemptionCount",
    "minOrderAmount",
    "expiresAt",
    "createdBy",
  ]);
  await ensureIndex("coupons", "code_unique", TablesDBIndexType.Unique, [
    "code",
  ]);
}

async function setupCouponRedemptions() {
  await ensureTable("coupon_redemptions", "Coupon Redemptions", [], false);
  await ensureString("coupon_redemptions", "couponId", 36, true);
  await ensureString("coupon_redemptions", "orderId", 36, true);
  await ensureString("coupon_redemptions", "buyerId", 36, true);
  await ensureFloat("coupon_redemptions", "discountAmount", true, { min: 0 });
  await waitColumnsAvailable("coupon_redemptions", [
    "couponId",
    "orderId",
    "buyerId",
    "discountAmount",
  ]);
  await ensureIndex(
    "coupon_redemptions",
    "orderId_unique",
    TablesDBIndexType.Unique,
    ["orderId"],
  );
  await ensureIndex(
    "coupon_redemptions",
    "couponId_idx",
    TablesDBIndexType.Key,
    ["couponId"],
  );
}

async function setupThreads() {
  await ensureTable(
    "threads",
    "Threads",
    [Permission.create(Role.users())],
    true,
  );
  await ensureString("threads", "buyerId", 36, true);
  await ensureString("threads", "sellerId", 36, true);
  await ensureString("threads", "orderId", 36, true);
  await ensureString("threads", "lastMessageAt", 64, false);
  await waitColumnsAvailable("threads", [
    "buyerId",
    "sellerId",
    "orderId",
    "lastMessageAt",
  ]);
  await ensureIndex("threads", "orderId_unique", TablesDBIndexType.Unique, [
    "orderId",
  ]);
  await ensureIndex("threads", "buyerId_idx", TablesDBIndexType.Key, [
    "buyerId",
  ]);
  await ensureIndex("threads", "sellerId_idx", TablesDBIndexType.Key, [
    "sellerId",
  ]);
}

async function setupMessages() {
  await ensureTable(
    "messages",
    "Messages",
    [Permission.create(Role.users())],
    true,
  );
  await ensureString("messages", "threadId", 36, true);
  await ensureString("messages", "senderId", 36, true);
  await ensureString("messages", "body", 2000, true);
  await waitColumnsAvailable("messages", ["threadId", "senderId", "body"]);
  await ensureIndex("messages", "threadId_idx", TablesDBIndexType.Key, [
    "threadId",
  ]);
}

async function setupPayhereNotifyLogs() {
  // Function + admin SDK only — empty client permissions (same as audit_logs).
  await ensureTable("payhere_notify_logs", "PayHere Notify Logs", [], false);
  await ensureString("payhere_notify_logs", "outcome", 32, true);
  await ensureString("payhere_notify_logs", "orderId", 36, false);
  await ensureString("payhere_notify_logs", "payherePaymentId", 64, false);
  await ensureString("payhere_notify_logs", "statusCode", 8, false);
  await ensureString("payhere_notify_logs", "reason", 64, false);
  await ensureInt("payhere_notify_logs", "httpStatus", true);
  await ensureString("payhere_notify_logs", "sanitizedPayload", 2000, false);
  await waitColumnsAvailable("payhere_notify_logs", [
    "outcome",
    "orderId",
    "payherePaymentId",
    "statusCode",
    "reason",
    "httpStatus",
    "sanitizedPayload",
  ]);
  await ensureIndex("payhere_notify_logs", "outcome_idx", TablesDBIndexType.Key, [
    "outcome",
  ]);
  await ensureIndex("payhere_notify_logs", "orderId_idx", TablesDBIndexType.Key, [
    "orderId",
  ]);
}

async function main() {
  console.log(`Setting up schema in database=${DATABASE_ID}`);
  // profiles + categories already created via MCP; keep idempotent helpers unused for them.
  await setupSellerProfiles();
  await setupProducts();
  await setupProductImages();
  await setupCarts();
  await setupCartItems();
  await setupWishlistItems();
  await setupOrders();
  await setupOrderItems();
  await setupPayments();
  await setupBankSlips();
  await setupReviews();
  await setupReports();
  await setupNotifications();
  await setupPlatformSettings();
  await setupAuditLogs();
  await setupCoupons();
  await setupCouponRedemptions();
  await setupThreads();
  await setupMessages();
  await setupPayhereNotifyLogs();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
