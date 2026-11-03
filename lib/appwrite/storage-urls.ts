import { BUCKET_AVATARS } from "./config";
import { getAppUrl } from "@/lib/config/app";

/** Public file URL served by Next.js disk storage. */
export function getFileViewUrl(bucketId: string, fileId: string): string {
  const base = getAppUrl().replace(/\/$/, "");
  return `${base}/api/files/${encodeURIComponent(bucketId)}/${encodeURIComponent(fileId)}`;
}

export function getFilePreviewUrl(
  bucketId: string,
  fileId: string,
  _opts?: { width?: number; height?: number },
): string {
  return getFileViewUrl(bucketId, fileId);
}

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

export function getShopBannerPreviewUrl(
  bannerFileId: string | null,
): string | null {
  if (!bannerFileId) return null;
  return getFilePreviewUrl(BUCKET_AVATARS, bannerFileId, {
    width: 1200,
    height: 320,
  });
}
