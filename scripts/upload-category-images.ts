/**
 * Upload public/categories/{slug}.jpg to the Hostinger storage API.
 * Usage: npx tsx --env-file=.env.local scripts/upload-category-images.ts
 *
 * Uses the `categories` bucket (falls back to `product-images` if missing).
 * File IDs are deterministic: category-{slug}. Existing files (409) are skipped.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  BUCKET_CATEGORIES,
  BUCKET_PRODUCT_IMAGES,
} from "../lib/backend/config";
import {
  CATEGORY_CATALOG,
  categoryImageFileId,
} from "../lib/store/category-catalog";

function storageConfig(): { baseUrl: string; token: string } {
  const baseUrl = process.env.STORAGE_API_URL?.trim().replace(/\/$/, "") ?? "";
  const token = process.env.STORAGE_API_TOKEN?.trim() ?? "";
  if (!baseUrl || !token) {
    throw new Error("Set STORAGE_API_URL and STORAGE_API_TOKEN in .env.local");
  }
  return { baseUrl, token };
}

async function uploadOne(
  cfg: { baseUrl: string; token: string },
  bucket: string,
  fileId: string,
  bytes: Buffer,
  filename: string,
): Promise<"created" | "exists" | "invalid_bucket" | "error"> {
  const form = new FormData();
  form.set("bucket", bucket);
  form.set("fileId", fileId);
  form.set(
    "file",
    new Blob([new Uint8Array(bytes)], { type: "image/jpeg" }),
    filename,
  );

  const res = await fetch(`${cfg.baseUrl}/api/v1/files`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      Accept: "application/json",
    },
    body: form,
  });

  if (res.status === 201) return "created";
  if (res.status === 409) return "exists";

  let detail = "";
  try {
    const json = (await res.json()) as { error?: string };
    detail = json.error ?? "";
  } catch {
    // ignore
  }
  if (res.status === 422 && /invalid bucket/i.test(detail)) {
    return "invalid_bucket";
  }
  console.error(`  error ${fileId}: HTTP ${res.status} ${detail}`);
  return "error";
}

async function resolveBucket(
  cfg: { baseUrl: string; token: string },
): Promise<string> {
  const forced = process.env.CATEGORY_IMAGE_BUCKET?.trim();
  if (forced === BUCKET_CATEGORIES || forced === BUCKET_PRODUCT_IMAGES) {
    return forced;
  }

  // Probe with a tiny jpeg header check via first catalog file.
  const probePath = path.join(
    process.cwd(),
    "public",
    "categories",
    `${CATEGORY_CATALOG[0]!.slug}.jpg`,
  );
  const bytes = await readFile(probePath);
  const probeId = "category-bucketprobe";
  const result = await uploadOne(
    cfg,
    BUCKET_CATEGORIES,
    probeId,
    bytes,
    "probe.jpg",
  );
  if (result === "invalid_bucket") {
    console.log(
      `Bucket "${BUCKET_CATEGORIES}" not on remote yet; using "${BUCKET_PRODUCT_IMAGES}".`,
    );
    return BUCKET_PRODUCT_IMAGES;
  }
  if (result === "created" || result === "exists") {
    // Clean probe if we created it (best-effort).
    if (result === "created") {
      await fetch(
        `${cfg.baseUrl}/api/v1/files/${encodeURIComponent(BUCKET_CATEGORIES)}/${encodeURIComponent(probeId)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${cfg.token}`,
            Accept: "application/json",
          },
        },
      ).catch(() => undefined);
    }
    console.log(`Using bucket "${BUCKET_CATEGORIES}".`);
    return BUCKET_CATEGORIES;
  }
  console.log(
    `Probe failed; falling back to "${BUCKET_PRODUCT_IMAGES}".`,
  );
  return BUCKET_PRODUCT_IMAGES;
}

async function main() {
  const cfg = storageConfig();
  const bucket = await resolveBucket(cfg);
  const dir = path.join(process.cwd(), "public", "categories");

  let created = 0;
  let exists = 0;
  let failed = 0;

  for (const entry of CATEGORY_CATALOG) {
    const fileId = categoryImageFileId(entry.slug);
    const filePath = path.join(dir, `${entry.slug}.jpg`);
    const bytes = await readFile(filePath);
    const result = await uploadOne(
      cfg,
      bucket,
      fileId,
      bytes,
      `${entry.slug}.jpg`,
    );
    if (result === "created") {
      created += 1;
      console.log("OK created", entry.slug, fileId);
    } else if (result === "exists") {
      exists += 1;
      console.log("OK exists ", entry.slug, fileId);
    } else {
      failed += 1;
    }
  }

  // Remove earlier probe leftover if present.
  await fetch(
    `${cfg.baseUrl}/api/v1/files/${encodeURIComponent(BUCKET_PRODUCT_IMAGES)}/${encodeURIComponent("cat-probe-digital")}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        Accept: "application/json",
      },
    },
  ).catch(() => undefined);

  console.log(
    `Done. bucket=${bucket} created=${created} exists=${exists} failed=${failed}`,
  );
  console.log(
    `Uploaded to bucket="${bucket}". App defaults to categories; override with NEXT_PUBLIC_CATEGORY_IMAGE_BUCKET if needed.`,
  );
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
