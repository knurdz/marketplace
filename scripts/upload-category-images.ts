/**
 * Copy public/categories/{slug}.jpg into UPLOAD_DIR (categories bucket).
 * Usage: npx tsx --env-file=.env.local scripts/upload-category-images.ts
 *
 * File IDs are deterministic: category-{slug}. Existing files are skipped.
 */
import { access, constants, readFile } from "node:fs/promises";
import path from "node:path";
import { BUCKET_CATEGORIES } from "../lib/backend/config";
import { detectImageFileMime } from "../lib/security/file-signature";
import { isSafeFileId } from "../lib/security/storage-id";
import { putStoredFile } from "../lib/storage/disk";
import { getUploadRoot } from "../lib/storage/upload-root";
import {
  CATEGORY_CATALOG,
  categoryImageFileId,
} from "../lib/store/category-catalog";

const SEED_OWNER_ID = "seed-category-images";

async function fileExistsOnDisk(
  bucketId: string,
  fileId: string,
): Promise<boolean> {
  if (!isSafeFileId(fileId)) return false;
  const filePath = path.join(getUploadRoot(), bucketId, fileId);
  try {
    await access(filePath, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const bucket = BUCKET_CATEGORIES;
  const dir = path.join(process.cwd(), "public", "categories");

  let created = 0;
  let exists = 0;
  let failed = 0;

  for (const entry of CATEGORY_CATALOG) {
    const fileId = categoryImageFileId(entry.slug);
    if (await fileExistsOnDisk(bucket, fileId)) {
      exists += 1;
      console.log("OK exists ", entry.slug, fileId);
      continue;
    }

    const filePath = path.join(dir, `${entry.slug}.jpg`);
    const bytes = await readFile(filePath);
    const file = new File([bytes], `${entry.slug}.jpg`, { type: "image/jpeg" });
    const detectedMime = await detectImageFileMime(file);
    if (!detectedMime) {
      failed += 1;
      console.error("  invalid image", entry.slug);
      continue;
    }

    try {
      await putStoredFile({
        bucketId: bucket,
        ownerId: SEED_OWNER_ID,
        file,
        fileId,
        detectedMime,
      });
      created += 1;
      console.log("OK created", entry.slug, fileId);
    } catch (err) {
      failed += 1;
      console.error("  error", entry.slug, err);
    }
  }

  console.log(
    `Done. bucket=${bucket} created=${created} exists=${exists} failed=${failed}`,
  );
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
