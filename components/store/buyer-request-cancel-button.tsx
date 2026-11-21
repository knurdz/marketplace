"use client";

import { useActionState, useEffect } from "react";
import { cancelPurchaseRequestByBuyerAction } from "@/lib/services/purchase-request-actions";
import { FormGuardFields } from "@/components/security/form-guard-fields";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/ui/toast";

export function BuyerRequestCancelButton({
  requestId,
}: {
  requestId: string;
}) {
  const [state, formAction, pending] = useActionState(
    cancelPurchaseRequestByBuyerAction,
    {},
  );

  useEffect(() => {
    if (state.error) toast.error(state.error);
    else if (state.success) toast.success(state.success);
  }, [state]);

  return (
    <form action={formAction}>
      <FormGuardFields action="purchase-request.buyer-cancel" />
      <input type="hidden" name="requestId" value={requestId} />
      <Button
        type="submit"
        variant="outline"
        size="sm"
        disabled={pending}
        className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        {pending ? "Cancelling…" : "Cancel request"}
      </Button>
    </form>
  );
}
