import { NextResponse } from "next/server";
import {
  BUCKET_AVATARS,
  BUCKET_BANK_SLIPS,
  BUCKET_PRODUCT_IMAGES,
} from "@/lib/appwrite/config";
import { readStoredFile } from "@/lib/storage/disk";

const PUBLIC_BUCKETS = new Set([BUCKET_AVATARS, BUCKET_PRODUCT_IMAGES]);

export async function GET(
  _request: Request,
  context: { params: Promise<{ bucket: string; fileId: string }> },
) {
  const { bucket, fileId } = await context.params;
  if (!PUBLIC_BUCKETS.has(bucket)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (bucket === BUCKET_BANK_SLIPS) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const file = await readStoredFile(bucket, fileId);
  if (!file) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const chunks: Buffer[] = [];
  for await (const chunk of file.stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return new NextResponse(Buffer.concat(chunks), {
    headers: {
      "Content-Type": file.mimeType,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
