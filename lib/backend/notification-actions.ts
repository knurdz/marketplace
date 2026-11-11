"use server";

/**
 * Client-callable notification actions for the badge/bell.
 * Create path stays in notifications.ts (admin SDK) and is not exported here.
 * Next.js requires direct async exports in "use server" files (no re-exports).
 */

import {
  countOwnUnread as countOwnUnreadImpl,
  getOwnNotificationFeed as getOwnNotificationFeedImpl,
  listOwnNotifications as listOwnNotificationsImpl,
  markAllOwnNotificationsRead as markAllOwnNotificationsReadImpl,
  markOwnNotificationRead as markOwnNotificationReadImpl,
  type NotificationActionState,
} from "./notifications";
import type { Notification } from "@/lib/types";
import { getLoggedInUser } from "./session";
import {
  assertRateLimit,
  RATE_LIMIT_MESSAGE,
  RATE_LIMITS,
} from "@/lib/security/rate-limit";

async function notificationMutationAllowed(): Promise<boolean> {
  const user = await getLoggedInUser();
  if (!user) return false;
  const rate = await assertRateLimit({
    bucket: "account.notifications",
    key: `user:${user.$id}`,
    ...RATE_LIMITS.accountMutations,
  });
  return rate.ok;
}

export async function getOwnNotificationFeed(): Promise<{
  unread: number;
  items: Notification[];
}> {
  return getOwnNotificationFeedImpl();
}

export async function listOwnNotifications(options?: {
  limit?: number;
}): Promise<Notification[]> {
  return listOwnNotificationsImpl(options);
}

export async function countOwnUnread(): Promise<number> {
  return countOwnUnreadImpl();
}

export async function markAllOwnNotificationsRead(): Promise<NotificationActionState> {
  if (!(await notificationMutationAllowed())) {
    return { error: RATE_LIMIT_MESSAGE };
  }
  return markAllOwnNotificationsReadImpl();
}

export async function markOwnNotificationRead(
  notificationId: string,
): Promise<NotificationActionState> {
  if (!(await notificationMutationAllowed())) {
    return { error: RATE_LIMIT_MESSAGE };
  }
  return markOwnNotificationReadImpl(notificationId);
}
