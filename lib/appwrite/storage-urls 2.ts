import {
  BUCKET_AVATARS,
  getAppwriteEndpoint,
  getAppwriteProjectId,
} from "./config";

/** Public view URL (no secret). Safe for client when file has read(any). */
export function getFileViewUrl(bucketId: string, fileId: string): string {
  const endpoint = getAppwriteEndpoint().replace(/\/$/, "");
  const projectId = getAppwriteProjectId();
  return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${encodeURIComponent(projectId)}`;
}

/** Public preview URL for images (bucket must allow transformations). */
export function getFilePreviewUrl(
  bucketId: string,
  fileId: string,
  opts?: { width?: number; height?: number },
): string {
  const endpoint = getAppwriteEndpoint().replace(/\/$/, "");
  const projectId = getAppwriteProjectId();
  const params = new URLSearchParams({ project: projectId });
  if (opts?.width) params.set("width", String(opts.width));
  if (opts?.height) params.set("height", String(opts.height));
  return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/preview?${params.toString()}`;
}

/** Public avatar preview URL for a profile (null if no avatar). */
export function getAvatarPreviewUrl(
  avatarFileId: string | null,
): string | null {
  if (!avatarFileId) return null;
  return getFilePreviewUrl(BUCKET_AVATARS, avatarFileId, {
    width: 128,
    height: 128,
  });
}

export function getAvatarViewUrl(avatarFileId: string | null): string | null {
  if (!avatarFileId) return null;
  return getFileViewUrl(BUCKET_AVATARS, avatarFileId);
}

/** Public shop banner preview (avatars bucket, read(any)). */
export function getShopBannerPreviewUrl(
  bannerFileId: string | null,
): string | null {
  if (!bannerFileId) return null;
  return getFilePreviewUrl(BUCKET_AVATARS, bannerFileId, {
    width: 1200,
    height: 320,
  });
}
