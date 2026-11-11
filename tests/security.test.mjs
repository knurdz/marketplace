import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import {
  detectImageMimeType,
} from "../lib/security/file-signature.ts";
import { isSafeFileId } from "../lib/security/storage-id.ts";
import { verifyFormGuard } from "../lib/security/bot-guard.ts";

test("image signatures detect supported formats and reject spoofed data", () => {
  assert.equal(
    detectImageMimeType(Uint8Array.from([0xff, 0xd8, 0xff, 0xe0])),
    "image/jpeg",
  );
  assert.equal(
    detectImageMimeType(
      Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    ),
    "image/png",
  );
  assert.equal(
    detectImageMimeType(
      Uint8Array.from([
        0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50,
      ]),
    ),
    "image/webp",
  );
  assert.equal(detectImageMimeType(new TextEncoder().encode("<svg>")), null);
});

test("storage identifiers reject traversal and encoded separators", () => {
  assert.equal(isSafeFileId("123e4567-e89b-12d3-a456-426614174000"), true);
  for (const value of ["../package.json", "a/bbbbbbb", "..%2Fsecret", "short"]) {
    assert.equal(isSafeFileId(value), false);
  }
});

test("form guard accepts a signed mature token and rejects honeypots", async () => {
  process.env.FORM_GUARD_SECRET = "test-form-guard-secret";
  const action = "auth.login";
  const issuedAt = Date.now() - 3_000;
  const payload = `${issuedAt}.${action}`;
  const signature = createHmac("sha256", process.env.FORM_GUARD_SECRET)
    .update(payload)
    .digest("base64url");
  const form = new FormData();
  form.set("_fg", `${payload}.${signature}`);
  assert.deepEqual(await verifyFormGuard(form, action), { ok: true });

  form.set("company_website", "https://bot.example");
  assert.deepEqual(await verifyFormGuard(form, action), {
    ok: false,
    reason: "honeypot",
  });
});
