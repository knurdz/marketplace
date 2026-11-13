import { createReadStream, createWriteStream } from "fs";
import { access, constants, mkdir, open, unlink } from "fs/promises";
import path from "path";
import { pipeline } from "stream/promises";
import { ALL_BUCKET_IDS, IMAGE_MIME_TYPES } from "@/lib/backend/config";
import { newId } from "@/lib/db/client";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { storedFiles } from "@/lib/db/schema";
import {
  detectImageMimeType,
  type DetectedImageMime,
} from "@/lib/security/file-signature";
import { isSafeFileId } from "@/lib/security/storage-id";
import { getUploadRoot } from "./upload-root";

const ALLOWED_BUCKETS = new Set<string>(ALL_BUCKET_IDS);

function uploadRoot(): string {
  return getUploadRoot();
}

function bucketDir(bucketId: string): string {
  if (!ALLOWED_BUCKETS.has(bucketId)) {
    throw new Error("Invalid storage bucket.");
  }
  return path.join(uploadRoot(), bucketId);
}

function safeFilePath(bucketId: string, fileId: string): string {
  if (!isSafeFileId(fileId)) {
    throw new Error("Invalid file identifier.");
  }

  const root = path.resolve(uploadRoot());
  const resolved = path.resolve(bucketDir(bucketId), fileId);
  if (!resolved.startsWith(`${root}${path.sep}`)) {
    throw new Error("Invalid storage path.");
  }
  return resolved;
}

async function ensureBucket(bucketId: string) {
  await mkdir(bucketDir(bucketId), { recursive: true });
}

export async function putStoredFile(params: {
  bucketId: string;
  ownerId: string;
  file: File;
  fileId?: string;
  detectedMime: DetectedImageMime;
}): Promise<{ fileId: string }> {
  await ensureBucket(params.bucketId);
  const fileId = params.fileId ?? newId();
  const dest = safeFilePath(params.bucketId, fileId);
  const buffer = Buffer.from(await params.file.arrayBuffer());
  await pipeline(
    async function* () {
      yield buffer;
    },
    createWriteStream(dest),
  );

  try {
    const db = getDb();
    await db.insert(storedFiles).values({
      id: fileId,
      bucketId: params.bucketId,
      ownerId: params.ownerId,
      mimeType: params.detectedMime,
      sizeBytes: params.file.size,
      originalName: params.file.name,
    });
  } catch {
    try {
      await unlink(dest);
    } catch {
      // Best effort: preserve the original metadata failure.
    }
    throw new Error("Unable to save uploaded file.");
  }

  return { fileId };
}

function isKnownImageMime(
  mime: string | null | undefined,
): mime is DetectedImageMime {
  if (!mime) return false;
  const normalized = mime.trim().toLowerCase();
  return IMAGE_MIME_TYPES.includes(
    normalized as (typeof IMAGE_MIME_TYPES)[number],
  );
}

/** Magic-byte sniff when `stored_files` rows are missing (e.g. Laravel disk copy). */
async function sniffImageMimeFromPath(
  filePath: string,
): Promise<DetectedImageMime | null> {
  const handle = await open(filePath, "r");
  try {
    const buf = Buffer.alloc(12);
    const { bytesRead } = await handle.read(buf, 0, 12, 0);
    if (bytesRead < 3) return null;
    return detectImageMimeType(new Uint8Array(buf.subarray(0, bytesRead)));
  } finally {
    await handle.close();
  }
}

export async function getStoredFileMeta(fileId: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(storedFiles)
    .where(eq(storedFiles.id, fileId))
    .limit(1);
  return rows[0] ?? null;
}

export async function readStoredFile(
  bucketId: string,
  fileId: string,
): Promise<{ stream: NodeJS.ReadableStream; mimeType: string } | null> {
  let filePath: string;
  try {
    filePath = safeFilePath(bucketId, fileId);
  } catch {
    return null;
  }
  try {
    await access(filePath, constants.R_OK);
  } catch {
    return null;
  }
  const meta = await getStoredFileMeta(fileId);
  let mimeType: DetectedImageMime | null = isKnownImageMime(meta?.mimeType)
    ? (meta.mimeType.trim().toLowerCase() as DetectedImageMime)
    : null;
  if (!mimeType) {
    mimeType = await sniffImageMimeFromPath(filePath);
  }
  if (!mimeType) return null;

  return {
    stream: createReadStream(/* turbopackIgnore: true */ filePath),
    mimeType,
  };
}

export async function deleteStoredFile(
  bucketId: string,
  fileId: string,
): Promise<boolean> {
  const filePath = safeFilePath(bucketId, fileId);
  try {
    await unlink(filePath);
  } catch {
    // ignore missing file
  }
  const db = getDb();
  const [result] = await db
    .delete(storedFiles)
    .where(eq(storedFiles.id, fileId));
  return result.affectedRows > 0;
}
