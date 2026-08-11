"use server";

/**
 * Client-callable notification actions for the badge/bell.
 * Create path stays in notifications.ts (admin SDK) and is not exported here.
 */
export {
  getOwnNotificationFeed,
  listOwnNotifications,
  countOwnUnread,
  markAllOwnNotificationsRead,
  markOwnNotificationRead,
} from "./notifications";
