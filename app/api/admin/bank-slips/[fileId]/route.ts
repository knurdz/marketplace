import { NextResponse } from "next/server";
import { BUCKET_BANK_SLIPS } from "@/lib/appwrite/config";
import { createAdminClient } from "@/lib/appwrite/server";
import { getLoggedInUser } from "@/lib/appwrite/session";
import { userCanAccessBankSlipFile } from "@/lib/services/bank-slip-review";

type RouteParams = {
  params: Promise<{ fileId: string }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  const user = await getLoggedInUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fileId: rawFileId } = await params;
  const fileId = rawFileId?.trim();
  if (!fileId) {
    return NextResponse.json({ error: "Missing file id." }, { status: 400 });
  }

  const allowed = await userCanAccessBankSlipFile(user, fileId);
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { storage } = await createAdminClient();
    const [meta, bytes] = await Promise.all([
      storage.getFile({ bucketId: BUCKET_BANK_SLIPS, fileId }),
      storage.getFileView({ bucketId: BUCKET_BANK_SLIPS, fileId }),
    ]);

    const mimeType =
      typeof meta.mimeType === "string" && meta.mimeType.length > 0
        ? meta.mimeType
        : "application/octet-stream";

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "private, no-store",
        "Content-Disposition": `inline; filename="${meta.name || "bank-slip"}"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Could not retrieve bank slip file." },
      { status: 500 },
    );
  }
}
