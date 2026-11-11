/**
 * One-shot: download Unsplash photos into public/categories/{slug}.jpg
 * Usage: npx tsx scripts/download-category-images.ts
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  CATEGORY_CATALOG,
  unsplashDownloadUrl,
} from "../lib/store/category-catalog";

async function main() {
  const outDir = path.join(process.cwd(), "public", "categories");
  await mkdir(outDir, { recursive: true });

  let ok = 0;
  let fail = 0;
  for (const entry of CATEGORY_CATALOG) {
    const url = unsplashDownloadUrl(entry.photoId, 480);
    const res = await fetch(url);
    if (!res.ok) {
      console.error("FAIL", entry.slug, res.status, url);
      fail += 1;
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(path.join(outDir, `${entry.slug}.jpg`), buf);
    console.log("OK", entry.slug, buf.length);
    ok += 1;
  }
  console.log(`Done. ok=${ok} fail=${fail}`);
  if (fail > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
