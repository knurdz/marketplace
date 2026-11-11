"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  submitListingForReview,
  type SubmitListingActionState,
} from "@/lib/backend/seller-listing-actions";
import { toast } from "@/lib/ui/toast";
import { FormGuardFields } from "@/components/security/form-guard-fields";

const initial: SubmitListingActionState = {};

type SubmitListingButtonProps = {
  productId: string;
  label?: string;
};

export function SubmitListingButton({
  productId,
  label = "Submit",
}: SubmitListingButtonProps) {
  const [state, formAction, pending] = useActionState(
    submitListingForReview,
    initial,
  );
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
        router.refresh();
      }
    }
  }, [state, router]);

  return (
    <form action={formAction}>
      <FormGuardFields action="seller.listing.submit" />
      <input type="hidden" name="productId" value={productId} />
      <Button
        type="submit"
        size="xs"
        variant="info"
        disabled={pending}
        data-testid="listing-submit-review"
      >
        {!pending ? <Send data-icon="inline-start" /> : null}
        {pending ? "Submitting…" : label}
      </Button>
    </form>
  );
}
