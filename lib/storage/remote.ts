import { eq } from "drizzle-orm";
import { getDb, newId } from "@/lib/db/client";
import { storedFiles } from "@/lib/db/schema";

function getRemoteStorageConfig(): { baseUrl: string; token: string } | null {
  const baseUrl = process.env.STORAGE_API_URL?.trim().replace(/\/$/, "") ?? "";
  const token = process.env.STORAGE_API_TOKEN?.trim() ?? "";
  if (!baseUrl || !token) return null;
  return { baseUrl, token };
}

export function isRemoteStorageConfigured(): boolean {
  return getRemoteStorageConfig() !== null;
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

  const response = await fetch(`${cfg.baseUrl}/api/v1/files`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      Accept: "application/json",
    },
    body: form,
  });

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const json = (await response.json()) as { error?: string };
      if (json?.error) detail = json.error;
    } catch {
      // ignore non-json error body
    }
    throw new Error(`Storage upload failed: ${detail}`);
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
    await fetch(url, {
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
