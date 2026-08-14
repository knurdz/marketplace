"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  approveBankSlipFormAction,
  rejectBankSlipFormAction,
  type BankSlipActionState,
} from "@/lib/appwrite/bank-slip-actions";
import { toast } from "@/lib/ui/toast";

const initial: BankSlipActionState = {};

function useBankSlipToast(
  state: BankSlipActionState,
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
        if (state.oversoldWarnings?.length) {
          for (const warning of state.oversoldWarnings) {
            toast.error(warning);
          }
        }
        onSuccess?.();
        router.refresh();
      }
    }
  }, [state, onSuccess, router]);
}

export function BankSlipApproveButton({ bankSlipId }: { bankSlipId: string }) {
  const [state, formAction, pending] = useActionState(
    approveBankSlipFormAction,
    initial,
  );
  useBankSlipToast(state);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (
          !window.confirm(
            "Approve this bank slip? This marks the payment paid, advances the order, and decrements stock. This cannot be undone.",
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="bankSlipId" value={bankSlipId} />
      <Button type="submit" disabled={pending} size="sm">
        {pending ? "Approving…" : "Approve"}
      </Button>
    </form>
  );
}

export function BankSlipRejectForm({ bankSlipId }: { bankSlipId: string }) {
  const [showNote, setShowNote] = useState(false);
  const [state, formAction, pending] = useActionState(
    rejectBankSlipFormAction,
    initial,
  );

  useBankSlipToast(state, () => setShowNote(false));

  if (!showNote) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setShowNote(true)}
      >
        Reject
      </Button>
    );
  }

  return (
    <form action={formAction} className="mt-3 space-y-2">
      <input type="hidden" name="bankSlipId" value={bankSlipId} />
      <label className="block font-mono text-xs text-muted-foreground">
        Rejection note (required)
        <textarea
          name="reviewNote"
          required
          maxLength={500}
          rows={3}
          placeholder="Why this slip is rejected — stored on the slip and in audit log"
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
          onClick={() => setShowNote(false)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function BankSlipReviewActions({ bankSlipId }: { bankSlipId: string }) {
  return (
    <div className="flex flex-wrap items-start gap-3">
      <BankSlipApproveButton bankSlipId={bankSlipId} />
      <BankSlipRejectForm bankSlipId={bankSlipId} />
    </div>
  );
}

export function BankSlipImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="mt-4 overflow-hidden rounded-md border border-border bg-muted/30">
      {/* eslint-disable-next-line @next/next/no-img-element -- admin-only authenticated proxy URL */}
      <img
        src={src}
        alt={alt}
        className="max-h-96 w-full object-contain"
        loading="lazy"
      />
    </div>
  );
}
