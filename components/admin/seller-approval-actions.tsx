"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
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
      <Button type="submit" disabled={pending} size="sm">
        {pending ? "Approving…" : "Approve"}
      </Button>
    </form>
  );
}

export function SellerRejectForm({
  sellerProfileId,
  shopName,
}: SellerApprovalRowProps) {
  const [showReason, setShowReason] = useState(false);
  const [state, formAction, pending] = useActionState(
    rejectSellerApplication,
    rejectInitial,
  );

  useApprovalToast(state, () => setShowReason(false));

  if (!showReason) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setShowReason(true)}
      >
        Reject
      </Button>
    );
  }

  return (
    <form action={formAction} className="mt-3 space-y-2">
      <input type="hidden" name="sellerProfileId" value={sellerProfileId} />
      <label className="block font-mono text-xs text-muted-foreground">
        Reason for rejecting {shopName}
        <textarea
          name="reason"
          required
          maxLength={500}
          rows={3}
          placeholder="Required — visible to the applicant"
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </label>
      <div className="flex gap-2">
        <Button type="submit" variant="outline" size="sm" disabled={pending}>
          {pending ? "Rejecting…" : "Confirm reject"}
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
