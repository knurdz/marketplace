/**
 * Notifications contract for Members 2–4.
 * Core: lib/appwrite/notifications.ts
 * Client actions (bell): lib/appwrite/notification-actions.ts
 */
export {
  asNotification,
  countOwnUnread,
  createNotificationForUser,
  getOwnNotificationFeed,
  listOwnNotifications,
  markAllOwnNotificationsRead,
  markOwnNotificationRead,
  safeNotificationLink,
} from "@/lib/appwrite/notifications";
export type { NotificationActionState } from "@/lib/appwrite/notifications";
