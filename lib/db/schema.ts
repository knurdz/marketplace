import {
  bigint,
  boolean,
  decimal,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";
import {
  BANK_SLIP_STATUSES,
  ORDER_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  PRODUCT_STATUSES,
  REPORT_STATUSES,
  SELLER_STATUSES,
} from "@/lib/types/status";

const id36 = () => varchar("id", { length: 36 }).primaryKey();
const ts = () =>
  timestamp("created_at", { mode: "date" })
    .notNull()
    .defaultNow();
const tsUpdated = () =>
  timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow()
    .onUpdateNow();

/** Better Auth + marketplace role */
export const userRoleEnum = mysqlEnum("role", ["buyer", "seller", "admin"]);

export const authUser = mysqlTable("user", {
  id: id36(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: varchar("image", { length: 512 }),
  role: userRoleEnum.notNull().default("buyer"),
  disabled: boolean("disabled").notNull().default(false),
  createdAt: ts(),
  updatedAt: tsUpdated(),
});

export const authSession = mysqlTable(
  "session",
  {
    id: id36(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    token: varchar("token", { length: 255 }).notNull().unique(),
    createdAt: ts(),
    updatedAt: tsUpdated(),
    ipAddress: varchar("ip_address", { length: 64 }),
    userAgent: varchar("user_agent", { length: 512 }),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => authUser.id, { onDelete: "cascade" }),
  },
  (t) => [index("session_user_idx").on(t.userId)],
);

export const authAccount = mysqlTable(
  "account",
  {
    id: id36(),
    accountId: varchar("account_id", { length: 255 }).notNull(),
    providerId: varchar("provider_id", { length: 64 }).notNull(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => authUser.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: "date" }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      mode: "date",
    }),
    scope: varchar("scope", { length: 512 }),
    password: varchar("password", { length: 255 }),
    createdAt: ts(),
    updatedAt: tsUpdated(),
  },
  (t) => [index("account_user_idx").on(t.userId)],
);

export const authVerification = mysqlTable("verification", {
  id: id36(),
  identifier: varchar("identifier", { length: 255 }).notNull(),
  value: varchar("value", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  createdAt: ts(),
  updatedAt: tsUpdated(),
});

export const profiles = mysqlTable(
  "profiles",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    displayName: varchar("display_name", { length: 128 }).notNull(),
    avatarFileId: varchar("avatar_file_id", { length: 64 }),
    phone: varchar("phone", { length: 32 }),
    bio: varchar("bio", { length: 1000 }),
    createdAt: ts(),
    updatedAt: tsUpdated(),
  },
  (t) => [uniqueIndex("profiles_user_id_unique").on(t.userId)],
);

