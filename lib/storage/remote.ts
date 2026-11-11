import { eq } from "drizzle-orm";
import { getDb, newId } from "@/lib/db/client";
import { storedFiles } from "@/lib/db/schema";

const REMOTE_TIMEOUT_MS = 20_000;

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

function sanitizeRemoteError(status: number, bodyError?: string): string {
  const safe =
    bodyError &&
    !/token|bearer|authorization|\/home\/|storage\/app/i.test(bodyError)
      ? bodyError
      : `HTTP ${status}`;
  return `Storage request failed: ${safe}`;
}

export async function putRemoteFile(params: {
  bucketId: string;
  ownerId: string;
  file: File;
  fileId?: string;
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
    let detail: string | undefined;
    try {
      const json = (await response.json()) as { error?: string };
      detail = json?.error;
    } catch {
      // ignore non-json error body
    }
    throw new Error(sanitizeRemoteError(response.status, detail));
  }

  const payload = (await response.json()) as { fileId?: string };
  const resolvedId = payload.fileId?.trim() || fileId;

  const db = getDb();
  await db.insert(storedFiles).values({
    id: resolvedId,
    bucketId: params.bucketId,
    ownerId: params.ownerId,
    mimeType: params.file.type || "application/octet-stream",
    sizeBytes: params.file.size,
    originalName: params.file.name,
  });

  return { fileId: resolvedId };
}

export async function deleteRemoteFile(
  bucketId: string,
  fileId: string,
): Promise<void> {
  const cfg = getRemoteStorageConfig();
  if (!cfg) {
    throw new Error("Remote storage API is not configured.");
  }

  const url = `${cfg.baseUrl}/api/v1/files/${encodeURIComponent(bucketId)}/${encodeURIComponent(fileId)}`;
  try {
    await fetchWithTimeout(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        Accept: "application/json",
      },
    });
  } catch {
    // Keep deletion idempotent when remote is unreachable or already removed
  }

  const db = getDb();
  await db.delete(storedFiles).where(eq(storedFiles.id, fileId));
}
