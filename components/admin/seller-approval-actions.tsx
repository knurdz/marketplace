"use client";

import { Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
import {
  approveSellerApplication,
  rejectSellerApplication,
  type SellerApprovalActionState,
} from "@/lib/backend/seller-approval-actions";
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
  compact?: boolean;
};

export function SellerApproveButton({
  sellerProfileId,
  compact = false,
}: SellerApproveButtonProps) {
  const [state, formAction, pending] = useActionState(
    approveSellerApplication,
    approveInitial,
  );
  useApprovalToast(state);

  return (
    <form action={formAction} className="inline-flex shrink-0">
      <input type="hidden" name="sellerProfileId" value={sellerProfileId} />
      <Button
        type="submit"
        variant="success"
        disabled={pending}
        size={compact ? "xs" : "sm"}
        data-testid="admin-approve-seller"
      >
        {!pending ? <Check data-icon="inline-start" /> : null}
        {pending ? "Approving…" : "Approve"}
      </Button>
    </form>
  );
}

export function SellerRejectForm({
  sellerProfileId,
  shopName,
  compact = false,
}: SellerApprovalRowProps & { compact?: boolean }) {
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
        variant="destructive"
        size={compact ? "xs" : "sm"}
        onClick={() => setOpen(true)}
      >
        <X data-icon="inline-start" />
        Reject
      </Button>
      <ConfirmActionDialog
        open={open}
        onOpenChange={setOpen}
        title="Reject seller application?"
        description={`Reject “${shopName}”? An optional message can be emailed to the applicant and shown on their application status.`}
        confirmLabel="Confirm reject"
        pendingLabel="Rejecting…"
        confirmVariant="destructive"
        pending={pending}
        formAction={formAction}
        hiddenFields={{ sellerProfileId }}
        note={{
          name: "reason",
          label: "Message to applicant (optional)",
          placeholder: "Included in the rejection email if provided",
          required: false,
        }}
      />
    </>
  );
}
