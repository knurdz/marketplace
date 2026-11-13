"use client";

import { Ban, ShieldCheck, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  blockAdminAccount,
  createAdminAccount,
  deleteAdminAccount,
  unblockAdminAccount,
  type AdminAccountsActionState,
} from "@/lib/backend/admin-accounts-actions";
import type { AdminAccountView } from "@/lib/services/admin-accounts";
import { toast } from "@/lib/ui/toast";

const initial: AdminAccountsActionState = {};

function useAdminAccountsToast(
  state: AdminAccountsActionState,
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

export function AdminCreateForm() {
  const [createState, createAction, createPending] = useActionState(
    createAdminAccount,
    initial,
  );
  useAdminAccountsToast(createState);

  return (
    <form
      action={createAction}
      className="mt-6 grid gap-4 rounded-lg border border-border/80 bg-card p-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
        <Label htmlFor="admin-create-name">Full name</Label>
        <Input
          id="admin-create-name"
          name="name"
          required
          maxLength={255}
          autoComplete="name"
          disabled={createPending}
        />
      </div>
      <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
        <Label htmlFor="admin-create-email">Email</Label>
        <Input
          id="admin-create-email"
          name="email"
          type="email"
          required
          maxLength={255}
          autoComplete="off"
          disabled={createPending}
        />
      </div>
      <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
        <Label htmlFor="admin-create-password">Temporary password</Label>
        <Input
          id="admin-create-password"
          name="password"
          type="password"
          required
          minLength={8}
          maxLength={128}
          autoComplete="new-password"
          disabled={createPending}
        />
      </div>
      <div className="flex items-end sm:col-span-2 lg:col-span-1">
        <Button
          type="submit"
          variant="info"
          disabled={createPending}
          data-testid="admin-create-submit"
        >
          {createPending ? "Creating…" : "Add admin"}
        </Button>
      </div>
    </form>
  );
}

type RowActionsProps = {
  admin: AdminAccountView;
  actorUserId: string;
};

export function AdminAccountRowActions({ admin, actorUserId }: RowActionsProps) {
  const displayLabel = admin.name || admin.email || admin.userId;
  const isSelf = admin.userId === actorUserId;
  const canMutate = !admin.isSuperAdmin && !isSelf;

  const [blockOpen, setBlockOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [blockState, blockAction, blockPending] = useActionState(
    blockAdminAccount,
    initial,
  );
  const [unblockState, unblockAction, unblockPending] = useActionState(
    unblockAdminAccount,
    initial,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteAdminAccount,
    initial,
  );

  useAdminAccountsToast(blockState, () => setBlockOpen(false));
  useAdminAccountsToast(unblockState);
  useAdminAccountsToast(deleteState, () => setDeleteOpen(false));

  if (!canMutate) {
    return (
      <p className="text-xs text-muted-foreground">
        {admin.isSuperAdmin ? "Superadmin" : "Your account"}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {admin.suspended ? (
        <form action={unblockAction}>
          <input type="hidden" name="userId" value={admin.userId} />
          <Button type="submit" variant="success" size="sm" disabled={unblockPending}>
            {!unblockPending ? <ShieldCheck data-icon="inline-start" /> : null}
            {unblockPending ? "Unblocking…" : "Unblock"}
          </Button>
        </form>
      ) : (
        <>
          <Button
            type="button"
            variant="warning"
            size="sm"
            onClick={() => setBlockOpen(true)}
            data-testid="admin-block"
          >
            <Ban data-icon="inline-start" />
            Block
          </Button>
          <ConfirmActionDialog
            open={blockOpen}
            onOpenChange={setBlockOpen}
            title="Block admin?"
            description={`Block ${displayLabel}? They cannot sign in until unblocked. Reason is required for the audit log.`}
            confirmLabel="Confirm block"
            pendingLabel="Blocking…"
            confirmVariant="warning"
            pending={blockPending}
            formAction={blockAction}
            hiddenFields={{ userId: admin.userId }}
            note={{
              name: "reason",
              label: `Reason for blocking ${displayLabel}`,
              placeholder: "Required. Stored in audit log",
            }}
          />
        </>
      )}
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={() => setDeleteOpen(true)}
        data-testid="admin-delete"
      >
        <Trash2 data-icon="inline-start" />
        Delete
      </Button>
      <ConfirmActionDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete admin?"
        description={`Permanently delete ${displayLabel}? This cannot be undone.`}
        confirmLabel="Delete admin"
        pendingLabel="Deleting…"
        confirmVariant="destructive"
        pending={deletePending}
        formAction={deleteAction}
        hiddenFields={{ userId: admin.userId }}
      />
    </div>
  );
}
