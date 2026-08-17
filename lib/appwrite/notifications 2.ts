import { AppwriteException, ID, Permission, Query, Role } from "node-appwrite";
import { DATABASE_ID, TABLE_NOTIFICATIONS } from "./config";
import { createAdminClient, createSessionClient } from "./server";
import { getLoggedInUser } from "./session";
import type { Notification } from "@/lib/types";

/** Only allow same-origin relative paths (blocks open redirects). */
export function safeNotificationLink(
  raw: string | null | undefined,
): string | null {
  if (raw == null) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.includes("://")
  ) {
    return null;
  }
  return trimmed.slice(0, 500);
}

function asNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return value.length > 0 ? value : null;
}

/** Map a TablesDB row to Notification; returns null if required fields invalid. */
export function asNotification(
  row: Record<string, unknown>,
): Notification | null {
  const $id = asNullableString(row.$id);
  const userId = asNullableString(row.userId);
  const type = asNullableString(row.type);
  const title = asNullableString(row.title);
  const body = asNullableString(row.body);
  if (!$id || !userId || !type || !title || body === null) {
    return null;
  }

  return {
    $id,
    userId,
    type: type.slice(0, 64),
    title: title.slice(0, 200),
    body: body.slice(0, 2000),
    read: typeof row.read === "boolean" ? row.read : false,
    link: safeNotificationLink(asNullableString(row.link)),
    meta: asNullableString(row.meta),
    $createdAt:
      typeof row.$createdAt === "string" ? row.$createdAt : undefined,
  };
}

function notificationPermissions(userId: string): string[] {
  return [
    Permission.read(Role.user(userId)),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId)),
    Permission.read(Role.label("admin")),
    Permission.update(Role.label("admin")),
    Permission.delete(Role.label("admin")),
  ];
}

/**
 * System/admin create path for other members + seed helpers.
 * Sets row ACL to the target user (+ admin). Not exposed as a server action.
 */
export async function createNotificationForUser(params: {
  userId: string;
  type: string;
  title: string;
  body: string;
  link?: string | null;
  meta?: string | null;
  rowId?: string;
}): Promise<Notification> {
  const userId = params.userId.trim();
  const type = params.type.trim().slice(0, 64);
  const title = params.title.trim().slice(0, 200);
  const body = params.body.trim().slice(0, 2000);
  if (!userId || !type || !title || !body) {
    throw new Error("userId, type, title, and body are required.");
  }

  const link = safeNotificationLink(params.link ?? null);
  const meta =
    typeof params.meta === "string" && params.meta.length > 0
      ? params.meta.slice(0, 4000)
      : null;

  const { tables } = await createAdminClient();
  const row = await tables.createRow({
    databaseId: DATABASE_ID,
    tableId: TABLE_NOTIFICATIONS,
    rowId: params.rowId?.trim() || ID.unique(),
    data: {
      userId,
      type,
      title,
      body,
      read: false,
      link,
      meta,
    },
    permissions: notificationPermissions(userId),
  });

  const mapped = asNotification(row as unknown as Record<string, unknown>);
  if (!mapped) {
    throw new Error("Failed to map created notification.");
  }
  return mapped;
}

/** Newest-first list for the signed-in user only. */
export async function listOwnNotifications(opts?: {
  limit?: number;
}): Promise<Notification[]> {
  const user = await getLoggedInUser();
  if (!user) return [];

  const limit = Math.min(Math.max(opts?.limit ?? 20, 1), 20);

  try {
    const { tables } = await createSessionClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_NOTIFICATIONS,
      queries: [
        Query.equal("userId", user.$id),
        Query.orderDesc("$createdAt"),
        Query.limit(limit),
      ],
    });

    const out: Notification[] = [];
    for (const row of result.rows) {
      const n = asNotification(row as unknown as Record<string, unknown>);
      if (n && n.userId === user.$id) {
        out.push(n);
      }
    }
    return out;
  } catch {
    return [];
  }
}

/** Unread count for the signed-in user (uses user_read_idx). */
export async function countOwnUnread(): Promise<number> {
  const user = await getLoggedInUser();
  if (!user) return 0;

  try {
    const { tables } = await createSessionClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_NOTIFICATIONS,
      queries: [
        Query.equal("userId", user.$id),
        Query.equal("read", false),
        Query.limit(1),
      ],
    });
    return typeof result.total === "number" ? result.total : 0;
  } catch {
    return 0;
  }
}

export type NotificationActionState = {
  error?: string;
  success?: string;
};

/** Mark one own notification read. IDOR-safe. */
export async function markOwnNotificationRead(
  notificationId: string,
): Promise<NotificationActionState> {
  const user = await getLoggedInUser();
  if (!user) {
    return { error: "You must be signed in." };
  }

  const id = notificationId?.trim();
  if (!id) {
    return { error: "Notification id is required." };
  }

  try {
    const { tables } = await createSessionClient();
    const row = await tables.getRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_NOTIFICATIONS,
      rowId: id,
    });
    const existing = asNotification(row as unknown as Record<string, unknown>);
    if (!existing || existing.userId !== user.$id) {
      return { error: "Not allowed to update this notification." };
    }
    if (existing.read) {
      return { success: "Already read." };
    }

    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_NOTIFICATIONS,
      rowId: id,
      data: { read: true, userId: user.$id },
    });
    return { success: "Marked as read." };
  } catch (error) {
    if (error instanceof AppwriteException) {
      if (error.code === 401 || error.code === 404) {
        return { error: "Not allowed to update this notification." };
      }
    }
    return { error: "Could not update notification." };
  }
}

/** Mark all own unread notifications as read. */
export async function markAllOwnNotificationsRead(): Promise<NotificationActionState> {
  const user = await getLoggedInUser();
  if (!user) {
    return { error: "You must be signed in." };
  }

  try {
    const { tables } = await createSessionClient();
    let updated = 0;
    for (let i = 0; i < 10; i++) {
      const result = await tables.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLE_NOTIFICATIONS,
        queries: [
          Query.equal("userId", user.$id),
          Query.equal("read", false),
          Query.limit(25),
        ],
      });
      if (result.rows.length === 0) break;

      for (const row of result.rows) {
        const n = asNotification(row as unknown as Record<string, unknown>);
        if (!n || n.userId !== user.$id) continue;
        await tables.updateRow({
          databaseId: DATABASE_ID,
          tableId: TABLE_NOTIFICATIONS,
          rowId: n.$id,
          data: { read: true, userId: user.$id },
        });
        updated += 1;
      }
    }
    return {
      success:
        updated > 0
          ? "All notifications marked as read."
          : "Nothing to update.",
    };
  } catch {
    return { error: "Could not mark notifications as read." };
  }
}

/** Bell poll payload: unread count + recent list. */
export async function getOwnNotificationFeed(): Promise<{
  unread: number;
  items: Notification[];
}> {
  const [unread, items] = await Promise.all([
    countOwnUnread(),
    listOwnNotifications({ limit: 20 }),
  ]);
  return { unread, items };
}
