import { AppwriteException, ID, Permission, Role } from "node-appwrite";
import { InputFile } from "node-appwrite/file";
import {
  assertRateLimit,
  RATE_LIMIT_MESSAGE,
  RATE_LIMITS,
} from "@/lib/security/rate-limit";
import {
  AVATAR_MAX_BYTES,
  BANK_SLIP_EXTENSIONS,
  BANK_SLIP_MAX_BYTES,
  BANK_SLIP_MIME_TYPES,
  BUCKET_AVATARS,
  BUCKET_BANK_SLIPS,
  BUCKET_PRODUCT_IMAGES,
  IMAGE_EXTENSIONS,
  IMAGE_MIME_TYPES,
  PRODUCT_IMAGE_MAX_BYTES,
} from "./config";
import { createAdminClient, createSessionClient } from "./server";
import { getLoggedInUser } from "./session";

export type UploadValidationError = {
  ok: false;
  error: string;
};

export type UploadValidationOk = {
  ok: true;
  file: File;
  extension: string;
};

export type UploadValidationResult = UploadValidationError | UploadValidationOk;

function extensionOf(filename: string): string {
  const parts = filename.toLowerCase().split(".");
  if (parts.length < 2) return "";
  return parts[parts.length - 1] ?? "";
}

/**
 * Validate a FormData File before upload (size, mime, extension).
 * Rejects empty/missing files and mismatched extension vs allowlist.
 */
export function validateUpload(params: {
  file: FormDataEntryValue | null;
  maxBytes: number;
  allowedMime: readonly string[];
  allowedExt: readonly string[];
}): UploadValidationResult {
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
  return { ok: true, file, extension };
}

async function toInputFile(file: File): Promise<InputFile> {
  const buffer = new Uint8Array(await file.arrayBuffer());
  return InputFile.fromBuffer(buffer, file.name);
}

/**
 * Upload with the signed-in user's session. Caller supplies file-level permissions.
 */
export async function uploadFile(params: {
  bucketId: string;
  file: File;
  permissions: string[];
}): Promise<{ fileId: string }> {
  const user = await getLoggedInUser();
  if (!user) {
    throw new Error("You must be signed in to upload.");
  }

  const uploadLimit = assertRateLimit({
    bucket: "upload.any",
    key: `user:${user.$id}`,
    ...RATE_LIMITS.upload,
  });
  if (!uploadLimit.ok) {
    throw new Error(RATE_LIMIT_MESSAGE);
  }

  const { storage } = await createSessionClient();
  const input = await toInputFile(params.file);
  const created = await storage.createFile({
    bucketId: params.bucketId,
    fileId: ID.unique(),
    file: input,
    permissions: params.permissions,
  });
  return { fileId: created.$id };
}

/** Delete a file as the session user (must have delete permission on the file). */
export async function deleteFile(
  bucketId: string,
  fileId: string,
): Promise<void> {
  const { storage } = await createSessionClient();
  await storage.deleteFile({ bucketId, fileId });
}

/** Admin delete (e.g. cleanup orphan after failed profile update). */
export async function deleteFileAsAdmin(
  bucketId: string,
  fileId: string,
): Promise<void> {
  const { storage } = await createAdminClient();
  await storage.deleteFile({ bucketId, fileId });
}

function publicImagePermissions(userId: string): string[] {
  return [
    Permission.read(Role.any()),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId)),
  ];
}

/** Private bank slip — never grant read(any). */
function bankSlipPermissions(userId: string): string[] {
  return [
    Permission.read(Role.user(userId)),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId)),
    Permission.read(Role.label("admin")),
    Permission.update(Role.label("admin")),
    Permission.delete(Role.label("admin")),
  ];
}

export async function uploadAvatar(file: File): Promise<{ fileId: string }> {
  const user = await getLoggedInUser();
  if (!user) {
    throw new Error("You must be signed in to upload an avatar.");
  }
  const validated = validateUpload({
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
    permissions: publicImagePermissions(user.$id),
  });
}

export async function uploadProductImage(
  file: File,
): Promise<{ fileId: string }> {
  const user = await getLoggedInUser();
  if (!user) {
    throw new Error("You must be signed in to upload a product image.");
  }
  const validated = validateUpload({
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
    permissions: publicImagePermissions(user.$id),
  });
}

export async function uploadBankSlip(file: File): Promise<{ fileId: string }> {
  const user = await getLoggedInUser();
  if (!user) {
    throw new Error("You must be signed in to upload a bank slip.");
  }
  const validated = validateUpload({
    file,
    maxBytes: BANK_SLIP_MAX_BYTES,
    allowedMime: BANK_SLIP_MIME_TYPES,
    allowedExt: BANK_SLIP_EXTENSIONS,
  });
  if (!validated.ok) {
    throw new Error(validated.error);
  }
  const perms = bankSlipPermissions(user.$id);
  // Defense: never allow public read on bank slips.
  if (perms.some((p) => p.includes("any"))) {
    throw new Error("Refusing to upload bank slip with public permissions.");
  }
  return uploadFile({
    bucketId: BUCKET_BANK_SLIPS,
    file: validated.file,
    permissions: perms,
  });
}

export function isAppwriteStorageError(
  error: unknown,
): error is AppwriteException {
  return error instanceof AppwriteException;
}
