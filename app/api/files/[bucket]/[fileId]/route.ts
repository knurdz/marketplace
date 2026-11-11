import { NextResponse } from "next/server";
import {
  BUCKET_AVATARS,
  BUCKET_PRODUCT_IMAGES,
  IMAGE_MIME_TYPES,
} from "@/lib/backend/config";
import { readStoredFile } from "@/lib/storage/disk";
import {
  assertRateLimit,
  getClientIp,
  RATE_LIMITS,
} from "@/lib/security/rate-limit";

const PUBLIC_BUCKETS = new Set([BUCKET_AVATARS, BUCKET_PRODUCT_IMAGES]);

export async function GET(
  _request: Request,
  context: { params: Promise<{ bucket: string; fileId: string }> },
) {
  const { bucket, fileId } = await context.params;
  if (!PUBLIC_BUCKETS.has(bucket)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ip = await getClientIp();
  const rate = await assertRateLimit({
    bucket: "public.files",
    key: `ip:${ip}`,
    limit: RATE_LIMITS.publicReads.limit * 2,
    windowMs: RATE_LIMITS.publicReads.windowMs,
  });
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Too many requests." },
      {
        status: 429,
        headers: { "Retry-After": String(rate.retryAfterSec) },
      },
    );
  }

  const file = await readStoredFile(bucket, fileId);
  if (!file) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (
    !IMAGE_MIME_TYPES.includes(
      file.mimeType as (typeof IMAGE_MIME_TYPES)[number],
    )
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const chunks: Buffer[] = [];
  for await (const chunk of file.stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return new NextResponse(Buffer.concat(chunks), {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Disposition": 'inline; filename="image"',
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
