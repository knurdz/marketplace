"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
import {
  approveSellerApplication,
  rejectSellerApplication,
  type SellerApprovalActionState,
} from "@/lib/appwrite/seller-approval-actions";
import { toast } from "@/lib/ui/toast";

const approveInitial: SellerApprovalActionState = {};
const rejectInitial: SellerApprovalActionState = {};

function useApprovalToast(
  state: SellerApprovalActionState,
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

type SellerApprovalRowProps = {
  sellerProfileId: string;
  shopName: string;
};

type SellerApproveButtonProps = {
  sellerProfileId: string;
};

export function SellerApproveButton({
  sellerProfileId,
}: SellerApproveButtonProps) {
  const [state, formAction, pending] = useActionState(
    approveSellerApplication,
    approveInitial,
  );
  useApprovalToast(state);

  return (
    <form action={formAction}>
      <input type="hidden" name="sellerProfileId" value={sellerProfileId} />
      <Button type="submit" disabled={pending} size="sm" data-testid="admin-approve-seller">
        {pending ? "Approving…" : "Approve"}
      </Button>
    </form>
  );
}

export function SellerRejectForm({
  sellerProfileId,
  shopName,
}: SellerApprovalRowProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    rejectSellerApplication,
    rejectInitial,
  );

  useApprovalToast(state, () => setOpen(false));

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        Reject
      </Button>
      <ConfirmActionDialog
        open={open}
        onOpenChange={setOpen}
        title="Reject seller application?"
        description={`Reject “${shopName}”? The reason is visible to the applicant.`}
        confirmLabel="Confirm reject"
        pendingLabel="Rejecting…"
        confirmVariant="outline"
        pending={pending}
        formAction={formAction}
        hiddenFields={{ sellerProfileId }}
        note={{
          name: "reason",
          label: `Reason for rejecting ${shopName}`,
          placeholder: "Required. Visible to the applicant",
        }}
      />
    </>
  );
}
