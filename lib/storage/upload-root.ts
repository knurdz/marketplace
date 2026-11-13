import path from "node:path";

/**
 * Persistent file root on Hostinger (outside the deploy tree).
 * Dev defaults to ./uploads when UPLOAD_DIR is unset.
 */
export function getUploadRoot(): string {
  const configured = process.env.UPLOAD_DIR?.trim();
  if (configured) {
    const resolved = path.resolve(configured);
    if (process.env.NODE_ENV === "production" && !path.isAbsolute(resolved)) {
      throw new Error("UPLOAD_DIR must be an absolute path in production.");
    }
    return resolved;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "UPLOAD_DIR is required in production (absolute path outside the app deploy folder).",
    );
  }
  return path.join(process.cwd(), "uploads");
}
