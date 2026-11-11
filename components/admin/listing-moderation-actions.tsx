"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
import {
  approveListingFormAction,
  rejectListingFormAction,
  removeListingFormAction,
  setFeaturedListingFormAction,
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
  featured?: boolean;
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
      <Button type="submit" disabled={pending} size="sm" data-testid="admin-approve-listing">
        {pending ? "Approving…" : "Approve"}
      </Button>
    </form>
  );
}

export function ListingRejectForm({
  productId,
  title,
}: Pick<ListingRowActionsProps, "productId" | "title">) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    rejectListingFormAction,
    initial,
  );

  useModerationToast(state, () => setOpen(false));

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
        title="Reject listing?"
        description={`Reject “${title}”? A reason is required for the audit log.`}
        confirmLabel="Confirm reject"
        pendingLabel="Rejecting…"
        confirmVariant="outline"
        pending={pending}
        formAction={formAction}
        hiddenFields={{ productId }}
        note={{
          name: "reason",
          label: `Reason for rejecting ${title}`,
          placeholder: "Required. Stored in audit log",
        }}
      />
    </>
  );
}

export function ListingRemoveForm({
  productId,
  title,
}: Pick<ListingRowActionsProps, "productId" | "title">) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    removeListingFormAction,
    initial,
  );

  useModerationToast(state, () => setOpen(false));

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        Remove
      </Button>
      <ConfirmActionDialog
        open={open}
        onOpenChange={setOpen}
        title="Remove listing?"
        description={`Remove “${title}”? A reason is required for the audit log.`}
        confirmLabel="Confirm remove"
        pendingLabel="Removing…"
        confirmVariant="destructive"
        pending={pending}
        formAction={formAction}
        hiddenFields={{ productId }}
        note={{
          name: "reason",
          label: `Reason for removing ${title}`,
          placeholder: "Required. Stored in audit log",
        }}
      />
    </>
  );
}

export function ListingFeaturedToggle({
  productId,
  featured,
}: {
  productId: string;
  featured: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    setFeaturedListingFormAction,
    initial,
  );
  useModerationToast(state);

  return (
    <form action={formAction}>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="featured" value={featured ? "0" : "1"} />
      <Button
        type="submit"
        variant="outline"
        size="sm"
        disabled={pending}
        data-testid={featured ? "admin-unfeature-listing" : "admin-feature-listing"}
      >
        {pending
          ? "Saving…"
          : featured
            ? "Remove featured"
            : "Feature on home"}
      </Button>
    </form>
  );
}

export function ListingRowActions({
  productId,
  title,
  view,
  featured = false,
}: ListingRowActionsProps) {
  if (view === "pending") {
    return (
      <div className="flex flex-wrap items-start gap-3">
        <ListingApproveButton productId={productId} />
        <ListingRejectForm productId={productId} title={title} />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-start gap-3">
      <ListingFeaturedToggle productId={productId} featured={featured} />
      <ListingRemoveForm productId={productId} title={title} />
    </div>
  );
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
