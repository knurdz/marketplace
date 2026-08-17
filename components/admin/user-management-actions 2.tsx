"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  suspendUser,
  unsuspendUser,
  type UserManagementActionState,
} from "@/lib/appwrite/user-management-actions";
import { toast } from "@/lib/ui/toast";

const suspendInitial: UserManagementActionState = {};
const unsuspendInitial: UserManagementActionState = {};

function useManagementToast(
  state: UserManagementActionState,
  onSuccess?: () => void,
) {
  const lastToast = useRef<string | null>(null);
  const router = useRouter();

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
        onSuccess?.();
        router.refresh();
      }
    }
  }, [state, onSuccess, router]);
}

type UserSuspendFormProps = {
  userId: string;
  displayLabel: string;
};

export function UserSuspendForm({ userId, displayLabel }: UserSuspendFormProps) {
  const [showReason, setShowReason] = useState(false);
  const [state, formAction, pending] = useActionState(
    suspendUser,
    suspendInitial,
  );

  useManagementToast(state, () => setShowReason(false));

  if (!showReason) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setShowReason(true)}
      >
        Suspend
      </Button>
    );
  }

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="userId" value={userId} />
      <label className="block font-mono text-xs text-muted-foreground">
        Reason for suspending {displayLabel}
        <textarea
          name="reason"
          required
          maxLength={500}
          rows={3}
          placeholder="Required — stored in audit log"
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </label>
      <div className="flex gap-2">
        <Button type="submit" variant="outline" size="sm" disabled={pending}>
          {pending ? "Suspending…" : "Confirm suspend"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={pending}
          onClick={() => setShowReason(false)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function UserUnsuspendButton({ userId }: { userId: string }) {
  const [state, formAction, pending] = useActionState(
    unsuspendUser,
    unsuspendInitial,
  );
  useManagementToast(state);

  return (
    <form action={formAction}>
      <input type="hidden" name="userId" value={userId} />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Unsuspending…" : "Unsuspend"}
      </Button>
    </form>
  );
}
