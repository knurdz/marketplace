"use client";

import { Ban, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
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
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    suspendUser,
    suspendInitial,
  );

  useManagementToast(state, () => setOpen(false));

  return (
    <>
      <Button
        type="button"
        variant="warning"
        size="sm"
        onClick={() => setOpen(true)}
        data-testid="admin-suspend-user"
      >
        <Ban data-icon="inline-start" />
        Suspend
      </Button>
      <ConfirmActionDialog
        open={open}
        onOpenChange={setOpen}
        title="Suspend user?"
        description={`Suspend ${displayLabel}? A reason is required for the audit log.`}
        confirmLabel="Confirm suspend"
        pendingLabel="Suspending…"
        confirmVariant="warning"
        pending={pending}
        formAction={formAction}
        hiddenFields={{ userId }}
        confirmTestId="admin-suspend-confirm"
        note={{
          name: "reason",
          label: `Reason for suspending ${displayLabel}`,
          placeholder: "Required. Stored in audit log",
        }}
      />
    </>
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
      <Button type="submit" variant="success" size="sm" disabled={pending}>
        {!pending ? <ShieldCheck data-icon="inline-start" /> : null}
        {pending ? "Unsuspending…" : "Unsuspend"}
      </Button>
    </form>
  );
}
