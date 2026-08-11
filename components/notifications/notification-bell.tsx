"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import {
  getOwnNotificationFeed,
  markAllOwnNotificationsRead,
  markOwnNotificationRead,
} from "@/lib/appwrite/notification-actions";
import type { Notification } from "@/lib/types";
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
import { cn } from "@/lib/utils";

const POLL_MS = 45_000;

function formatRelative(iso?: string): string {
  if (!iso) return "";
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "";
  const diffSec = Math.round((Date.now() - t) / 1000);
  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

export function NotificationBell({ className }: { className?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<Notification[]>([]);
  const [pending, startTransition] = useTransition();

  const refresh = useCallback(() => {
    startTransition(async () => {
      try {
        const feed = await getOwnNotificationFeed();
        setUnread(feed.unread);
        setItems(feed.items);
      } catch {
        // Keep last known state on transient errors.
      }
    });
  }, []);

  useEffect(() => {
    refresh();
    const id = window.setInterval(refresh, POLL_MS);
    return () => window.clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  function onMarkAll() {
    startTransition(async () => {
      await markAllOwnNotificationsRead();
      refresh();
    });
  }

  function onItemActivate(n: Notification) {
    startTransition(async () => {
      if (!n.read) {
        await markOwnNotificationRead(n.$id);
      }
      refresh();
      if (n.link) {
        setOpen(false);
        router.push(n.link);
      }
    });
  }

  const badgeLabel = unread > 99 ? "99+" : String(unread);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={cn("relative", className)}
          aria-label={
            unread > 0
              ? `Notifications, ${unread} unread`
              : "Notifications"
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
          {items.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No notifications
            </p>
          ) : (
            <ul className="flex flex-col">
              {items.map((n) => (
                <li key={n.$id} className="border-b border-border last:border-0">
                  <button
                    type="button"
                    className={cn(
                      "flex w-full flex-col gap-0.5 px-3 py-2.5 text-left transition hover:bg-muted/60",
                      !n.read && "bg-accent/5",
                    )}
                    onClick={() => onItemActivate(n)}
                    disabled={pending}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={cn(
                          "text-sm leading-snug",
                          n.read
                            ? "font-normal text-foreground"
                            : "font-medium text-foreground",
                        )}
                      >
                        {n.title}
                      </span>
                      {!n.read ? (
                        <span
                          className="mt-1 size-1.5 shrink-0 rounded-full bg-accent"
                          aria-hidden
                        />
                      ) : null}
                    </div>
                    <span className="line-clamp-2 text-xs text-muted-foreground">
                      {n.body}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {formatRelative(n.$createdAt)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Separator />
        <p className="px-3 py-2 text-[11px] text-muted-foreground">
          Updates every 45s
          {pending ? " · refreshing…" : null}
        </p>
      </PopoverContent>
    </Popover>
  );
}
