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
  return markAllOwnNotificationsReadImpl();
}

export async function markOwnNotificationRead(
  notificationId: string,
): Promise<NotificationActionState> {
  return markOwnNotificationReadImpl(notificationId);
}
