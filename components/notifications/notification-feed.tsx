"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  getOwnNotificationFeed,
  markAllOwnNotificationsRead,
  markOwnNotificationRead,
} from "@/lib/backend/notification-actions";
import type { Notification } from "@/lib/types";
import { cn } from "@/lib/utils";

export const NOTIFICATION_POLL_MS = 45_000;

export function formatNotificationRelative(iso?: string): string {
  if (!iso) return "";
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "";
  const diffSec = Math.round((Date.now() - t) / 1000);
  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

export function useNotificationFeed(initial?: {
  unread: number;
  items: Notification[];
}) {
  const router = useRouter();
  const [unread, setUnread] = useState(initial?.unread ?? 0);
  const [items, setItems] = useState<Notification[]>(initial?.items ?? []);
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
    if (!initial) {
      refresh();
    }
    const id = window.setInterval(refresh, NOTIFICATION_POLL_MS);
    return () => window.clearInterval(id);
  }, [refresh, initial]);

  function onMarkAll() {
    startTransition(async () => {
      await markAllOwnNotificationsRead();
      refresh();
    });
  }

  function onItemActivate(n: Notification, onNavigate?: () => void) {
    startTransition(async () => {
      if (!n.read) {
        await markOwnNotificationRead(n.$id);
      }
      refresh();
      if (n.link) {
        onNavigate?.();
        router.push(n.link);
      }
    });
  }

  return { unread, items, pending, refresh, onMarkAll, onItemActivate };
}

export function NotificationFeedList({
  items,
  pending,
  onItemActivate,
  className,
  emptyClassName,
  variant = "compact",
}: {
  items: Notification[];
  pending: boolean;
  onItemActivate: (n: Notification) => void;
  className?: string;
  emptyClassName?: string;
  variant?: "compact" | "page";
}) {
  if (items.length === 0) {
    return (
      <p
        className={cn(
          "py-4 text-center text-sm text-muted-foreground",
          emptyClassName,
        )}
      >
        No notifications
      </p>
    );
  }

  const page = variant === "page";

  return (
    <ul
      className={cn(
        "flex min-w-0 flex-col",
        page && "divide-y divide-border/80 rounded-2xl border border-border/80 bg-card",
        className,
      )}
    >
      {items.map((n) => (
        <li key={n.$id} className={!page ? "border-b border-border/80 last:border-0" : undefined}>
          <button
            type="button"
            className={cn(
              "flex w-full min-w-0 flex-col gap-1 text-left transition hover:bg-muted/40",
              page ? "gap-1.5 px-4 py-4 sm:px-5" : "gap-0.5 py-2.5",
              !n.read && (page ? "bg-accent/[0.04]" : "bg-accent/5"),
            )}
            onClick={() => onItemActivate(n)}
            disabled={pending}
          >
            <div className="flex min-w-0 items-start justify-between gap-3">
              <span
                className={cn(
                  "min-w-0 leading-snug",
                  page ? "text-base" : "text-sm",
                  n.read ? "font-normal text-foreground" : "font-semibold text-foreground",
                )}
              >
                {n.title}
              </span>
              {!n.read ? (
                <span
                  className="mt-2 size-2 shrink-0 rounded-full bg-accent"
                  aria-hidden
                />
              ) : null}
            </div>
            <span
              className={cn(
                "text-muted-foreground",
                page ? "text-sm leading-relaxed" : "line-clamp-2 text-xs",
              )}
            >
              {n.body}
            </span>
            <span className={cn("text-muted-foreground", page ? "text-xs" : "text-[11px]")}>
              {formatNotificationRelative(n.$createdAt)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
