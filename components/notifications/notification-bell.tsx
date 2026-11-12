"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  NOTIFICATION_POLL_MS,
  NotificationFeedList,
  useNotificationFeed,
} from "@/components/notifications/notification-feed";
import { cn } from "@/lib/utils";

export function NotificationBell({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const { unread, items, pending, refresh, onMarkAll, onItemActivate } =
    useNotificationFeed();

  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  const badgeLabel = unread > 99 ? "99+" : String(unread);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("relative size-10", className)}
          aria-label={
            unread > 0 ? `Notifications, ${unread} unread` : "Notifications"
          }
        >
          <Bell />
          {unread > 0 ? (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-4 min-w-4 px-1 text-[10px]"
            >
              {badgeLabel}
            </Badge>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <PopoverHeader className="flex flex-row items-center justify-between gap-2 px-3 py-2.5">
          <PopoverTitle className="font-mono text-sm">Notifications</PopoverTitle>
          {unread > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              disabled={pending}
              onClick={onMarkAll}
            >
              Mark all read
            </Button>
          ) : null}
        </PopoverHeader>
        <Separator />
        <div className="max-h-80 overflow-y-auto">
          <NotificationFeedList
            items={items}
            pending={pending}
            onItemActivate={(n) => {
              onItemActivate(n, () => setOpen(false));
            }}
            emptyClassName="px-3 py-6"
          />
        </div>
        <Separator />
        <p className="px-3 py-2 text-[11px] text-muted-foreground">
          Updates every {Math.round(NOTIFICATION_POLL_MS / 1000)}s
          {pending ? " · refreshing…" : null}
        </p>
      </PopoverContent>
    </Popover>
  );
}
