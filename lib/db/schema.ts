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
  PRODUCT_STATUSES,
  PURCHASE_REQUEST_STATUSES,
  REPORT_STATUSES,
  REVIEW_STATUSES,
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
  image: varchar("image", { length: 2048 }),
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
  // OAuth state JSON includes the callback URLs and a 128-char verifier.
  // varchar(255) truncates it and JSON.parse throws "Unterminated string".
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  createdAt: ts(),
  updatedAt: tsUpdated(),
});

/** Better Auth's serverless-safe HTTP endpoint limiter. */
export const authRateLimit = mysqlTable("auth_rate_limit", {
  id: id36(),
  key: varchar("rate_limit_key", { length: 255 }).notNull().unique(),
  count: int("count").notNull(),
  lastRequest: bigint("last_request", { mode: "number" }).notNull(),
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
    registrationComplete: boolean("registration_complete")
      .notNull()
      .default(false),
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
    imageFileId: varchar("image_file_id", { length: 64 }),
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

export const purchaseRequests = mysqlTable(
  "purchase_requests",
  {
    id: id36(),
    buyerId: varchar("buyer_id", { length: 36 }).notNull(),
    sellerId: varchar("seller_id", { length: 36 }).notNull(),
    productId: varchar("product_id", { length: 36 }).notNull(),
    openKey: varchar("open_key", { length: 80 }),
    title: varchar("title", { length: 200 }).notNull(),
    quantity: int("quantity").notNull(),
    unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 8 }).notNull(),
    status: mysqlEnum("status", PURCHASE_REQUEST_STATUSES).notNull(),
    createdAt: ts(),
    updatedAt: tsUpdated(),
  },
  (t) => [
    index("purchase_requests_buyer_id_idx").on(t.buyerId),
    index("purchase_requests_seller_id_idx").on(t.sellerId),
    index("purchase_requests_product_id_idx").on(t.productId),
    index("purchase_requests_status_idx").on(t.status),
    uniqueIndex("purchase_requests_open_key_unique").on(t.openKey),
  ],
);

export const reviews = mysqlTable(
  "reviews",
  {
    id: id36(),
    requestId: varchar("request_id", { length: 36 }).notNull(),
    buyerId: varchar("buyer_id", { length: 36 }).notNull(),
    sellerId: varchar("seller_id", { length: 36 }).notNull(),
    rating: int("rating").notNull(),
    comment: varchar("comment", { length: 2000 }),
    status: mysqlEnum("status", REVIEW_STATUSES).notNull().default("pending"),
    createdAt: ts(),
    updatedAt: tsUpdated(),
  },
  (t) => [
    uniqueIndex("reviews_request_id_unique").on(t.requestId),
    index("reviews_seller_id_idx").on(t.sellerId),
    index("reviews_status_idx").on(t.status),
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
    index("rate_limits_updated_at_idx").on(t.updatedAt),
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

export const storageQuotas = mysqlTable("storage_quotas", {
  ownerId: varchar("owner_id", { length: 36 }).primaryKey(),
  fileCount: int("file_count").notNull().default(0),
  totalBytes: bigint("total_bytes", { mode: "number" }).notNull().default(0),
  createdAt: ts(),
  updatedAt: tsUpdated(),
});

export const TABLE_REGISTRY = {
  profiles,
  seller_profiles: sellerProfiles,
  categories,
  products,
  product_images: productImages,
  wishlist_items: wishlistItems,
  purchase_requests: purchaseRequests,
  reviews,
  reports,
  notifications,
  platform_settings: platformSettings,
  audit_logs: auditLogs,
  view_stats: viewStats,
  rate_limits: rateLimits,
} as const;
