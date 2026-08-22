/**
 * Upload contract for Members 2–4.
 * Implementations live in lib/appwrite/storage.ts (server-only).
 */
export {
  deleteFile,
  uploadAvatar,
  uploadBankSlip,
  uploadFile,
  uploadProductImage,
  validateUpload,
} from "@/lib/appwrite/storage";
export type {
  UploadValidationError,
  UploadValidationOk,
  UploadValidationResult,
} from "@/lib/appwrite/storage";
