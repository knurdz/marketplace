/**
 * Idempotent demo seed for Knurdz Marketplace (dev/sandbox only).
 * Usage: npm run seed
 *      → node --env-file=.env.local scripts/seed-demo.mjs
 *
 * Creates: admin / seller / seller2 / buyer users + profiles, two approved seller
 * shops with bank details, two categories, paid + free + multi-seller products,
 * one buyer welcome notification, MVP platform_settings rows.
 */
import {
  Client,
  ID,
  Permission,
  Query,
  Role,
  TablesDB,
  Users,
} from "node-appwrite";

const DATABASE_ID = "marketplace";
const DEMO_PASSWORD = "DemoPass123!";

const DEMO_USERS = [
  {
    key: "admin",
    email: "admin@knurdz.demo",
    name: "Demo Admin",
    labels: ["buyer", "admin"],
    displayName: "Demo Admin",
  },
  {
    key: "seller",
    email: "seller@knurdz.demo",
    name: "Demo Seller",
    labels: ["buyer", "seller"],
    displayName: "Demo Seller",
  },
  {
    key: "seller2",
    email: "seller2@knurdz.demo",
    name: "Paper Trail Seller",
    labels: ["buyer", "seller"],
    displayName: "Paper Trail Seller",
  },
  {
    key: "buyer",
    email: "buyer@knurdz.demo",
    name: "Demo Buyer",
    labels: ["buyer"],
    displayName: "Demo Buyer",
  },
];

const CATEGORIES = [
  {
    rowId: "seed_cat_digital",
    name: "Digital",
    slug: "digital",
    sortOrder: 0,
  },
  {
    rowId: "seed_cat_goods",
    name: "Goods",
    slug: "goods",
    sortOrder: 1,
  },
];

const PRODUCTS = [
  {
    rowId: "seed_demo_product",
    sellerKey: "seller",
    categorySlug: "digital",
    title: "Demo Sticker Pack",
    description:
      "Seeded sample product for Knurdz Marketplace. Active listing used by listActiveProducts.",
    price: 500,
    isFree: false,
    stock: 25,
    featured: false,
  },
  {
    rowId: "seed_demo_free_product",
    sellerKey: "seller",
    categorySlug: "digital",
    title: "Demo Free Sticker",
    description:
      "Seeded free listing for confirmFreeOrder (price=0). Active; used by the free checkout path.",
    price: 0,
    isFree: true,
    stock: 25,
    featured: false,
  },
  {
    rowId: "seed_demo_tote",
    sellerKey: "seller",
    categorySlug: "goods",
    title: "Demo Canvas Tote",
    description: "Seeded goods SKU for bank transfer and COD checkout testing.",
    price: 1200,
    isFree: false,
    stock: 15,
    featured: true,
  },
  {
    rowId: "seed_seller2_digital",
    sellerKey: "seller2",
    categorySlug: "digital",
    title: "Paper Trail Digital Pack",
    description:
      "Second seller digital SKU — use to test cart seller mismatch vs Demo Shop.",
    price: 750,
    isFree: false,
    stock: 20,
    featured: false,
  },
  {
    rowId: "seed_seller2_goods",
    sellerKey: "seller2",
    categorySlug: "goods",
    title: "Paper Trail Notebook",
    description: "Second seller goods SKU for bank/COD checkout.",
    price: 950,
    isFree: false,
    stock: 18,
    featured: false,
  },
];

const SELLER_PROFILES = [
  {
    rowId: "seed_seller_profile",
    userKey: "seller",
    shopName: "Demo Shop",
    slug: "demo-shop",
    bio: "Seeded seller shop for local development.",
    bankAccountName: "Demo Shop (Pvt) Ltd",
    bankAccountNumber: "1234567890",
    bankName: "Demo Bank",
  },
  {
    rowId: "seed_seller2_profile",
    userKey: "seller2",
    shopName: "Paper Trail",
    slug: "paper-trail",
    bio: "Second seeded seller for multi-seller cart and checkout testing.",
    bankAccountName: "Paper Trail Books",
    bankAccountNumber: "9876543210",
    bankName: "Seed Savings Bank",
  },
];
const BUYER_WELCOME_NOTIFICATION_ID = "seed_buyer_welcome_notification";

