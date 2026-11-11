import { eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { storageQuotas } from "@/lib/db/schema";

const MAX_FILES_PER_USER = 100;
const MAX_BYTES_PER_USER = 250 * 1024 * 1024;

export async function reserveStorageQuota(
  ownerId: string,
  sizeBytes: number,
): Promise<boolean> {
  return getDb().transaction(async (tx) => {
    await tx
      .insert(storageQuotas)
      .values({ ownerId, fileCount: 0, totalBytes: 0 })
      .onDuplicateKeyUpdate({
        set: { ownerId: sql`${storageQuotas.ownerId}` },
      });
    const [quota] = await tx
      .select()
      .from(storageQuotas)
      .where(eq(storageQuotas.ownerId, ownerId))
      .limit(1)
      .for("update");
    if (
      !quota ||
      quota.fileCount >= MAX_FILES_PER_USER ||
      quota.totalBytes + sizeBytes > MAX_BYTES_PER_USER
    ) {
      return false;
    }
    await tx
      .update(storageQuotas)
      .set({
        fileCount: quota.fileCount + 1,
        totalBytes: quota.totalBytes + sizeBytes,
      })
      .where(eq(storageQuotas.ownerId, ownerId));
    return true;
  });
}

export async function releaseStorageQuota(
  ownerId: string,
  sizeBytes: number,
): Promise<void> {
  await getDb()
    .update(storageQuotas)
    .set({
      fileCount: sql`greatest(${storageQuotas.fileCount} - 1, 0)`,
      totalBytes: sql`greatest(${storageQuotas.totalBytes} - ${sizeBytes}, 0)`,
    })
    .where(eq(storageQuotas.ownerId, ownerId));
}
