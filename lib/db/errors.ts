/** Error shape services already branch on (`code` 404 / 409). */
export class AppwriteException extends Error {
  code: number;
  type?: string;

  constructor(message: string, code: number, type?: string) {
    super(message);
    this.name = "AppwriteException";
    this.code = code;
    this.type = type;
  }
}

/** Drizzle wraps driver errors, so check the error and its `cause`. */
export function isDuplicateKeyError(error: unknown): boolean {
  let current: unknown = error;
  for (let depth = 0; depth < 3 && current; depth++) {
    if (
      typeof current === "object" &&
      (current as { code?: unknown }).code === "ER_DUP_ENTRY"
    ) {
      return true;
    }
    current = (current as { cause?: unknown }).cause;
  }
  return false;
}