export const sellerProfiles = mysqlTable(
  "seller_profiles",
  {
    id: id36(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    shopName: varchar("shop_name", { length: 128 }).notNull(),
    slug: varchar("slug", { length: 128 }).notNull(),
    bio: varchar("bio", { length: 2000 }),
    bannerFileId: varchar("banner_file_id", { length: 64 }),
    status: mysqlEnum("status", SELLER_STATUSES).notNull(),
    bankAccountName: varchar("bank_account_name", { length: 128 }),
    bankAccountNumber: varchar("bank_account_number", { length: 64 }),
    bankName: varchar("bank_name", { length: 128 }),
    bankTransferNotes: varchar("bank_transfer_notes", { length: 2000 }),
    rejectionReason: varchar("rejection_reason", { length: 500 }),
    returnPolicy: varchar("return_policy", { length: 2000 }),
    shippingPolicy: varchar("shipping_policy", { length: 2000 }),
    createdAt: ts(),
    updatedAt: tsUpdated(),
  },
  (t) => [
    uniqueIndex("seller_profiles_user_id_unique").on(t.userId),
    uniqueIndex("seller_profiles_slug_unique").on(t.slug),
    index("seller_profiles_status_idx").on(t.status),
  ],
);

export const categories = mysqlTable(
  "categories",
  {
    id: id36(),
    name: varchar("name", { length: 128 }).notNull(),
    slug: varchar("slug", { length: 128 }).notNull(),
    parentId: varchar("parent_id", { length: 36 }),
    sortOrder: int("sort_order").notNull().default(0),
    createdAt: ts(),
    updatedAt: tsUpdated(),
  },
  (t) => [
    uniqueIndex("categories_slug_unique").on(t.slug),
    index("categories_parent_id_idx").on(t.parentId),
  ],
);

export const products = mysqlTable(
  "products",
  {
    id: id36(),
    sellerId: varchar("seller_id", { length: 36 }).notNull(),
    categoryId: varchar("category_id", { length: 36 }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description").notNull(),
    price: decimal("price", { precision: 12, scale: 2 }).notNull(),
    isFree: boolean("is_free").notNull(),
    status: mysqlEnum("status", PRODUCT_STATUSES).notNull(),
    stock: int("stock").notNull(),
    available: boolean("available").notNull(),
    currency: varchar("currency", { length: 8 }).notNull(),
    featured: boolean("featured").notNull().default(false),
    createdAt: ts(),
    updatedAt: tsUpdated(),
  },
  (t) => [
    index("products_seller_id_idx").on(t.sellerId),
    index("products_category_id_idx").on(t.categoryId),
    index("products_status_idx").on(t.status),
    index("products_status_category_idx").on(t.status, t.categoryId),
    index("products_price_idx").on(t.price),
    index("products_featured_idx").on(t.featured, t.status),
  ],
);

export const productImages = mysqlTable(
  "product_images",
  {
    id: id36(),
    productId: varchar("product_id", { length: 36 }).notNull(),
    fileId: varchar("file_id", { length: 64 }).notNull(),
    sortOrder: int("sort_order").notNull(),
    alt: varchar("alt", { length: 200 }),
    createdAt: ts(),
    updatedAt: tsUpdated(),
  },
  (t) => [index("product_images_product_id_idx").on(t.productId)],
);

export const carts = mysqlTable(
  "carts",
  {
    id: id36(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    sellerId: varchar("seller_id", { length: 36 }),
    createdAt: ts(),
    updatedAt: tsUpdated(),
  },
  (t) => [uniqueIndex("carts_user_id_unique").on(t.userId)],
);

export const cartItems = mysqlTable(
  "cart_items",
  {
    id: id36(),
    cartId: varchar("cart_id", { length: 36 }).notNull(),
    productId: varchar("product_id", { length: 36 }).notNull(),
    quantity: int("quantity").notNull(),
    unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
    createdAt: ts(),
    updatedAt: tsUpdated(),
  },
  (t) => [
    index("cart_items_cart_id_idx").on(t.cartId),
    uniqueIndex("cart_items_cart_product_unique").on(t.cartId, t.productId),
  ],
);

export const wishlistItems = mysqlTable(
  "wishlist_items",
  {
    id: id36(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    productId: varchar("product_id", { length: 36 }).notNull(),
    createdAt: ts(),
    updatedAt: tsUpdated(),
  },
  (t) => [
    index("wishlist_items_user_id_idx").on(t.userId),
    index("wishlist_items_product_id_idx").on(t.productId),
    uniqueIndex("wishlist_items_user_product_unique").on(t.userId, t.productId),
  ],
);

export const orders = mysqlTable(
  "orders",
  {
    id: id36(),
    buyerId: varchar("buyer_id", { length: 36 }).notNull(),
    sellerId: varchar("seller_id", { length: 36 }).notNull(),
    status: mysqlEnum("status", ORDER_STATUSES).notNull(),
    totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 8 }).notNull(),
    shippingAddress: varchar("shipping_address", { length: 2000 }).notNull(),
    paymentMethod: mysqlEnum("payment_method", PAYMENT_METHODS).notNull(),
    couponCode: varchar("coupon_code", { length: 32 }),
    discountAmount: decimal("discount_amount", { precision: 12, scale: 2 })
      .notNull()
      .default("0"),
    createdAt: ts(),
    updatedAt: tsUpdated(),
  },
  (t) => [
    index("orders_buyer_id_idx").on(t.buyerId),
    index("orders_seller_id_idx").on(t.sellerId),
    index("orders_status_idx").on(t.status),
  ],
);

export const orderItems = mysqlTable(
  "order_items",
  {
    id: id36(),
    orderId: varchar("order_id", { length: 36 }).notNull(),
    productId: varchar("product_id", { length: 36 }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    quantity: int("quantity").notNull(),
    unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
    lineTotal: decimal("line_total", { precision: 12, scale: 2 }).notNull(),
    createdAt: ts(),
    updatedAt: tsUpdated(),
  },
  (t) => [index("order_items_order_id_idx").on(t.orderId)],
);

export const payments = mysqlTable(
  "payments",
  {
    id: id36(),
    orderId: varchar("order_id", { length: 36 }).notNull(),
    method: mysqlEnum("method", PAYMENT_METHODS).notNull(),
    status: mysqlEnum("status", PAYMENT_STATUSES).notNull(),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 8 }).notNull(),
    payherePaymentId: varchar("payhere_payment_id", { length: 128 }),
    idempotencyKey: varchar("idempotency_key", { length: 128 }),
    createdAt: ts(),
    updatedAt: tsUpdated(),
  },
  (t) => [
    index("payments_order_id_idx").on(t.orderId),
    uniqueIndex("payments_idempotency_key_unique").on(t.idempotencyKey),
  ],
);

export const bankSlips = mysqlTable(
  "bank_slips",
  {
    id: id36(),
    paymentId: varchar("payment_id", { length: 36 }).notNull(),
    orderId: varchar("order_id", { length: 36 }).notNull(),
    fileId: varchar("file_id", { length: 64 }).notNull(),
    uploadedBy: varchar("uploaded_by", { length: 36 }).notNull(),
    status: mysqlEnum("status", BANK_SLIP_STATUSES).notNull(),
    reviewedBy: varchar("reviewed_by", { length: 36 }),
    reviewNote: varchar("review_note", { length: 500 }),
    createdAt: ts(),
    updatedAt: tsUpdated(),
  },
  (t) => [
    index("bank_slips_payment_id_idx").on(t.paymentId),
    index("bank_slips_order_id_idx").on(t.orderId),
    index("bank_slips_file_id_idx").on(t.fileId),
  ],
);

export const reviews = mysqlTable(
  "reviews",
  {
    id: id36(),
    orderId: varchar("order_id", { length: 36 }).notNull(),
    productId: varchar("product_id", { length: 36 }).notNull(),
    buyerId: varchar("buyer_id", { length: 36 }).notNull(),
    sellerId: varchar("seller_id", { length: 36 }).notNull(),
    productRating: int("product_rating").notNull(),
    sellerRating: int("seller_rating"),
    comment: varchar("comment", { length: 2000 }),
    createdAt: ts(),
    updatedAt: tsUpdated(),
  },
  (t) => [
    index("reviews_product_id_idx").on(t.productId),
    uniqueIndex("reviews_order_buyer_product_unique").on(
      t.orderId,
      t.buyerId,
      t.productId,
    ),
  ],
);

export const reports = mysqlTable(
  "reports",
  {
    id: id36(),
    reporterId: varchar("reporter_id", { length: 36 }).notNull(),
    productId: varchar("product_id", { length: 36 }).notNull(),
    reason: varchar("reason", { length: 200 }).notNull(),
    details: varchar("details", { length: 2000 }),
    status: mysqlEnum("status", REPORT_STATUSES).notNull(),
    createdAt: ts(),
    updatedAt: tsUpdated(),
  },
  (t) => [
    index("reports_status_idx").on(t.status),
    index("reports_product_id_idx").on(t.productId),
  ],
);

export const notifications = mysqlTable(
  "notifications",
  {
    id: id36(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    type: varchar("type", { length: 64 }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    body: varchar("body", { length: 2000 }).notNull(),
    read: boolean("read").notNull(),
    link: varchar("link", { length: 500 }),
    meta: varchar("meta", { length: 4000 }),
    createdAt: ts(),
    updatedAt: tsUpdated(),
  },
  (t) => [
    index("notifications_user_id_idx").on(t.userId),
    index("notifications_user_read_idx").on(t.userId, t.read),
  ],
);

export const platformSettings = mysqlTable(
  "platform_settings",
  {
    id: id36(),
    key: varchar("key", { length: 128 }).notNull(),
    value: varchar("value", { length: 4000 }).notNull(),
    description: varchar("description", { length: 500 }),
    createdAt: ts(),
    updatedAt: tsUpdated(),
  },
  (t) => [uniqueIndex("platform_settings_key_unique").on(t.key)],
);

export const auditLogs = mysqlTable(
  "audit_logs",
  {
    id: id36(),
    actorId: varchar("actor_id", { length: 36 }),
    event: varchar("event", { length: 128 }).notNull(),
    resourceType: varchar("resource_type", { length: 64 }).notNull(),
    resourceId: varchar("resource_id", { length: 36 }),
    meta: varchar("meta", { length: 4000 }),
    ip: varchar("ip", { length: 64 }),
    createdAt: ts(),
    updatedAt: tsUpdated(),
  },
  (t) => [
    index("audit_logs_actor_id_idx").on(t.actorId),
    index("audit_logs_resource_idx").on(t.resourceType, t.resourceId),
  ],
);

export const coupons = mysqlTable(
  "coupons",
  {
    id: id36(),
    code: varchar("code", { length: 32 }).notNull(),
    type: mysqlEnum("type", ["percent", "fixed"]).notNull(),
    value: decimal("value", { precision: 12, scale: 2 }).notNull(),
    active: boolean("active").notNull(),
    maxRedemptions: int("max_redemptions").notNull(),
    redemptionCount: int("redemption_count").notNull(),
    minOrderAmount: decimal("min_order_amount", { precision: 12, scale: 2 }).notNull(),
    expiresAt: varchar("expires_at", { length: 64 }),
    createdBy: varchar("created_by", { length: 36 }).notNull(),
    createdAt: ts(),
    updatedAt: tsUpdated(),
  },
  (t) => [uniqueIndex("coupons_code_unique").on(t.code)],
);

export const couponRedemptions = mysqlTable(
  "coupon_redemptions",
  {
    id: id36(),
    couponId: varchar("coupon_id", { length: 36 }).notNull(),
    orderId: varchar("order_id", { length: 36 }).notNull(),
    buyerId: varchar("buyer_id", { length: 36 }).notNull(),
    discountAmount: decimal("discount_amount", {
      precision: 12,
      scale: 2,
    }).notNull(),
    createdAt: ts(),
    updatedAt: tsUpdated(),
  },
  (t) => [
    uniqueIndex("coupon_redemptions_order_id_unique").on(t.orderId),
    index("coupon_redemptions_coupon_id_idx").on(t.couponId),
    uniqueIndex("coupon_redemptions_coupon_buyer_unique").on(
      t.couponId,
      t.buyerId,
    ),
  ],
);

export const threads = mysqlTable(
  "threads",
  {
    id: id36(),
    buyerId: varchar("buyer_id", { length: 36 }).notNull(),
    sellerId: varchar("seller_id", { length: 36 }).notNull(),
    orderId: varchar("order_id", { length: 36 }).notNull(),
    lastMessageAt: varchar("last_message_at", { length: 64 }),
    createdAt: ts(),
    updatedAt: tsUpdated(),
  },
  (t) => [
    uniqueIndex("threads_order_id_unique").on(t.orderId),
    index("threads_buyer_id_idx").on(t.buyerId),
    index("threads_seller_id_idx").on(t.sellerId),
  ],
);

export const messages = mysqlTable(
  "messages",
  {
    id: id36(),
    threadId: varchar("thread_id", { length: 36 }).notNull(),
    senderId: varchar("sender_id", { length: 36 }).notNull(),
    body: varchar("body", { length: 2000 }).notNull(),
    createdAt: ts(),
    updatedAt: tsUpdated(),
  },
  (t) => [index("messages_thread_id_idx").on(t.threadId)],
);

export const payhereNotifyLogs = mysqlTable(
  "payhere_notify_logs",
  {
    id: id36(),
    outcome: varchar("outcome", { length: 32 }).notNull(),
    orderId: varchar("order_id", { length: 36 }),
    payherePaymentId: varchar("payhere_payment_id", { length: 64 }),
    statusCode: varchar("status_code", { length: 8 }),
    reason: varchar("reason", { length: 64 }),
    httpStatus: int("http_status").notNull(),
    sanitizedPayload: varchar("sanitized_payload", { length: 2000 }),
    createdAt: ts(),
    updatedAt: tsUpdated(),
  },
  (t) => [
    index("payhere_notify_logs_outcome_idx").on(t.outcome),
    index("payhere_notify_logs_order_id_idx").on(t.orderId),
  ],
);

export const viewStats = mysqlTable(
  "view_stats",
  {
    id: id36(),
    sellerId: varchar("seller_id", { length: 36 }).notNull(),
    kind: mysqlEnum("kind", ["product", "shop"]).notNull(),
    targetId: varchar("target_id", { length: 36 }).notNull(),
    day: varchar("day", { length: 10 }).notNull(),
    count: int("count").notNull(),
    createdAt: ts(),
    updatedAt: tsUpdated(),
  },
  (t) => [
    uniqueIndex("view_stats_seller_kind_target_day_unique").on(
      t.sellerId,
      t.kind,
      t.targetId,
      t.day,
    ),
    index("view_stats_seller_id_idx").on(t.sellerId),
  ],
);

export const rateLimits = mysqlTable(
  "rate_limits",
  {
    id: id36(),
    bucket: varchar("bucket", { length: 64 }).notNull(),
    limitKey: varchar("limit_key", { length: 256 }).notNull(),
    windowStart: bigint("window_start", { mode: "number" }).notNull(),
    count: int("count").notNull(),
    createdAt: ts(),
    updatedAt: tsUpdated(),
  },
  (t) => [
    uniqueIndex("rate_limits_bucket_key_unique").on(t.bucket, t.limitKey),
  ],
);

export const storedFiles = mysqlTable(
  "stored_files",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    bucketId: varchar("bucket_id", { length: 64 }).notNull(),
    ownerId: varchar("owner_id", { length: 36 }).notNull(),
    mimeType: varchar("mime_type", { length: 128 }).notNull(),
    sizeBytes: int("size_bytes").notNull(),
    originalName: varchar("original_name", { length: 255 }).notNull(),
    createdAt: ts(),
    updatedAt: tsUpdated(),
  },
  (t) => [
    index("stored_files_bucket_idx").on(t.bucketId),
    index("stored_files_owner_idx").on(t.ownerId),
  ],
);

export const TABLE_REGISTRY = {
  profiles,
  seller_profiles: sellerProfiles,
  categories,
  products,
  product_images: productImages,
  carts,
  cart_items: cartItems,
  wishlist_items: wishlistItems,
  orders,
  order_items: orderItems,
  payments,
  bank_slips: bankSlips,
  reviews,
  reports,
  notifications,
  platform_settings: platformSettings,
  audit_logs: auditLogs,
  coupons,
  coupon_redemptions: couponRedemptions,
  threads,
  messages,
  payhere_notify_logs: payhereNotifyLogs,
  view_stats: viewStats,
  rate_limits: rateLimits,
} as const;
