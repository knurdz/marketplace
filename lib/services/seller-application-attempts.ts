import { desc, eq } from "drizzle-orm";
import { getDb, newId } from "@/lib/db/client";
import { sellerApplicationAttempts } from "@/lib/db/schema";
import { assertAdminUser } from "@/lib/security/admin-auth";

export type SellerApplicationAttempt = {
  id: string;
  sellerProfileId: string;
  userId: string;
  shopName: string;
  slug: string;
  bio: string | null;
  rejectionReason: string | null;
  submittedAt: string;
  rejectedAt: string;
};

function toIso(value: Date | null | undefined): string {
  if (!value) return new Date().toISOString();
  return value.toISOString();
}

function parseSubmittedAt(row: Record<string, unknown>): Date {
  const created = row.$createdAt;
  const updated = row.$updatedAt;
  if (typeof updated === "string") {
    const d = new Date(updated);
    if (!Number.isNaN(d.getTime())) return d;
  }
  if (typeof created === "string") {
    const d = new Date(created);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date();
}

/** Record a rejected application snapshot (admin reject or resubmit archive). */
export async function recordSellerApplicationRejectionAttempt(input: {
  sellerProfileId: string;
  userId: string;
  shopName: string;
  slug: string;
  bio: string | null;
  rejectionReason: string | null;
  profileRow: Record<string, unknown>;
  rejectedAt?: Date;
}): Promise<void> {
  const submittedAt = parseSubmittedAt(input.profileRow);
  const rejectedAt = input.rejectedAt ?? new Date();

  await getDb()
    .insert(sellerApplicationAttempts)
    .values({
      id: newId(),
      sellerProfileId: input.sellerProfileId,
      userId: input.userId,
      shopName: input.shopName,
      slug: input.slug,
      bio: input.bio,
      rejectionReason: input.rejectionReason,
      submittedAt,
      rejectedAt,
    });
}

export async function listSellerApplicationAttemptsForProfile(
  sellerProfileId: string,
): Promise<SellerApplicationAttempt[]> {
  await assertAdminUser();
  const trimmed = sellerProfileId.trim();
  if (!trimmed) return [];

  try {
    const rows = await getDb()
      .select()
      .from(sellerApplicationAttempts)
      .where(eq(sellerApplicationAttempts.sellerProfileId, trimmed))
      .orderBy(desc(sellerApplicationAttempts.rejectedAt))
      .limit(50);

    return rows.map((row) => ({
      id: row.id,
      sellerProfileId: row.sellerProfileId,
      userId: row.userId,
      shopName: row.shopName,
      slug: row.slug,
      bio: row.bio,
      rejectionReason: row.rejectionReason,
      submittedAt: toIso(row.submittedAt),
      rejectedAt: toIso(row.rejectedAt),
    }));
  } catch {
    return [];
  }
}
