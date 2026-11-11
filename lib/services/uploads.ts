/**
 * Upload contract for Members 2–4.
 * Implementations live in lib/backend/storage.ts (server-only).
 */
export {
  deleteFile,
  uploadAvatar,
  uploadCategoryImage,
  uploadFile,
  uploadProductImage,
  validateUpload,
} from "@/lib/backend/storage";
export type {
  UploadValidationError,
  UploadValidationOk,
  UploadValidationResult,
} from "@/lib/backend/storage";
