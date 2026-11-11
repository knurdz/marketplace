"use server";

import { createHmac, timingSafeEqual } from "node:crypto";

const MIN_FORM_AGE_MS = 2_000;
const MAX_FORM_AGE_MS = 2 * 60 * 60 * 1_000;

function secret(): string {
  const value =
    process.env.FORM_GUARD_SECRET?.trim() ||
    (process.env.NODE_ENV !== "production"
      ? process.env.BETTER_AUTH_SECRET?.trim()
      : "");
  if (!value) throw new Error("FORM_GUARD_SECRET is required.");
  return value;
}

function signature(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export async function issueFormGuardToken(action: string): Promise<string> {
  const safeAction = action.trim().slice(0, 80);
  if (!safeAction || !/^[a-z0-9._-]+$/i.test(safeAction)) {
    throw new Error("Invalid form action.");
  }
  const issuedAt = Date.now();
  const payload = `${issuedAt}.${safeAction}`;
  return `${payload}.${signature(payload)}`;
}

export type FormGuardResult =
  | { ok: true }
  | { ok: false; reason: "honeypot" | "invalid" | "too_fast" | "expired" };

export async function verifyFormGuard(
  formData: FormData,
  action: string,
): Promise<FormGuardResult> {
  const honeypot = formData.get("company_website");
  if (typeof honeypot === "string" && honeypot.trim()) {
    return { ok: false, reason: "honeypot" };
  }

  const token = formData.get("_fg");
  if (typeof token !== "string") return { ok: false, reason: "invalid" };
  const parts = token.split(".");
  const issuedRaw = parts.shift();
  const suppliedSignature = parts.pop();
  const tokenAction = parts.join(".");
  if (
    tokenAction !== action ||
    !issuedRaw ||
    !suppliedSignature
  ) {
    return { ok: false, reason: "invalid" };
  }

  const expected = signature(`${issuedRaw}.${tokenAction}`);
  const supplied = Buffer.from(suppliedSignature);
  const expectedBuffer = Buffer.from(expected);
  if (
    supplied.length !== expectedBuffer.length ||
    !timingSafeEqual(supplied, expectedBuffer)
  ) {
    return { ok: false, reason: "invalid" };
  }

  const age = Date.now() - Number(issuedRaw);
  if (!Number.isFinite(age) || age < 0) {
    return { ok: false, reason: "invalid" };
  }
  if (age < MIN_FORM_AGE_MS) return { ok: false, reason: "too_fast" };
  if (age > MAX_FORM_AGE_MS) return { ok: false, reason: "expired" };
  return { ok: true };
}
