import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BuyerAccountShell } from "@/components/store/buyer-account-shell";
import { NotificationInbox } from "@/components/notifications/notification-inbox";
import { getLoggedInUser } from "@/lib/backend/session";
import { buildNoIndexMetadata } from "@/lib/seo/metadata";
import { getOwnNotificationFeed } from "@/lib/services";

export const metadata: Metadata = buildNoIndexMetadata(
  "Notifications",
  "Updates about your account, requests, and marketplace activity.",
);

export default async function NotificationsPage() {
  const user = await getLoggedInUser();
  if (!user) {
    redirect("/login?next=/notifications");
  }

  const feed = await getOwnNotificationFeed();

  return (
    <BuyerAccountShell
      title="Notifications"
      description="Order updates, seller replies, and account alerts."
    >
      <NotificationInbox initialUnread={feed.unread} initialItems={feed.items} />
    </BuyerAccountShell>
  );
}
