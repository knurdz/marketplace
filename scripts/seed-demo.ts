/**
 * MariaDB demo seed (replaces Appwrite seed).
 * Usage: npx tsx --env-file=.env.local scripts/seed-demo.ts
 */
import { hashPassword } from "better-auth/crypto";
import { eq, inArray } from "drizzle-orm";
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
import { CATEGORY_CATALOG } from "../lib/store/category-catalog";

const DEMO_PASSWORD = "DemoPass123!";

const USERS = [
  {
    key: "admin",
    email: "admin@knurdz.demo",
    name: "Demo Admin",
    role: "admin" as const,
    displayName: "Demo Admin",
    phone: "0770000001",
  },
  {
    key: "seller",
    email: "seller@knurdz.demo",
    name: "Demo Seller",
    role: "seller" as const,
    displayName: "Demo Seller",
    phone: "0770000002",
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
    phone: "0770000003",
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
    await db
      .update(profiles)
      .set({ phone: u.phone, registrationComplete: true })
      .where(eq(profiles.userId, existing[0].id));
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
    phone: u.phone,
    registrationComplete: true,
  });

  if (u.shop) {
    await db.insert(sellerProfiles).values({
      id: newId(),
      userId,
      shopName: u.shop.shopName,
      slug: u.shop.slug,
      status: u.shop.status,
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

  // Insert any missing catalog categories; leave existing rows (and admin edits) alone.
  const catalogSlugs = CATEGORY_CATALOG.map((c) => c.slug);
  const existingCats = await db
    .select({ id: categories.id, slug: categories.slug })
    .from(categories)
    .where(inArray(categories.slug, catalogSlugs));
  const existingBySlug = new Map(existingCats.map((c) => [c.slug, c.id]));

  let inserted = 0;
  for (const entry of CATEGORY_CATALOG) {
    if (existingBySlug.has(entry.slug)) continue;
    const id = `seed_cat_${entry.slug}`.slice(0, 36);
    await db.insert(categories).values({
      id,
      name: entry.name,
      slug: entry.slug,
      sortOrder: entry.sortOrder,
    });
    existingBySlug.set(entry.slug, id);
    inserted += 1;
  }
  if (inserted > 0) {
    console.log(`Inserted ${inserted} catalog categor${inserted === 1 ? "y" : "ies"}.`);
  }

  const categoryId =
    existingBySlug.get("digital") ??
    existingBySlug.values().next().value ??
    null;
  if (!categoryId) {
    throw new Error("No categories available after catalog seed.");
  }

  const sellerId = userIds.seller;
  const existingProduct = await db
    .select()
    .from(products)
    .where(eq(products.id, "seed_demo_product"))
    .limit(1);
  if (sellerId) {
    if (!existingProduct[0]) {
      await db.insert(products).values({
        id: "seed_demo_product",
        sellerId,
        categoryId,
        title: "Demo Sticker Pack",
        description: "Seeded contact-request SKU.",
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
    } else {
      await db
        .update(products)
        .set({ description: "Seeded contact-request SKU." })
        .where(eq(products.id, "seed_demo_product"));
    }
  }

  // Ensure demo users have phones for contact-request flow.
  for (const userId of Object.values(userIds)) {
    await db
      .update(profiles)
      .set({ phone: "0770000000" })
      .where(eq(profiles.userId, userId));
  }

  const settings = [
    { key: "features.free_listings", value: "true" },
    { key: "site.name", value: "Knurdz Marketplace" },
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
