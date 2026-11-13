import { BUCKET_AVATARS } from "./config";
import { getAppUrl } from "@/lib/config/app";

/** Same-origin public file URL; `/api/files` serves files from UPLOAD_DIR. */
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

function isProviderAvatarHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return (
    host === "avatars.githubusercontent.com" ||
    host === "googleusercontent.com" ||
    host.endsWith(".googleusercontent.com")
  );
}

/**
 * Google (`*.googleusercontent.com`) and GitHub (`avatars.githubusercontent.com`)
 * profile photo URLs only. Rejects anything else so a stored image string
 * cannot point the avatar at an arbitrary host.
 */
export function safeOAuthAvatarUrl(
  image: string | null | undefined,
): string | null {
  const raw = image?.trim();
  if (!raw || raw.length > 2048) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  if (url.username || url.password) return null;
  if (!isProviderAvatarHost(url.hostname)) return null;
  return url.href;
}

/**
 * Uploaded avatar when the user set one, otherwise the GitHub/Google photo.
 */
export function resolveAvatarUrl(
  avatarFileId: string | null | undefined,
  oauthImage: string | null | undefined,
): string | null {
  return (
    getAvatarPreviewUrl(avatarFileId ?? null) ?? safeOAuthAvatarUrl(oauthImage)
  );
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
