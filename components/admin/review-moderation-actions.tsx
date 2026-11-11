"use client";

import { Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import {
  approveReviewAction,
  rejectReviewAction,
} from "@/lib/services/review-actions";
import type { ReviewActionState } from "@/lib/services/review-errors";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/ui/toast";

const initial: ReviewActionState = {};

function useModerationToast(state: ReviewActionState) {
  const last = useRef<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (state.error) {
      const key = `e:${state.error}`;
      if (key !== last.current) {
        last.current = key;
        toast.error(state.error);
      }
      return;
    }
    if (state.success) {
      const key = `s:${state.success}`;
      if (key !== last.current) {
        last.current = key;
        toast.success(state.success);
        router.refresh();
      }
    }
  }, [state, router]);
}

export function ReviewModerationActions({ reviewId }: { reviewId: string }) {
  const [approveState, approveAction, approvePending] = useActionState(
    approveReviewAction,
    initial,
  );
  const [rejectState, rejectAction, rejectPending] = useActionState(
    rejectReviewAction,
    initial,
  );

  useModerationToast(approveState);
  useModerationToast(rejectState);

  const busy = approvePending || rejectPending;

  return (
    <div className="flex flex-wrap gap-2" data-testid="admin-review-actions">
      <form action={approveAction}>
        <input type="hidden" name="reviewId" value={reviewId} />
        <Button
          type="submit"
          size="sm"
          variant="success"
          disabled={busy}
          data-testid="admin-approve-review"
        >
          {!approvePending ? <Check data-icon="inline-start" /> : null}
          {approvePending ? "Approving…" : "Approve"}
        </Button>
      </form>
      <form action={rejectAction}>
        <input type="hidden" name="reviewId" value={reviewId} />
        <Button
          type="submit"
          size="sm"
          variant="destructive"
          disabled={busy}
          data-testid="admin-reject-review"
        >
          {!rejectPending ? <X data-icon="inline-start" /> : null}
          {rejectPending ? "Rejecting…" : "Reject"}
        </Button>
      </form>
    </div>
  );
}
