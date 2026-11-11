/**
 * MariaDB demo seed + showcase catalog.
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
  productImages,
  products,
  profiles,
  sellerProfiles,
} from "../lib/db/schema";
import { CATEGORY_CATALOG, unsplashDownloadUrl } from "../lib/store/category-catalog";
import {
  SEED_PRODUCTS,
  seedImageFileId,
  seedProductId,
} from "./seed-catalog-data";

const DEMO_PASSWORD = "DemoPass123!";

type DemoUser = {
  key: string;
  email: string;
  name: string;
  role: "admin" | "seller" | "buyer";
  displayName: string;
  phone: string;
  shop?: {
    shopName: string;
    slug: string;
    status: "approved";
    /** Free Unsplash photo id for a wide shop banner. */
    bannerPhotoId: string;
  };
};

const USERS: DemoUser[] = [
  {
    key: "admin",
    email: "admin@knurdz.demo",
    name: "Demo Admin",
    role: "admin",
    displayName: "Demo Admin",
    phone: "0770000001",
  },
  {
    key: "seller",
    email: "seller@knurdz.demo",
    name: "Nimal Perera",
    role: "seller",
    displayName: "Nimal Perera",
    phone: "0770000002",
    shop: {
      shopName: "Nimal Studio",
      slug: "nimal-studio",
      status: "approved",
      // Desk / creative workspace — landscape Unsplash sample
      bannerPhotoId: "1497366216548-37526070297c",
    },
  },
  {
    key: "seller2",
    email: "amaya@knurdz.demo",
    name: "Amaya Fernando",
    role: "seller",
    displayName: "Amaya Fernando",
    phone: "0770000004",
    shop: {
      shopName: "Amaya Atelier",
      slug: "amaya-atelier",
      status: "approved",
      // Soft fashion retail — landscape Unsplash sample
      bannerPhotoId: "1441986300917-64674bd600d8",
    },
  },
  {
    key: "buyer",
    email: "buyer@knurdz.demo",
    name: "Demo Buyer",
    role: "buyer",
    displayName: "Demo Buyer",
    phone: "0770000003",
  },
];

async function ensureUser(u: DemoUser) {
  const db = getDb();
  const existing = await db
    .select()
    .from(authUser)
    .where(eq(authUser.email, u.email))
    .limit(1);
  if (existing[0]) {
    const userId = existing[0].id;
    await db
      .update(profiles)
      .set({
        phone: u.phone,
        displayName: u.displayName,
        registrationComplete: true,
      })
      .where(eq(profiles.userId, userId));
    await db
      .update(authUser)
      .set({ name: u.name, role: u.role, disabled: false })
      .where(eq(authUser.id, userId));

    if (u.shop) {
      const shop = await db
        .select()
        .from(sellerProfiles)
        .where(eq(sellerProfiles.userId, userId))
        .limit(1);
      if (shop[0]) {
        await db
          .update(sellerProfiles)
          .set({
            shopName: u.shop.shopName,
            slug: u.shop.slug,
            status: u.shop.status,
          })
          .where(eq(sellerProfiles.userId, userId));
      } else {
        await db.insert(sellerProfiles).values({
          id: newId(),
          userId,
          shopName: u.shop.shopName,
          slug: u.shop.slug,
          status: u.shop.status,
        });
      }
    }
    return userId;
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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function seedShopBannerFileId(slug: string): string {
  return `seed-banner-${slug.trim()}`.slice(0, 64);
}

async function uploadSeedPhoto(opts: {
  fileId: string;
  photoId: string;
  bucket: "product-images" | "avatars";
  width?: number;
}): Promise<"created" | "exists" | "error"> {
  const baseUrl = process.env.STORAGE_API_URL?.trim().replace(/\/$/, "") ?? "";
  const token = process.env.STORAGE_API_TOKEN?.trim() ?? "";
  if (!baseUrl || !token) {
    throw new Error("STORAGE_API_URL and STORAGE_API_TOKEN are required to seed images.");
  }

  const imageRes = await fetch(unsplashDownloadUrl(opts.photoId, opts.width ?? 800));
  if (!imageRes.ok) {
    console.error("Failed to download Unsplash", opts.photoId, imageRes.status);
    return "error";
  }
  const bytes = new Uint8Array(await imageRes.arrayBuffer());

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const form = new FormData();
    form.set("bucket", opts.bucket);
    form.set("fileId", opts.fileId);
    form.set(
      "file",
      new Blob([bytes], { type: "image/jpeg" }),
      `${opts.fileId}.jpg`,
    );

    const res = await fetch(`${baseUrl}/api/v1/files`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: form,
    });

    if (res.status === 201) return "created";
    if (res.status === 409) return "exists";
    if (res.status === 429) {
      const waitMs = 1500 * (attempt + 1);
      console.warn(`Rate limited ${opts.fileId}; retry in ${waitMs}ms`);
      await sleep(waitMs);
      continue;
    }
    let detail = "";
    try {
      const json = (await res.json()) as { error?: string };
      detail = json.error ?? "";
    } catch {
      // ignore
    }
    console.error("Upload failed", opts.fileId, res.status, detail);
    return "error";
  }
  console.error("Upload failed after retries", opts.fileId);
  return "error";
}

