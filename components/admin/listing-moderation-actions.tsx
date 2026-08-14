"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  approveListingFormAction,
  rejectListingFormAction,
  removeListingFormAction,
  type ListingModerationActionState,
} from "@/lib/appwrite/listing-moderation-actions";
import { toast } from "@/lib/ui/toast";

const initial: ListingModerationActionState = {};

function useModerationToast(
  state: ListingModerationActionState,
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

type ListingRowActionsProps = {
  productId: string;
  title: string;
  view: "pending" | "active";
};

export function ListingApproveButton({ productId }: { productId: string }) {
  const [state, formAction, pending] = useActionState(
    approveListingFormAction,
    initial,
  );
  useModerationToast(state);

  return (
    <form action={formAction}>
      <input type="hidden" name="productId" value={productId} />
      <Button type="submit" disabled={pending} size="sm">
        {pending ? "Approving…" : "Approve"}
      </Button>
    </form>
  );
}

export function ListingRejectForm({
  productId,
  title,
}: Pick<ListingRowActionsProps, "productId" | "title">) {
  const [showReason, setShowReason] = useState(false);
  const [state, formAction, pending] = useActionState(
    rejectListingFormAction,
    initial,
  );

  useModerationToast(state, () => setShowReason(false));

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
      <input type="hidden" name="productId" value={productId} />
      <label className="block font-mono text-xs text-muted-foreground">
        Reason for rejecting {title}
        <textarea
          name="reason"
          required
          maxLength={500}
          rows={3}
          placeholder="Required — stored in audit log"
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

export function ListingRemoveForm({
  productId,
  title,
}: Pick<ListingRowActionsProps, "productId" | "title">) {
  const [showReason, setShowReason] = useState(false);
  const [state, formAction, pending] = useActionState(
    removeListingFormAction,
    initial,
  );

  useModerationToast(state, () => setShowReason(false));

  if (!showReason) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setShowReason(true)}
      >
        Remove
      </Button>
    );
  }

  return (
    <form action={formAction} className="mt-3 space-y-2">
      <input type="hidden" name="productId" value={productId} />
      <label className="block font-mono text-xs text-muted-foreground">
        Reason for removing {title}
        <textarea
          name="reason"
          required
          maxLength={500}
          rows={3}
          placeholder="Required — stored in audit log"
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </label>
      <div className="flex gap-2">
        <Button type="submit" variant="outline" size="sm" disabled={pending}>
          {pending ? "Removing…" : "Confirm remove"}
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

export function ListingRowActions({ productId, title, view }: ListingRowActionsProps) {
  if (view === "pending") {
    return (
      <div className="flex flex-wrap items-start gap-3">
        <ListingApproveButton productId={productId} />
        <ListingRejectForm productId={productId} title={title} />
      </div>
    );
  }

  return <ListingRemoveForm productId={productId} title={title} />;
}

const DESCRIPTION_PREVIEW = 280;

export function ListingDescription({ description }: { description: string }) {
  const [expanded, setExpanded] = useState(false);
  const needsExpand = description.length > DESCRIPTION_PREVIEW;

  if (!needsExpand) {
    return (
      <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
        {description}
      </p>
    );
  }

  const preview = description.slice(0, DESCRIPTION_PREVIEW).trimEnd();

  return (
    <div className="mt-3">
      <p className="whitespace-pre-wrap text-sm text-muted-foreground">
        {expanded ? description : `${preview}…`}
      </p>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-1 font-mono text-xs text-accent hover:underline"
      >
        {expanded ? "Show less" : "Show full description"}
      </button>
    </div>
  );
}
