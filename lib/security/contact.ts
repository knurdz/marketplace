const PHONE_ALLOWED = /^[+\d][\d\s()-]*$/;
const EMAIL_ADDRESS = /^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/;

/** Registration/profile phone policy: 8–15 digits and safe punctuation only. */
export function isValidPhone(phone: string): boolean {
  const normalized = phone.trim();
  if (!PHONE_ALLOWED.test(normalized)) return false;
  const digits = normalized.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

export function normalizePhone(phone: string): string | null {
  const normalized = phone.trim();
  return isValidPhone(normalized) ? normalized : null;
}

/** URI-safe phone target containing only an optional leading + and digits. */
export function phoneHref(
  phone: string | null | undefined,
): string | undefined {
  if (!phone) return undefined;
  const normalized = normalizePhone(phone);
  if (!normalized) return undefined;
  const digits = normalized.replace(/\D/g, "");
  return `tel:${normalized.startsWith("+") ? "+" : ""}${digits}`;
}

/** Validated mailto target with control characters and URI delimiters rejected. */
export function emailHref(
  email: string | null | undefined,
): string | undefined {
  if (!email) return undefined;
  const normalized = email.trim().toLowerCase();
  if (!EMAIL_ADDRESS.test(normalized) || /[%?&#:]/.test(normalized)) {
    return undefined;
  }
  return `mailto:${normalized}`;
}
