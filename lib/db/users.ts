import { and, desc, eq, gt } from "drizzle-orm";
import { ROLE_LABELS, type RoleLabel } from "@/lib/appwrite/roles";
import { getDb } from "./client";
import { authSession, authUser } from "./schema";

export type MarketplaceUser = {
  $id: string;
  email: string;
  name: string;
  /** Provider profile photo (Google/GitHub) stored by Better Auth. */
  image: string | null;
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
  image?: string | null;
  role: string;
  disabled: boolean;
  emailVerified: boolean;
  createdAt?: Date;
}): MarketplaceUser {
  const image = row.image?.trim();
  return {
    $id: row.id,
    email: row.email,
    name: row.name,
    image: image ? image : null,
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
    let role: RoleLabel | null = null;
    for (const q of params.queries ?? []) {
      try {
        const d = JSON.parse(q) as {
          type: string;
          value?: number | string;
          attribute?: string;
        };
        if (d.type === "limit" && typeof d.value === "number") limit = d.value;
        if (d.type === "cursorAfter" && typeof d.value === "string") {
          cursor = d.value;
        }
        if (d.type === "equal" && d.attribute === "role") {
          const raw = Array.isArray(d.value) ? d.value[0] : d.value;
          if (
            raw === ROLE_LABELS.buyer ||
            raw === ROLE_LABELS.seller ||
            raw === ROLE_LABELS.admin
          ) {
            role = raw;
          }
        }
      } catch {
        // ignore
      }
    }

    const conditions = [];
    if (role) conditions.push(eq(authUser.role, role));
    if (cursor) conditions.push(gt(authUser.id, cursor));

    let query = db.select().from(authUser).orderBy(desc(authUser.createdAt)).$dynamic();
    if (conditions.length === 1) {
      query = query.where(conditions[0]!);
    } else if (conditions.length > 1) {
      query = query.where(and(...conditions));
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
