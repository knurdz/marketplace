"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  sendMessageFormAction,
  type MessageActionState,
} from "@/lib/services/message-actions";
import type { Message } from "@/lib/types/messaging";
import { toast } from "@/lib/ui/toast";

const initial: MessageActionState = {};

type MessageThreadPanelProps = {
  threadId: string;
  messages: Message[];
  currentUserId: string;
  portal: "buyer" | "seller";
};

export function MessageThreadPanel({
  threadId,
  messages,
  currentUserId,
  portal,
}: MessageThreadPanelProps) {
  const [state, formAction, pending] = useActionState(
    sendMessageFormAction,
    initial,
  );
  const lastToast = useRef<string | null>(null);

  useEffect(() => {
    if (state.error) {
      const key = `e:${state.error}`;
      if (key !== lastToast.current) {
        lastToast.current = key;
        toast.error(state.error);
      }
      return;
    }
    if (state.success) {
      const key = `s:${state.success}`;
      if (key !== lastToast.current) {
        lastToast.current = key;
        toast.success(state.success);
      }
    }
  }, [state]);

  return (
    <div className="space-y-8">
      <ul className="space-y-4" aria-label="Messages">
        {messages.length === 0 ? (
          <li className="text-sm text-muted-foreground">No messages yet.</li>
        ) : (
          messages.map((message) => {
            const own = message.senderId === currentUserId;
            return (
              <li
                key={message.$id}
                className={
                  own
                    ? "ml-auto max-w-[85%] rounded-md border border-border bg-card px-4 py-3 text-sm"
                    : "mr-auto max-w-[85%] rounded-md border border-border bg-muted/40 px-4 py-3 text-sm"
                }
              >
                <p className="whitespace-pre-wrap">{message.body}</p>
              </li>
            );
          })
        )}
      </ul>

      <form action={formAction} className="space-y-3">
        <input type="hidden" name="threadId" value={threadId} />
        <input type="hidden" name="portal" value={portal} />
        <label className="block text-sm text-muted-foreground" htmlFor="body">
          Your message
        </label>
        <textarea
          id="body"
          name="body"
          required
          maxLength={2000}
          rows={4}
          disabled={pending}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          placeholder="Plain text only — no attachments in MVP."
        />
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Sending…" : "Send"}
        </Button>
      </form>
    </div>
  );
}
