"use client";

import { Ban, Check, ClipboardList, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
import {
  banShopFromReportFormAction,
  dismissReportFormAction,
  resolveReportFormAction,
  startReportReviewFormAction,
  takeDownListingFromReportFormAction,
  type ReportTriageActionState,
} from "@/lib/backend/report-triage-actions";
import type { ProductStatus, ReportStatus } from "@/lib/types";
import { toast } from "@/lib/ui/toast";

const initial: ReportTriageActionState = {};

function useTriageToast(
  state: ReportTriageActionState,
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

export function ReportStartReviewButton({ reportId }: { reportId: string }) {
  const [state, formAction, pending] = useActionState(
    startReportReviewFormAction,
    initial,
  );
  useTriageToast(state);

  return (
    <form action={formAction}>
      <input type="hidden" name="reportId" value={reportId} />
      <Button type="submit" variant="info" disabled={pending} size="sm">
        {!pending ? <ClipboardList data-icon="inline-start" /> : null}
        {pending ? "Starting…" : "Start review"}
      </Button>
    </form>
  );
}

function ReportNoteForm({
  reportId,
  label,
  pendingLabel,
  confirmLabel,
  description,
  formAction,
  state,
  pending,
  triggerVariant,
  confirmVariant,
  icon,
}: {
  reportId: string;
  label: string;
  pendingLabel: string;
  confirmLabel: string;
  description: string;
  formAction: (payload: FormData) => void;
  state: ReportTriageActionState;
  pending: boolean;
  triggerVariant: "success" | "warning" | "destructive";
  confirmVariant: "success" | "warning" | "destructive";
  icon: "resolve" | "dismiss" | "takedown" | "ban";
}) {
  const [open, setOpen] = useState(false);
  useTriageToast(state, () => setOpen(false));
  const Icon =
    icon === "resolve"
      ? Check
      : icon === "dismiss"
        ? X
        : icon === "takedown"
          ? Trash2
          : Ban;

  return (
    <>
      <Button
        type="button"
        variant={triggerVariant}
        size="sm"
        onClick={() => setOpen(true)}
      >
        <Icon data-icon="inline-start" />
        {label}
      </Button>
      <ConfirmActionDialog
        open={open}
        onOpenChange={setOpen}
        title={`${label}?`}
        description={description}
        confirmLabel={confirmLabel}
        pendingLabel={pendingLabel}
        confirmVariant={confirmVariant}
        pending={pending}
        formAction={formAction}
        hiddenFields={{ reportId }}
        note={{
          name: "note",
          label: `${label} note`,
          placeholder: "Required. Stored in audit log",
        }}
      />
    </>
  );
}

export function ReportResolveForm({ reportId }: { reportId: string }) {
  const [state, formAction, pending] = useActionState(
    resolveReportFormAction,
    initial,
  );

  return (
    <ReportNoteForm
      reportId={reportId}
      label="Resolve"
      pendingLabel="Resolving…"
      confirmLabel="Confirm resolve"
      description="A note is required and stored in the audit log."
      formAction={formAction}
      state={state}
      pending={pending}
      triggerVariant="success"
      confirmVariant="success"
      icon="resolve"
    />
  );
}

export function ReportDismissForm({ reportId }: { reportId: string }) {
  const [state, formAction, pending] = useActionState(
    dismissReportFormAction,
    initial,
  );

  return (
    <ReportNoteForm
      reportId={reportId}
      label="Dismiss"
      pendingLabel="Dismissing…"
      confirmLabel="Confirm dismiss"
      description="A note is required and stored in the audit log."
      formAction={formAction}
      state={state}
      pending={pending}
      triggerVariant="warning"
      confirmVariant="warning"
      icon="dismiss"
    />
  );
}

export function ReportTakeDownForm({
  reportId,
  productTitle,
}: {
  reportId: string;
  productTitle: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    takeDownListingFromReportFormAction,
    initial,
  );
  const title = productTitle?.trim() || "this listing";

  return (
    <ReportNoteForm
      reportId={reportId}
      label="Take down"
      pendingLabel="Taking down…"
      confirmLabel="Confirm take down"
      description={`Archive “${title}” and resolve this report. A note is required for the audit log.`}
      formAction={formAction}
      state={state}
      pending={pending}
      triggerVariant="destructive"
      confirmVariant="destructive"
      icon="takedown"
    />
  );
}

export function ReportBanShopForm({
  reportId,
  shopLabel,
}: {
  reportId: string;
  shopLabel: string;
}) {
  const [state, formAction, pending] = useActionState(
    banShopFromReportFormAction,
    initial,
  );

  return (
    <ReportNoteForm
      reportId={reportId}
      label="Ban shop"
      pendingLabel="Banning…"
      confirmLabel="Confirm ban"
      description={`Suspend ${shopLabel}, archive their active listings, hide the shop, and resolve this report. A note is required for the audit log.`}
      formAction={formAction}
      state={state}
      pending={pending}
      triggerVariant="destructive"
      confirmVariant="destructive"
      icon="ban"
    />
  );
}

export function ReportRowActions({
  reportId,
  status,
  productId,
  productTitle,
  productStatus,
  sellerId,
  shopName,
}: {
  reportId: string;
  status: ReportStatus;
  productId: string;
  productTitle: string | null;
  productStatus: ProductStatus | null;
  sellerId: string | null;
  shopName: string | null;
}) {
  if (status === "resolved" || status === "dismissed") {
    return null;
  }

  const canTakeDown =
    Boolean(productId) &&
    (productStatus === "active" || productStatus === "archived");
  const canBanShop = Boolean(sellerId);
  const shopLabel = shopName?.trim() || sellerId || "this shop";

  return (
    <div className="flex flex-wrap items-start gap-3">
      {status === "open" ? (
        <ReportStartReviewButton reportId={reportId} />
      ) : null}
      <ReportResolveForm reportId={reportId} />
      <ReportDismissForm reportId={reportId} />
      {canTakeDown ? (
        <ReportTakeDownForm reportId={reportId} productTitle={productTitle} />
      ) : null}
      {canBanShop ? (
        <ReportBanShopForm reportId={reportId} shopLabel={shopLabel} />
      ) : null}
    </div>
  );
}

const DETAILS_PREVIEW = 280;

export function ReportDetails({ details }: { details: string | null }) {
  const [expanded, setExpanded] = useState(false);
  if (!details) return null;

  const needsExpand = details.length > DETAILS_PREVIEW;
  if (!needsExpand) {
    return (
      <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
        {details}
      </p>
    );
  }

  const preview = details.slice(0, DETAILS_PREVIEW).trimEnd();

  return (
    <div className="mt-3">
      <p className="whitespace-pre-wrap text-sm text-muted-foreground">
        {expanded ? details : `${preview}…`}
      </p>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-1 font-mono text-xs text-accent hover:underline"
      >
        {expanded ? "Show less" : "Show full details"}
      </button>
    </div>
  );
}
