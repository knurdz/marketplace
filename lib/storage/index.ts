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
import {
  deleteRemoteFile,
  isRemoteStorageConfigured,
  putRemoteFile,
} from "./remote";

export { getStoredFileMeta, isRemoteStorageConfigured, readStoredFile };

function assertDiskStorageAllowed(): void {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Remote storage is required in production. Configure STORAGE_API_URL and STORAGE_API_TOKEN.",
    );
  }
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

  if (isRemoteStorageConfigured()) {
    return putRemoteFile(verifiedParams);
  }
  assertDiskStorageAllowed();
  return putDiskFile(verifiedParams);
}

export async function deleteStoredFile(
  bucketId: string,
  fileId: string,
): Promise<boolean> {
  if (isRemoteStorageConfigured()) {
    return deleteRemoteFile(bucketId, fileId);
  }
  assertDiskStorageAllowed();
  return deleteDiskFile(bucketId, fileId);
}