async function uploadProductPhoto(
  fileId: string,
  photoId: string,
): Promise<"created" | "exists" | "error"> {
  return uploadSeedPhoto({
    fileId,
    photoId,
    bucket: "product-images",
    width: 800,
  });
}

function formatPrice(amount: number): string {
  return amount.toFixed(2);
}

async function main() {
  const db = getDb();
  const userIds: Record<string, string> = {};
  for (const u of USERS) {
    userIds[u.key] = await ensureUser(u);
  }

  let bannersCreated = 0;
  let bannersExisting = 0;
  let bannersErrors = 0;
  for (const u of USERS) {
    if (!u.shop) continue;
    const userId = userIds[u.key];
    if (!userId) continue;

    const fileId = seedShopBannerFileId(u.shop.slug);
    const upload = await uploadSeedPhoto({
      fileId,
      photoId: u.shop.bannerPhotoId,
      bucket: "avatars",
      // Wide banner; keep under avatars 2MB limit.
      width: 1400,
    });
    if (upload === "created") bannersCreated += 1;
    else if (upload === "exists") bannersExisting += 1;
    else {
      bannersErrors += 1;
      continue;
    }

    await db
      .update(sellerProfiles)
      .set({ bannerFileId: fileId })
      .where(eq(sellerProfiles.userId, userId));
    await sleep(250);
  }
  console.log(
    `Shop banners created=${bannersCreated} exists=${bannersExisting} errors=${bannersErrors}`,
  );

  // Insert any missing catalog categories; leave existing rows alone.
  const catalogSlugs = CATEGORY_CATALOG.map((c) => c.slug);
  const existingCats = await db
    .select({ id: categories.id, slug: categories.slug })
    .from(categories)
    .where(inArray(categories.slug, catalogSlugs));
  const existingBySlug = new Map(existingCats.map((c) => [c.slug, c.id]));

  let catInserted = 0;
  for (const entry of CATEGORY_CATALOG) {
    if (existingBySlug.has(entry.slug)) continue;
    const id = `seed_cat_${entry.slug}`.slice(0, 36);
    await db.insert(categories).values({
      id,
      name: entry.name,
      slug: entry.slug,
    });
    existingBySlug.set(entry.slug, id);
    catInserted += 1;
  }
  if (catInserted > 0) {
    console.log(
      `Inserted ${catInserted} catalog categor${catInserted === 1 ? "y" : "ies"}.`,
    );
  }

  // Remove old sticker demo SKUs and their images.
  const staleIds = ["seed_demo_product", "seed_demo_free_product"];
  await db
    .delete(productImages)
    .where(inArray(productImages.productId, staleIds));
  await db.delete(products).where(inArray(products.id, staleIds));

  let productsInserted = 0;
  let imagesCreated = 0;
  let imagesExisting = 0;
  let imageErrors = 0;

  for (const entry of SEED_PRODUCTS) {
    const productId = seedProductId(entry.key);
    const sellerId = userIds[entry.sellerKey];
    const categoryId = existingBySlug.get(entry.categorySlug);
    if (!sellerId || !categoryId) {
      console.error(
        `Skip ${entry.key}: missing seller=${Boolean(sellerId)} category=${entry.categorySlug}`,
      );
      continue;
    }

    const existing = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!existing[0]) {
      await db.insert(products).values({
        id: productId,
        sellerId,
        categoryId,
        title: entry.title,
        description: entry.description,
        price: formatPrice(entry.price),
        isFree: entry.price === 0,
        status: "active",
        stock: 10,
        available: true,
        currency: "LKR",
        featured: false,
      });
      productsInserted += 1;
    } else {
      await db
        .update(products)
        .set({
          sellerId,
          categoryId,
          title: entry.title,
          description: entry.description,
          price: formatPrice(entry.price),
          isFree: entry.price === 0,
          status: "active",
          stock: 10,
          available: true,
          currency: "LKR",
        })
        .where(eq(products.id, productId));
    }

    // Ensure every catalog photo is uploaded and has a product_images row.
    const existingImages = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, productId));
    const existingFileIds = new Set(existingImages.map((row) => row.fileId));

    for (let i = 0; i < entry.photoIds.length; i += 1) {
      const fileId = seedImageFileId(entry.key, i);
      const upload = await uploadProductPhoto(fileId, entry.photoIds[i]!);
      if (upload === "created") imagesCreated += 1;
      else if (upload === "exists") imagesExisting += 1;
      else {
        imageErrors += 1;
        continue;
      }
      if (!existingFileIds.has(fileId)) {
        await db.insert(productImages).values({
          id: newId(),
          productId,
          fileId,
          sortOrder: i,
          alt: entry.title,
        });
        existingFileIds.add(fileId);
      }
      await sleep(250);
    }
  }

  console.log(
    `Products inserted=${productsInserted}; images created=${imagesCreated} exists=${imagesExisting} errors=${imageErrors}`,
  );

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
  console.log(
    "Sellers: seller@knurdz.demo (Nimal Studio), amaya@knurdz.demo (Amaya Atelier)",
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => getPool().end());
