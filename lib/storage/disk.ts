import { createReadStream, createWriteStream } from "fs";
import { access, constants, mkdir, unlink } from "fs/promises";
import path from "path";
import { pipeline } from "stream/promises";
import { newId } from "@/lib/db/client";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { storedFiles } from "@/lib/db/schema";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

function bucketDir(bucketId: string): string {
  return path.join(UPLOAD_ROOT, bucketId);
}

async function ensureBucket(bucketId: string) {
  await mkdir(bucketDir(bucketId), { recursive: true });
}

export async function putStoredFile(params: {
  bucketId: string;
  ownerId: string;
  file: File;
  fileId?: string;
}): Promise<{ fileId: string }> {
  await ensureBucket(params.bucketId);
  const fileId = params.fileId ?? newId();
  const dest = path.join(bucketDir(params.bucketId), fileId);
  const buffer = Buffer.from(await params.file.arrayBuffer());
  await pipeline(
    async function* () {
      yield buffer;
    },
    createWriteStream(dest),
  );

  const db = getDb();
  await db.insert(storedFiles).values({
    id: fileId,
    bucketId: params.bucketId,
    ownerId: params.ownerId,
    mimeType: params.file.type || "application/octet-stream",
    sizeBytes: params.file.size,
    originalName: params.file.name,
  });

  return { fileId };
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
  const filePath = path.join(bucketDir(bucketId), fileId);
  try {
    await access(filePath, constants.R_OK);
  } catch {
    return null;
  }
  const meta = await getStoredFileMeta(fileId);
  return {
    stream: createReadStream(filePath),
    mimeType: meta?.mimeType ?? "application/octet-stream",
  };
}

export async function deleteStoredFile(bucketId: string, fileId: string) {
  const filePath = path.join(bucketDir(bucketId), fileId);
  try {
    await unlink(filePath);
  } catch {
    // ignore missing file
  }
  const db = getDb();
  await db.delete(storedFiles).where(eq(storedFiles.id, fileId));
}
