"use client";

import { Bell } from "lucide-react";
import type { Notification } from "@/lib/types";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import {
  NOTIFICATION_POLL_MS,
  NotificationFeedList,
  useNotificationFeed,
} from "@/components/notifications/notification-feed";

type NotificationInboxProps = {
  initialUnread: number;
  initialItems: Notification[];
};

export function NotificationInbox({
  initialUnread,
  initialItems,
}: NotificationInboxProps) {
  const { unread, items, pending, onMarkAll, onItemActivate } =
    useNotificationFeed({ unread: initialUnread, items: initialItems });

  return (
    <div className="space-y-4">
      {unread > 0 ? (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={pending}
            onClick={onMarkAll}
          >
            Mark all read
          </Button>
        </div>
      ) : null}

      {items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="You're all caught up"
          description="When something needs your attention, it will show up here."
        />
      ) : (
        <NotificationFeedList
          variant="page"
          items={items}
          pending={pending}
          onItemActivate={(n) => onItemActivate(n)}
        />
      )}

      <p className="text-center text-xs text-muted-foreground">
        Updates every {Math.round(NOTIFICATION_POLL_MS / 1000)}s
        {pending ? " · refreshing…" : null}
      </p>
    </div>
  );
}
