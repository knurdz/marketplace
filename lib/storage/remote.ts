import { Readable } from "node:stream";
import { eq } from "drizzle-orm";
import { IMAGE_MIME_TYPES } from "@/lib/backend/config";
import { getDb, newId } from "@/lib/db/client";
import { storedFiles } from "@/lib/db/schema";
import type { DetectedImageMime } from "@/lib/security/file-signature";
import { isSafeFileId } from "@/lib/security/storage-id";

const REMOTE_TIMEOUT_MS = 20_000;
const SAFE_FILE_ID = /^[A-Za-z0-9_-]{8,64}$/;

function getRemoteStorageConfig(): { baseUrl: string; token: string } | null {
  const baseUrl = process.env.STORAGE_API_URL?.trim().replace(/\/$/, "") ?? "";
  const token = process.env.STORAGE_API_TOKEN?.trim() ?? "";
  if (!baseUrl || !token) return null;

  const isLocalDev =
    process.env.NODE_ENV !== "production" &&
    (baseUrl.startsWith("http://localhost") ||
      baseUrl.startsWith("http://127.0.0.1"));

  if (!isLocalDev && !baseUrl.startsWith("https://")) {
    throw new Error(
      "STORAGE_API_URL must use https:// outside local development.",
    );
  }

  return { baseUrl, token };
}

export function isRemoteStorageConfigured(): boolean {
  try {
    return getRemoteStorageConfig() !== null;
  } catch {
    return false;
  }
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REMOTE_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function sanitizeRemoteError(status: number): string {
  return `Storage request failed (HTTP ${status}).`;
}

async function deleteRemoteObject(
  cfg: { baseUrl: string; token: string },
  bucketId: string,
  fileId: string,
): Promise<void> {
  try {
    await fetchWithTimeout(
      `${cfg.baseUrl}/api/v1/files/${encodeURIComponent(bucketId)}/${encodeURIComponent(fileId)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${cfg.token}`,
          Accept: "application/json",
        },
      },
    );
  } catch {
    // Best-effort orphan cleanup.
  }
}

export async function putRemoteFile(params: {
  bucketId: string;
  ownerId: string;
  file: File;
  fileId?: string;
  detectedMime: DetectedImageMime;
}): Promise<{ fileId: string }> {
  const cfg = getRemoteStorageConfig();
  if (!cfg) {
    throw new Error("Remote storage API is not configured.");
  }

  const fileId = params.fileId ?? newId();
  const form = new FormData();
  form.set("bucket", params.bucketId);
  form.set("fileId", fileId);
  form.set("file", params.file, params.file.name || fileId);

  let response: Response;
  try {
    response = await fetchWithTimeout(`${cfg.baseUrl}/api/v1/files`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        Accept: "application/json",
      },
      body: form,
    });
  } catch {
    throw new Error("Storage upload failed: request timed out or unreachable.");
  }

  if (!response.ok) {
    throw new Error(sanitizeRemoteError(response.status));
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    await deleteRemoteObject(cfg, params.bucketId, fileId);
    throw new Error("Storage API returned an invalid response.");
  }

  const responseFileId =
    payload &&
    typeof payload === "object" &&
    "fileId" in payload &&
    typeof payload.fileId === "string"
      ? payload.fileId.trim()
      : "";
  const responseMime =
    payload &&
    typeof payload === "object" &&
    "mimeType" in payload &&
    typeof payload.mimeType === "string"
      ? payload.mimeType.trim().toLowerCase()
      : "";

  if (
    !SAFE_FILE_ID.test(responseFileId) ||
    responseFileId !== fileId ||
    !IMAGE_MIME_TYPES.includes(
      responseMime as (typeof IMAGE_MIME_TYPES)[number],
    ) ||
    responseMime !== params.detectedMime
  ) {
    await deleteRemoteObject(cfg, params.bucketId, fileId);
    throw new Error("Storage API returned invalid file metadata.");
  }

  try {
    const db = getDb();
    await db.insert(storedFiles).values({
      id: responseFileId,
      bucketId: params.bucketId,
      ownerId: params.ownerId,
      mimeType: responseMime,
      sizeBytes: params.file.size,
      originalName: params.file.name,
    });
  } catch {
    await deleteRemoteObject(cfg, params.bucketId, responseFileId);
    throw new Error("Unable to save uploaded file.");
  }

  return { fileId: responseFileId };
}

/** Public GET `/files/{bucket}/{fileId}` (no bearer). Used by storefront `/api/files` proxy. */
export async function readPublicRemoteFile(
  bucketId: string,
  fileId: string,
): Promise<{ stream: NodeJS.ReadableStream; mimeType: string } | null> {
  const cfg = getRemoteStorageConfig();
  if (!cfg || !isSafeFileId(fileId)) return null;

  const url = `${cfg.baseUrl}/files/${encodeURIComponent(bucketId)}/${encodeURIComponent(fileId)}`;
  let response: Response;
  try {
    response = await fetchWithTimeout(url, {
      method: "GET",
      headers: { Accept: "image/*" },
    });
  } catch {
    return null;
  }
  if (!response.ok) return null;

  const rawMime =
    response.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() ??
    "";
  if (
    !IMAGE_MIME_TYPES.includes(
      rawMime as (typeof IMAGE_MIME_TYPES)[number],
    )
  ) {
    return null;
  }

  try {
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length === 0) return null;
    return {
      stream: Readable.from(buffer),
      mimeType: rawMime,
    };
  } catch {
    return null;
  }
}

export async function deleteRemoteFile(
  bucketId: string,
  fileId: string,
): Promise<boolean> {
  const cfg = getRemoteStorageConfig();
  if (!cfg) {
    throw new Error("Remote storage API is not configured.");
  }

  await deleteRemoteObject(cfg, bucketId, fileId);

  const db = getDb();
  const [result] = await db
    .delete(storedFiles)
    .where(eq(storedFiles.id, fileId));
  return result.affectedRows > 0;
}
