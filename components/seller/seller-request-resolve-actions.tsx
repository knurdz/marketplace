"use client";

import { BadgeCheck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import {
  markPurchaseRequestCancelledAction,
  markPurchaseRequestSoldAction,
} from "@/lib/services/purchase-request-actions";
import type { PurchaseRequestActionState } from "@/lib/services/purchase-request-errors";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/ui/toast";

type SellerRequestResolveActionsProps = {
  requestId: string;
};

const initialState: PurchaseRequestActionState = {};

function useResolveToast(
  state: PurchaseRequestActionState,
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

export function SellerRequestResolveActions({
  requestId,
}: SellerRequestResolveActionsProps) {
  const [soldOpen, setSoldOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [soldState, soldAction, soldPending] = useActionState(
    markPurchaseRequestSoldAction,
    initialState,
  );
  const [cancelState, cancelAction, cancelPending] = useActionState(
    markPurchaseRequestCancelledAction,
    initialState,
  );

  useResolveToast(soldState, () => setSoldOpen(false));
  useResolveToast(cancelState, () => setCancelOpen(false));

  return (
    <div
      className="flex shrink-0 flex-wrap justify-end gap-2"
      data-testid="seller-request-actions"
    >
      <Button
        type="button"
        variant="success"
        size="sm"
        disabled={soldPending || cancelPending}
        data-testid="seller-mark-sold"
        onClick={() => setSoldOpen(true)}
      >
        <BadgeCheck data-icon="inline-start" />
        Mark sold
      </Button>
      <ConfirmActionDialog
        open={soldOpen}
        onOpenChange={setSoldOpen}
        title="Mark as sold?"
        description="Stock will decrease by the requested quantity. This cannot be undone."
        confirmLabel="Mark sold"
        pendingLabel="Saving…"
        confirmVariant="success"
        pending={soldPending}
        confirmTestId="seller-mark-sold-confirm"
        formAction={soldAction}
        hiddenFields={{ requestId }}
      />

      <Button
        type="button"
        variant="warning"
        size="sm"
        disabled={soldPending || cancelPending}
        data-testid="seller-mark-cancelled"
        onClick={() => setCancelOpen(true)}
      >
        <X data-icon="inline-start" />
        Cancel request
      </Button>
      <ConfirmActionDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel this request?"
        description="Stock will stay the same. The buyer will be notified."
        confirmLabel="Cancel request"
        pendingLabel="Saving…"
        confirmVariant="warning"
        pending={cancelPending}
        confirmTestId="seller-mark-cancelled-confirm"
        formAction={cancelAction}
        hiddenFields={{ requestId }}
      />
    </div>
  );
}
