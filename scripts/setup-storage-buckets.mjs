/**
 * Idempotent Appwrite Storage bucket setup for Knurdz Marketplace.
 * Usage: node --env-file=.env.local scripts/setup-storage-buckets.mjs
 *
 * Permission intent:
 * - Bucket create: users (signed-in) for all three.
 * - File security ON: per-file ACLs set at upload time.
 * - avatars / product-images: public read via file read("any").
 * - bank-slips: private — uploader + label:admin only (no read("any")).
 */
import { Client, Permission, Role, Storage } from "node-appwrite";

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
const storage = new Storage(client);

const BUCKETS = [
  {
    bucketId: "avatars",
    name: "Avatars",
    maximumFileSize: 2 * 1024 * 1024,
    allowedFileExtensions: ["jpg", "jpeg", "png", "webp"],
    compression: "gzip",
    encryption: false,
    antivirus: false,
    transformations: true,
  },
  {
    bucketId: "product-images",
    name: "Product Images",
    maximumFileSize: 5 * 1024 * 1024,
    allowedFileExtensions: ["jpg", "jpeg", "png", "webp"],
    compression: "gzip",
    encryption: false,
    antivirus: false,
    transformations: true,
  },
  {
    bucketId: "bank-slips",
    name: "Bank Slips",
    maximumFileSize: 5 * 1024 * 1024,
    allowedFileExtensions: ["jpg", "jpeg", "png", "webp", "pdf"],
    compression: "none",
    encryption: true,
    antivirus: true,
    transformations: false,
  },
];

const bucketCreatePerms = [Permission.create(Role.users())];

async function ensureBucket(spec) {
  try {
    await storage.getBucket({ bucketId: spec.bucketId });
    console.log(`= bucket exists: ${spec.bucketId}`);
    await storage.updateBucket({
      bucketId: spec.bucketId,
      name: spec.name,
      permissions: bucketCreatePerms,
      fileSecurity: true,
      enabled: true,
      maximumFileSize: spec.maximumFileSize,
      allowedFileExtensions: spec.allowedFileExtensions,
      compression: spec.compression,
      encryption: spec.encryption,
      antivirus: spec.antivirus,
      transformations: spec.transformations,
    });
    console.log(`  ~ updated settings: ${spec.bucketId}`);
  } catch {
    await storage.createBucket({
      bucketId: spec.bucketId,
      name: spec.name,
      permissions: bucketCreatePerms,
      fileSecurity: true,
      enabled: true,
      maximumFileSize: spec.maximumFileSize,
      allowedFileExtensions: spec.allowedFileExtensions,
      compression: spec.compression,
      encryption: spec.encryption,
      antivirus: spec.antivirus,
      transformations: spec.transformations,
    });
    console.log(`+ bucket created: ${spec.bucketId}`);
  }
}

async function main() {
  for (const spec of BUCKETS) {
    await ensureBucket(spec);
  }
  console.log("Storage buckets ready.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
