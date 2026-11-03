import { desc, eq, gt } from "drizzle-orm";
import { ROLE_LABELS, type RoleLabel } from "@/lib/appwrite/roles";
import { getDb } from "./client";
import { authSession, authUser } from "./schema";

export type MarketplaceUser = {
  $id: string;
  email: string;
  name: string;
  labels: string[];
  status: boolean;
  emailVerification: boolean;
  $createdAt?: string;
  registration?: string;
};

function roleToLabels(role: string): string[] {
  if (role === ROLE_LABELS.seller) return [ROLE_LABELS.seller];
  if (role === ROLE_LABELS.admin) return [ROLE_LABELS.admin];
  return [ROLE_LABELS.buyer];
}

export function rowToMarketplaceUser(row: {
  id: string;
  email: string;
  name: string;
  role: string;
  disabled: boolean;
  emailVerified: boolean;
  createdAt?: Date;
}): MarketplaceUser {
  return {
    $id: row.id,
    email: row.email,
    name: row.name,
    labels: roleToLabels(row.role),
    status: !row.disabled,
    emailVerification: row.emailVerified,
    $createdAt: row.createdAt?.toISOString(),
    registration: row.createdAt?.toISOString(),
  };
}

export class UsersApi {
  async get(params: { userId: string }): Promise<MarketplaceUser> {
    const db = getDb();
    const rows = await db
      .select()
      .from(authUser)
      .where(eq(authUser.id, params.userId))
      .limit(1);
    const row = rows[0];
    if (!row) {
      throw new Error("User not found");
    }
    return rowToMarketplaceUser(row);
  }

  async list(params: {
    queries?: string[];
    total?: boolean;
    search?: string;
  }): Promise<{ users: MarketplaceUser[]; total: number }> {
    const db = getDb();
    let limit = 25;
    let cursor: string | null = null;
    for (const q of params.queries ?? []) {
      try {
        const d = JSON.parse(q) as { type: string; value?: number | string };
        if (d.type === "limit" && typeof d.value === "number") limit = d.value;
        if (d.type === "cursorAfter" && typeof d.value === "string") {
          cursor = d.value;
        }
      } catch {
        // ignore
      }
    }

    let query = db.select().from(authUser).orderBy(desc(authUser.createdAt)).$dynamic();
    if (cursor) {
      query = query.where(gt(authUser.id, cursor));
    }
    const rows = await query.limit(limit);
    const users = rows.map((row) => rowToMarketplaceUser(row));
    return { users, total: users.length };
  }

  async updateLabels(params: { userId: string; labels: string[] }) {
    const db = getDb();
    const label = params.labels[0] as RoleLabel | undefined;
    const role =
      label === ROLE_LABELS.admin
        ? ROLE_LABELS.admin
        : label === ROLE_LABELS.seller
          ? ROLE_LABELS.seller
          : ROLE_LABELS.buyer;
    await db
      .update(authUser)
      .set({ role })
      .where(eq(authUser.id, params.userId));
  }

  async updateStatus(params: { userId: string; status: boolean }) {
    const db = getDb();
    await db
      .update(authUser)
      .set({ disabled: !params.status })
      .where(eq(authUser.id, params.userId));
  }

  async deleteSessions(params: { userId: string }) {
    const db = getDb();
    await db
      .delete(authSession)
      .where(eq(authSession.userId, params.userId));
  }

  async delete(params: { userId: string }) {
    const db = getDb();
    await db.delete(authUser).where(eq(authUser.id, params.userId));
  }
}