const PLATFORM_SETTINGS = [
  {
    rowId: "seed_set_site_name",
    key: "site.name",
    value: "Knurdz",
    description: "Public site / brand display name",
  },
  {
    rowId: "seed_set_support_email",
    key: "site.support_email",
    value: "support@knurdz.demo",
    description: "Support contact email",
  },
  {
    rowId: "seed_set_currency",
    key: "checkout.currency_default",
    value: "LKR",
    description: "Default checkout currency",
  },
  {
    rowId: "seed_set_bank_instr",
    key: "checkout.bank_instructions",
    value:
      "Transfer the order total to the seller bank details shown at checkout, then upload your slip for admin verification.",
    description: "Buyer-facing bank transfer instructions",
  },
  {
    rowId: "seed_set_free_listings",
    key: "features.free_listings",
    value: "true",
    description: "Feature flag: allow free (price=0) listings",
  },
  {
    rowId: "seed_set_payhere_enabled",
    key: "checkout.payhere_enabled",
    value: "false",
    description:
      "Enable PayHere online card checkout (requires merchant authorization)",
  },
];

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
const users = new Users(client);
const db = new TablesDB(client);

function isNotFound(error) {
  return error?.code === 404 || String(error?.message || "").includes("not found");
}

function isConflict(error) {
  return error?.code === 409 || String(error?.message || "").includes("already exists");
}

async function findUserByEmail(email) {
  const list = await users.list({
    queries: [Query.equal("email", email), Query.limit(1)],
  });
  return list.users[0] ?? null;
}

async function ensureUser(spec) {
  let user = await findUserByEmail(spec.email);
  if (!user) {
    user = await users.create({
      userId: ID.unique(),
      email: spec.email,
      password: DEMO_PASSWORD,
      name: spec.name,
    });
    console.log(`+ user created: ${spec.email} (${user.$id})`);
  } else {
    console.log(`= user exists: ${spec.email} (${user.$id})`);
  }

  await users.updateLabels({ userId: user.$id, labels: spec.labels });
  await users.updateEmailVerification({
    userId: user.$id,
    emailVerification: true,
  });
  return user;
}

async function ensureProfile(userId, displayName) {
  try {
    await db.getRow({
      databaseId: DATABASE_ID,
      tableId: "profiles",
      rowId: userId,
    });
    await db.updateRow({
      databaseId: DATABASE_ID,
      tableId: "profiles",
      rowId: userId,
      data: { displayName, userId },
    });
    console.log(`= profile: ${userId}`);
  } catch (error) {
    if (!isNotFound(error)) throw error;
    await db.createRow({
      databaseId: DATABASE_ID,
      tableId: "profiles",
      rowId: userId,
      data: { userId, displayName },
      permissions: [
        Permission.read(Role.user(userId)),
        Permission.update(Role.user(userId)),
      ],
    });
    console.log(`+ profile: ${userId}`);
  }
}

async function ensureSellerProfile(spec, sellerUserId) {
  const data = {
    userId: sellerUserId,
    shopName: spec.shopName,
    slug: spec.slug,
    bio: spec.bio,
    status: "approved",
    bankAccountName: spec.bankAccountName,
    bankAccountNumber: spec.bankAccountNumber,
    bankName: spec.bankName,
    rejectionReason: null,
  };
  const permissions = [
    Permission.read(Role.user(sellerUserId)),
    Permission.update(Role.user(sellerUserId)),
    Permission.read(Role.label("admin")),
    Permission.update(Role.label("admin")),
    Permission.delete(Role.label("admin")),
  ];

  try {
    await db.getRow({
      databaseId: DATABASE_ID,
      tableId: "seller_profiles",
      rowId: spec.rowId,
    });
    await db.updateRow({
      databaseId: DATABASE_ID,
      tableId: "seller_profiles",
      rowId: spec.rowId,
      data,
      permissions,
    });
    console.log(`= seller_profiles: ${spec.rowId} (${spec.slug})`);
  } catch (error) {
    if (!isNotFound(error)) throw error;
    try {
      await db.createRow({
        databaseId: DATABASE_ID,
        tableId: "seller_profiles",
        rowId: spec.rowId,
        data,
        permissions,
      });
      console.log(`+ seller_profiles: ${spec.rowId} (${spec.slug})`);
    } catch (createErr) {
      if (!isConflict(createErr)) throw createErr;
      console.log(`= seller_profiles (conflict ok): ${spec.rowId}`);
    }
  }
}

