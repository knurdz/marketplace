"use server";

/**
 * Client-callable notification actions for the badge/bell.
 * Create path stays in notifications.ts (admin SDK) and is not exported here.
 *
 * Next.js requires each export in a "use server" file to be an async function
 * declaration — barrel re-exports are rejected at build time.
 */
import {
  countOwnUnread as countOwnUnreadImpl,
  getOwnNotificationFeed as getOwnNotificationFeedImpl,
  listOwnNotifications as listOwnNotificationsImpl,
  markAllOwnNotificationsRead as markAllOwnNotificationsReadImpl,
  markOwnNotificationRead as markOwnNotificationReadImpl,
} from "./notifications";

export async function getOwnNotificationFeed() {
  return getOwnNotificationFeedImpl();
}

export async function listOwnNotifications(opts?: { limit?: number }) {
  return listOwnNotificationsImpl(opts);
}

export async function countOwnUnread() {
  return countOwnUnreadImpl();
}

export async function markAllOwnNotificationsRead() {
  return markAllOwnNotificationsReadImpl();
}

export async function markOwnNotificationRead(notificationId: string) {
  return markOwnNotificationReadImpl(notificationId);
}
