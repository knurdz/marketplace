import { DbException } from "@/lib/db/compat";
import { newId } from "@/lib/db/client";
import { deleteStoredFile, getStoredFileMeta, putStoredFile } from "@/lib/storage";
import {
  releaseStorageQuota,
  reserveStorageQuota,
} from "@/lib/storage/quota";
import {
  detectImageFileMime,
  type DetectedImageMime,
} from "@/lib/security/file-signature";
import { assertDurableRateLimit } from "@/lib/security/durable-rate-limit";
import {
  RATE_LIMIT_MESSAGE,
  RATE_LIMITS,
} from "@/lib/security/rate-limit";
import { ROLE_LABELS, userHasLabel } from "./roles";
import {
  AVATAR_MAX_BYTES,
  BUCKET_AVATARS,
  BUCKET_CATEGORIES,
  BUCKET_PRODUCT_IMAGES,
  IMAGE_EXTENSIONS,
  IMAGE_MIME_TYPES,
  PRODUCT_IMAGE_MAX_BYTES,
} from "./config";
import { getLoggedInUser } from "./session";

export type UploadValidationError = {
  ok: false;
  error: string;
};

export type UploadValidationOk = {
  ok: true;
  file: File;
  extension: string;
  detectedMime: DetectedImageMime;
};

export type UploadValidationResult = UploadValidationError | UploadValidationOk;

function extensionOf(filename: string): string {
  const parts = filename.toLowerCase().split(".");
  if (parts.length < 2) return "";
  return parts[parts.length - 1] ?? "";
}

const MIME_EXTENSIONS: Record<DetectedImageMime, readonly string[]> = {
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
};

export async function validateUpload(params: {
  file: FormDataEntryValue | null;
  maxBytes: number;
  allowedMime: readonly string[];
  allowedExt: readonly string[];
}): Promise<UploadValidationResult> {
  const { file, maxBytes, allowedMime, allowedExt } = params;
  if (!(file instanceof File)) {
    return { ok: false, error: "A file is required." };
  }
  if (!file.name || file.size <= 0) {
    return { ok: false, error: "File is empty or missing a name." };
  }
  if (file.size > maxBytes) {
    const mb = Math.round((maxBytes / (1024 * 1024)) * 10) / 10;
    return { ok: false, error: `File must be at most ${mb}MB.` };
  }
  const mime = (file.type || "").toLowerCase();
  if (!allowedMime.includes(mime)) {
    return {
      ok: false,
      error: `File type not allowed. Use: ${allowedExt.join(", ")}.`,
    };
  }
  const extension = extensionOf(file.name);
  if (!allowedExt.includes(extension)) {
    return {
      ok: false,
      error: `File extension not allowed. Use: ${allowedExt.join(", ")}.`,
    };
  }
  const detectedMime = await detectImageFileMime(file);
  if (
    !detectedMime ||
    detectedMime !== mime ||
    !allowedMime.includes(detectedMime) ||
    !MIME_EXTENSIONS[detectedMime].includes(extension)
  ) {
    return {
      ok: false,
      error: `File content does not match its type. Use: ${allowedExt.join(", ")}.`,
    };
  }
  return { ok: true, file, extension, detectedMime };
}

export async function uploadFile(params: {
  bucketId: string;
  file: File;
  detectedMime: DetectedImageMime;
  permissions?: string[];
}): Promise<{ fileId: string }> {
  const user = await getLoggedInUser();
  if (!user) {
    throw new Error("You must be signed in to upload.");
  }

  const uploadLimit = await assertDurableRateLimit({
    bucket: "upload.any",
    key: `user:${user.$id}`,
    ...RATE_LIMITS.upload,
  });
  if (!uploadLimit.ok) {
    throw new Error(RATE_LIMIT_MESSAGE);
  }

  let reserved = false;
  try {
    reserved = await reserveStorageQuota(user.$id, params.file.size);
  } catch {
    throw new Error("Unable to verify storage quota. Please try again.");
  }
  if (!reserved) {
    throw new Error("Storage quota exceeded.");
  }

  void params.permissions;
  try {
    return await putStoredFile({
      bucketId: params.bucketId,
      ownerId: user.$id,
      file: params.file,
      fileId: newId(),
      detectedMime: params.detectedMime,
    });
  } catch {
    await releaseStorageQuota(user.$id, params.file.size).catch(() => undefined);
    throw new Error("Upload could not be completed. Please try again.");
  }
}

export async function deleteFile(
  bucketId: string,
  fileId: string,
): Promise<void> {
  const user = await getLoggedInUser();
  if (!user) {
    throw new Error("You must be signed in.");
  }

  const meta = await getStoredFileMeta(fileId);
  if (!meta || meta.bucketId !== bucketId) {
    throw new Error("File not found.");
  }
  if (meta.ownerId !== user.$id) {
    throw new Error("You do not own this file.");
  }

  const deleted = await deleteStoredFile(bucketId, fileId);
  if (deleted) {
    await releaseStorageQuota(meta.ownerId, meta.sizeBytes);
  }
}

export async function deleteFileAsAdmin(
  bucketId: string,
  fileId: string,
): Promise<void> {
  const user = await getLoggedInUser();
  if (!user || !userHasLabel(user, ROLE_LABELS.admin)) {
    throw new Error("Unauthorized");
  }
  const meta = await getStoredFileMeta(fileId);
  if (!meta || meta.bucketId !== bucketId) return;
  const deleted = await deleteStoredFile(bucketId, fileId);
  if (deleted) {
    await releaseStorageQuota(meta.ownerId, meta.sizeBytes);
  }
}

export async function uploadAvatar(file: File): Promise<{ fileId: string }> {
  const validated = await validateUpload({
    file,
    maxBytes: AVATAR_MAX_BYTES,
    allowedMime: IMAGE_MIME_TYPES,
    allowedExt: IMAGE_EXTENSIONS,
  });
  if (!validated.ok) {
    throw new Error(validated.error);
  }
  return uploadFile({
    bucketId: BUCKET_AVATARS,
    file: validated.file,
    detectedMime: validated.detectedMime,
  });
}

export async function uploadProductImage(
  file: File,
): Promise<{ fileId: string }> {
  const validated = await validateUpload({
    file,
    maxBytes: PRODUCT_IMAGE_MAX_BYTES,
    allowedMime: IMAGE_MIME_TYPES,
    allowedExt: IMAGE_EXTENSIONS,
  });
  if (!validated.ok) {
    throw new Error(validated.error);
  }
  return uploadFile({
    bucketId: BUCKET_PRODUCT_IMAGES,
    file: validated.file,
    detectedMime: validated.detectedMime,
  });
}

export async function uploadCategoryImage(
  file: File,
): Promise<{ fileId: string }> {
  const validated = await validateUpload({
    file,
    maxBytes: AVATAR_MAX_BYTES,
    allowedMime: IMAGE_MIME_TYPES,
    allowedExt: IMAGE_EXTENSIONS,
  });
  if (!validated.ok) {
    throw new Error(validated.error);
  }
  return uploadFile({
    bucketId: BUCKET_CATEGORIES,
    file: validated.file,
    detectedMime: validated.detectedMime,
  });
}

export function isStorageDbError(
  error: unknown,
): error is DbException {
  return error instanceof DbException;
}
