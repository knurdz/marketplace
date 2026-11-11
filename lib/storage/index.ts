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

export async function putStoredFile(params: {
  bucketId: string;
  ownerId: string;
  file: File;
  fileId?: string;
}): Promise<{ fileId: string }> {
  if (isRemoteStorageConfigured()) {
    return putRemoteFile(params);
  }
  return putDiskFile(params);
}

export async function deleteStoredFile(
  bucketId: string,
  fileId: string,
): Promise<void> {
  if (isRemoteStorageConfigured()) {
    await deleteRemoteFile(bucketId, fileId);
    return;
  }
  await deleteDiskFile(bucketId, fileId);
}