async function ensureCategory(spec) {
  const data = {
    name: spec.name,
    slug: spec.slug,
    parentId: null,
    sortOrder: spec.sortOrder,
  };
  const permissions = [
    Permission.read(Role.any()),
    Permission.update(Role.label("admin")),
    Permission.delete(Role.label("admin")),
  ];

  try {
    await db.getRow({
      databaseId: DATABASE_ID,
      tableId: "categories",
      rowId: spec.rowId,
    });
    await db.updateRow({
      databaseId: DATABASE_ID,
      tableId: "categories",
      rowId: spec.rowId,
      data,
      permissions,
    });
    console.log(`= category: ${spec.slug}`);
  } catch (error) {
    if (!isNotFound(error)) throw error;
    await db.createRow({
      databaseId: DATABASE_ID,
      tableId: "categories",
      rowId: spec.rowId,
      data,
      permissions,
    });
    console.log(`+ category: ${spec.slug}`);
  }
}

async function ensureProduct(sellerUserId, categoryId, spec) {
  const data = {
    sellerId: sellerUserId,
    categoryId,
    title: spec.title,
    description: spec.description,
    price: spec.price,
    isFree: spec.isFree,
    status: "active",
    stock: spec.stock,
    available: true,
    currency: "LKR",
    featured: Boolean(spec.featured),
  };
  const permissions = [
    Permission.read(Role.any()),
    Permission.read(Role.user(sellerUserId)),
    Permission.update(Role.user(sellerUserId)),
    Permission.delete(Role.user(sellerUserId)),
    Permission.read(Role.label("admin")),
    Permission.update(Role.label("admin")),
    Permission.delete(Role.label("admin")),
  ];

  try {
    await db.getRow({
      databaseId: DATABASE_ID,
      tableId: "products",
      rowId: spec.rowId,
    });
    await db.updateRow({
      databaseId: DATABASE_ID,
      tableId: "products",
      rowId: spec.rowId,
      data,
      permissions,
    });
    console.log(`= product: ${spec.rowId}`);
  } catch (error) {
    if (!isNotFound(error)) throw error;
    await db.createRow({
      databaseId: DATABASE_ID,
      tableId: "products",
      rowId: spec.rowId,
      data,
      permissions,
    });
    console.log(`+ product: ${spec.rowId}`);
  }
}

async function ensureBuyerWelcomeNotification(buyerUserId) {
  const data = {
    userId: buyerUserId,
    type: "system.welcome",
    title: "Welcome to Knurdz",
    body: "Your demo buyer account is ready. Explore the storefront and update your profile anytime.",
    read: false,
    link: "/account",
    meta: null,
  };
  const permissions = [
    Permission.read(Role.user(buyerUserId)),
    Permission.update(Role.user(buyerUserId)),
    Permission.delete(Role.user(buyerUserId)),
    Permission.read(Role.label("admin")),
    Permission.update(Role.label("admin")),
    Permission.delete(Role.label("admin")),
  ];

  try {
    await db.getRow({
      databaseId: DATABASE_ID,
      tableId: "notifications",
      rowId: BUYER_WELCOME_NOTIFICATION_ID,
    });
    await db.updateRow({
      databaseId: DATABASE_ID,
      tableId: "notifications",
      rowId: BUYER_WELCOME_NOTIFICATION_ID,
      data,
      permissions,
    });
    console.log(`= notification: ${BUYER_WELCOME_NOTIFICATION_ID}`);
  } catch (error) {
    if (!isNotFound(error)) throw error;
    try {
      await db.createRow({
        databaseId: DATABASE_ID,
        tableId: "notifications",
        rowId: BUYER_WELCOME_NOTIFICATION_ID,
        data,
        permissions,
      });
      console.log(`+ notification: ${BUYER_WELCOME_NOTIFICATION_ID}`);
    } catch (createErr) {
      if (!isConflict(createErr)) throw createErr;
      console.log(
        `= notification (conflict ok): ${BUYER_WELCOME_NOTIFICATION_ID}`,
      );
    }
  }
}

