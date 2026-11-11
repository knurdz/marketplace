const SAFE_FILE_ID = /^[A-Za-z0-9_-]{8,64}$/;

export function isSafeFileId(fileId: string): boolean {
  return SAFE_FILE_ID.test(fileId);
}
