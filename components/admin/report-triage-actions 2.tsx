"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  dismissReportFormAction,
  resolveReportFormAction,
  startReportReviewFormAction,
  type ReportTriageActionState,
} from "@/lib/appwrite/report-triage-actions";
import type { ReportStatus } from "@/lib/types";
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
      <Button type="submit" disabled={pending} size="sm">
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
  formAction,
  state,
  pending,
}: {
  reportId: string;
  label: string;
  pendingLabel: string;
  confirmLabel: string;
  formAction: (payload: FormData) => void;
  state: ReportTriageActionState;
  pending: boolean;
}) {
  const [showNote, setShowNote] = useState(false);
  useTriageToast(state, () => setShowNote(false));

  if (!showNote) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setShowNote(true)}
      >
        {label}
      </Button>
    );
  }

  return (
    <form action={formAction} className="mt-3 space-y-2">
      <input type="hidden" name="reportId" value={reportId} />
      <label className="block font-mono text-xs text-muted-foreground">
        {label} note
        <textarea
          name="note"
          required
          maxLength={500}
          rows={3}
          placeholder="Required — stored in audit log"
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </label>
      <div className="flex gap-2">
        <Button type="submit" variant="outline" size="sm" disabled={pending}>
          {pending ? pendingLabel : confirmLabel}
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
      formAction={formAction}
      state={state}
      pending={pending}
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
      formAction={formAction}
      state={state}
      pending={pending}
    />
  );
}

export function ReportRowActions({
  reportId,
  status,
}: {
  reportId: string;
  status: ReportStatus;
}) {
  if (status === "resolved" || status === "dismissed") {
    return null;
  }

  return (
    <div className="flex flex-wrap items-start gap-3">
      {status === "open" ? (
        <ReportStartReviewButton reportId={reportId} />
      ) : null}
      <ReportResolveForm reportId={reportId} />
      <ReportDismissForm reportId={reportId} />
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