async function ensurePlatformSetting(spec) {
  const data = {
    key: spec.key,
    value: spec.value,
    description: spec.description,
  };
  // Table-level: read(users); create/update/delete(admin). Row security off.
  const permissions = [
    Permission.read(Role.users()),
    Permission.update(Role.label("admin")),
    Permission.delete(Role.label("admin")),
  ];

  try {
    await db.getRow({
      databaseId: DATABASE_ID,
      tableId: "platform_settings",
      rowId: spec.rowId,
    });
    await db.updateRow({
      databaseId: DATABASE_ID,
      tableId: "platform_settings",
      rowId: spec.rowId,
      data,
      permissions,
    });
    console.log(`= platform_settings: ${spec.key}`);
  } catch (error) {
    if (!isNotFound(error)) throw error;
    try {
      await db.createRow({
        databaseId: DATABASE_ID,
        tableId: "platform_settings",
        rowId: spec.rowId,
        data,
        permissions,
      });
      console.log(`+ platform_settings: ${spec.key}`);
    } catch (createErr) {
      if (!isConflict(createErr)) throw createErr;
      console.log(`= platform_settings (conflict ok): ${spec.key}`);
    }
  }
}

async function main() {
  console.log("Seeding demo data…");

  const created = {};
  for (const spec of DEMO_USERS) {
    const user = await ensureUser(spec);
    created[spec.key] = user;
    await ensureProfile(user.$id, spec.displayName);
  }

  const categoryBySlug = Object.fromEntries(
    CATEGORIES.map((cat) => [cat.slug, cat.rowId]),
  );

  for (const cat of CATEGORIES) {
    await ensureCategory(cat);
  }

  for (const profile of SELLER_PROFILES) {
    const sellerUser = created[profile.userKey];
    if (!sellerUser) {
      throw new Error(`Missing demo user for seller profile: ${profile.userKey}`);
    }
    await ensureSellerProfile(profile, sellerUser.$id);
  }

  for (const product of PRODUCTS) {
    const sellerUser = created[product.sellerKey];
    const categoryId = categoryBySlug[product.categorySlug];
    if (!sellerUser || !categoryId) {
      throw new Error(`Invalid product seed: ${product.rowId}`);
    }
    await ensureProduct(sellerUser.$id, categoryId, product);
  }
  await ensureBuyerWelcomeNotification(created.buyer.$id);

  for (const setting of PLATFORM_SETTINGS) {
    await ensurePlatformSetting(setting);
  }

  console.log("\nDemo seed ready.");
  console.log(`  password (all): ${DEMO_PASSWORD}`);
  for (const spec of DEMO_USERS) {
    console.log(
      `  ${spec.key.padEnd(7)} ${spec.email}  labels=[${spec.labels.join(",")}]`,
    );
  }
  for (const profile of SELLER_PROFILES) {
    console.log(
      `  shop    ${profile.slug} (${profile.shopName}) — bank: ${profile.bankName}`,
    );
  }
  for (const product of PRODUCTS) {
    console.log(
      `  product ${product.rowId} seller=${product.sellerKey} ${product.price} LKR featured=${Boolean(product.featured)}`,
    );
  }
  console.log(`  notification ${BUYER_WELCOME_NOTIFICATION_ID} (buyer)`);
  console.log(`  platform_settings (${PLATFORM_SETTINGS.length} keys)`);
  console.log("  checkout: bank_transfer + cod + free (payhere disabled)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
