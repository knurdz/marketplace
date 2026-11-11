/**
 * Notifications contract for Members 2–4.
 * Core: lib/backend/notifications.ts
 * Client actions (bell): lib/backend/notification-actions.ts
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
} from "@/lib/backend/notifications";
export type { NotificationActionState } from "@/lib/backend/notifications";
