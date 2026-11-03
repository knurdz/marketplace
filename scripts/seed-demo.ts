/**
 * MariaDB demo seed (replaces Appwrite seed).
 * Usage: npx tsx --env-file=.env.local scripts/seed-demo.ts
 */
import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import { getDb, getPool, newId } from "../lib/db/client";
import {
  authAccount,
  authUser,
  categories,
  platformSettings,
  products,
  profiles,
  sellerProfiles,
} from "../lib/db/schema";

const DEMO_PASSWORD = "DemoPass123!";

const USERS = [
  {
    key: "admin",
    email: "admin@knurdz.demo",
    name: "Demo Admin",
    role: "admin" as const,
    displayName: "Demo Admin",
  },
  {
    key: "seller",
    email: "seller@knurdz.demo",
    name: "Demo Seller",
    role: "seller" as const,
    displayName: "Demo Seller",
    shop: {
      shopName: "Demo Shop",
      slug: "demo-shop",
      status: "approved" as const,
    },
  },
  {
    key: "buyer",
    email: "buyer@knurdz.demo",
    name: "Demo Buyer",
    role: "buyer" as const,
    displayName: "Demo Buyer",
  },
];

async function ensureUser(u: (typeof USERS)[number]) {
  const db = getDb();
  const existing = await db
    .select()
    .from(authUser)
    .where(eq(authUser.email, u.email))
    .limit(1);
  if (existing[0]) {
    return existing[0].id;
  }

  const userId = newId();
  const hashed = await hashPassword(DEMO_PASSWORD);
  await db.insert(authUser).values({
    id: userId,
    email: u.email,
    name: u.name,
    emailVerified: true,
    role: u.role,
    disabled: false,
  });
  await db.insert(authAccount).values({
    id: newId(),
    accountId: userId,
    providerId: "credential",
    userId,
    password: hashed,
  });
  await db.insert(profiles).values({
    id: userId,
    userId,
    displayName: u.displayName,
  });

  if (u.shop) {
    await db.insert(sellerProfiles).values({
      id: newId(),
      userId,
      shopName: u.shop.shopName,
      slug: u.shop.slug,
      status: u.shop.status,
      bankAccountName: "Demo Seller",
      bankName: "Demo Bank",
      bankAccountNumber: "****1234",
    });
  }

  return userId;
}

async function main() {
  const db = getDb();
  const userIds: Record<string, string> = {};
  for (const u of USERS) {
    userIds[u.key] = await ensureUser(u);
  }

  const catRows = await db.select().from(categories).limit(1);
  let categoryId = catRows[0]?.id;
  if (!categoryId) {
    categoryId = "seed_cat_digital";
    await db.insert(categories).values({
      id: categoryId,
      name: "Digital",
      slug: "digital",
      sortOrder: 0,
    });
  }

  const sellerId = userIds.seller;
  const existingProduct = await db
    .select()
    .from(products)
    .where(eq(products.id, "seed_demo_product"))
    .limit(1);
  if (!existingProduct[0] && sellerId) {
    await db.insert(products).values({
      id: "seed_demo_product",
      sellerId,
      categoryId,
      title: "Demo Sticker Pack",
      description: "Seeded PayHere SKU.",
      price: "500.00",
      isFree: false,
      status: "active",
      stock: 25,
      available: true,
      currency: "LKR",
      featured: false,
    });
    await db.insert(products).values({
      id: "seed_demo_free_product",
      sellerId,
      categoryId,
      title: "Demo Free Sticker",
      description: "Seeded free SKU.",
      price: "0.00",
      isFree: true,
      status: "active",
      stock: 25,
      available: true,
      currency: "LKR",
      featured: false,
    });
  }

  const settings = [
    { key: "checkout.payhere_enabled", value: "false" },
    { key: "checkout.bank_transfer_enabled", value: "true" },
    { key: "checkout.cod_enabled", value: "true" },
  ];
  for (const row of settings) {
    const found = await db
      .select()
      .from(platformSettings)
      .where(eq(platformSettings.key, row.key))
      .limit(1);
    if (!found[0]) {
      await db.insert(platformSettings).values({
        id: newId(),
        key: row.key,
        value: row.value,
      });
    }
  }

  console.log("Seed complete. Demo password:", DEMO_PASSWORD);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => getPool().end());
