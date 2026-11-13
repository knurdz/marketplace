import {
  detectImageFileMime,
  type DetectedImageMime,
} from "@/lib/security/file-signature";
import {
  deleteStoredFile as deleteDiskFile,
  getStoredFileMeta,
  putStoredFile as putDiskFile,
  readStoredFile,
} from "./disk";

export { getStoredFileMeta, readStoredFile };

/** Public reads from local disk via `/api/files`. */
export async function readPublicStoredFile(
  bucketId: string,
  fileId: string,
): Promise<{ stream: NodeJS.ReadableStream; mimeType: string } | null> {
  return readStoredFile(bucketId, fileId);
}

export async function putStoredFile(params: {
  bucketId: string;
  ownerId: string;
  file: File;
  fileId?: string;
  detectedMime?: DetectedImageMime;
}): Promise<{ fileId: string }> {
  const detectedMime = await detectImageFileMime(params.file);
  if (
    !detectedMime ||
    (params.detectedMime && params.detectedMime !== detectedMime)
  ) {
    throw new Error("Unsupported file content.");
  }
  const verifiedParams = { ...params, detectedMime };
  return putDiskFile(verifiedParams);
}

export async function deleteStoredFile(
  bucketId: string,
  fileId: string,
): Promise<boolean> {
  return deleteDiskFile(bucketId, fileId);
}
