"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  submitListingForReview,
  type SubmitListingActionState,
} from "@/lib/appwrite/seller-listing-actions";
import { toast } from "@/lib/ui/toast";

const initial: SubmitListingActionState = {};

type SubmitListingButtonProps = {
  productId: string;
  label?: string;
};

export function SubmitListingButton({
  productId,
  label = "Submit for review",
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
      <input type="hidden" name="productId" value={productId} />
      <Button type="submit" size="sm" variant="outline" disabled={pending} data-testid="listing-submit-review">
        {pending ? "Submitting…" : label}
      </Button>
    </form>
  );
}
