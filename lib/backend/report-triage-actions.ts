"use server";

/**
 * Admin-only report triage actions.
 * Core logic in lib/services/report-triage.ts: not exported here for client import safety.
 */

import { revalidatePath } from "next/cache";
import { ROLE_LABELS, userHasLabel } from "@/lib/backend/roles";
import { getLoggedInUser } from "@/lib/backend/session";
import {
  assertAdminMutationRateLimit,
  RATE_LIMIT_MESSAGE,
} from "@/lib/security/rate-limit";
import {
  banShopFromReportCore,
  dismissReportCore,
  resolveReportCore,
  startReviewCore,
  takeDownListingFromReportCore,
} from "@/lib/services/report-triage";

export type ReportTriageActionState = {
  success?: string;
  error?: string;
};

async function assertAdmin(): Promise<
  { ok: true; userId: string } | { ok: false; error: string }
> {
  const user = await getLoggedInUser();
  if (!user) {
    return { ok: false, error: "Unauthorized" };
  }
  if (!userHasLabel(user, ROLE_LABELS.admin)) {
    return { ok: false, error: "Unauthorized" };
  }
  if (!(await assertAdminMutationRateLimit(user.$id)).ok) {
    return { ok: false, error: RATE_LIMIT_MESSAGE };
  }
  return { ok: true, userId: user.$id };
}

function revalidateReportPaths(): void {
  revalidatePath("/admin/reports");
  revalidatePath("/admin");
}

function revalidateModerationPaths(): void {
  revalidateReportPaths();
  revalidatePath("/admin/listings");
  revalidatePath("/admin/buyers");
  revalidatePath("/");
}

export async function startReportReview(
  reportId: string,
): Promise<ReportTriageActionState> {
  const auth = await assertAdmin();
  if (!auth.ok) return { error: auth.error };

  if (typeof reportId !== "string" || !reportId.trim()) {
    return { error: "Missing report." };
  }

  const result = await startReviewCore(auth.userId, reportId.trim());
  if (!result.ok) return { error: result.error };

  revalidateReportPaths();
  return { success: result.message };
}

export async function resolveReport(
  reportId: string,
  note: string,
): Promise<ReportTriageActionState> {
  const auth = await assertAdmin();
  if (!auth.ok) return { error: auth.error };

  if (typeof reportId !== "string" || !reportId.trim()) {
    return { error: "Missing report." };
  }

  if (typeof note !== "string" || !note.trim()) {
    return { error: "Note is required." };
  }

  const result = await resolveReportCore(auth.userId, reportId.trim(), note);
  if (!result.ok) return { error: result.error };

  revalidateReportPaths();
  return { success: result.message };
}

export async function dismissReport(
  reportId: string,
  note: string,
): Promise<ReportTriageActionState> {
  const auth = await assertAdmin();
  if (!auth.ok) return { error: auth.error };

  if (typeof reportId !== "string" || !reportId.trim()) {
    return { error: "Missing report." };
  }

  if (typeof note !== "string" || !note.trim()) {
    return { error: "Note is required." };
  }

  const result = await dismissReportCore(auth.userId, reportId.trim(), note);
  if (!result.ok) return { error: result.error };

  revalidateReportPaths();
  return { success: result.message };
}

export async function takeDownListingFromReport(
  reportId: string,
  note: string,
): Promise<ReportTriageActionState> {
  const auth = await assertAdmin();
  if (!auth.ok) return { error: auth.error };

  if (typeof reportId !== "string" || !reportId.trim()) {
    return { error: "Missing report." };
  }

  if (typeof note !== "string" || !note.trim()) {
    return { error: "Note is required." };
  }

  const result = await takeDownListingFromReportCore(
    auth.userId,
    reportId.trim(),
    note,
  );
  if (!result.ok) return { error: result.error };

  revalidateModerationPaths();
  return { success: result.message };
}

export async function banShopFromReport(
  reportId: string,
  note: string,
): Promise<ReportTriageActionState> {
  const auth = await assertAdmin();
  if (!auth.ok) return { error: auth.error };

  if (typeof reportId !== "string" || !reportId.trim()) {
    return { error: "Missing report." };
  }

  if (typeof note !== "string" || !note.trim()) {
    return { error: "Note is required." };
  }

  const result = await banShopFromReportCore(
    auth.userId,
    reportId.trim(),
    note,
  );
  if (!result.ok) return { error: result.error };

  revalidateModerationPaths();
  return { success: result.message };
}

export async function startReportReviewFormAction(
  _prev: ReportTriageActionState,
  formData: FormData,
): Promise<ReportTriageActionState> {
  const reportId = formData.get("reportId");
  if (typeof reportId !== "string" || !reportId.trim()) {
    return { error: "Missing report." };
  }
  return startReportReview(reportId.trim());
}

export async function resolveReportFormAction(
  _prev: ReportTriageActionState,
  formData: FormData,
): Promise<ReportTriageActionState> {
  const reportId = formData.get("reportId");
  if (typeof reportId !== "string" || !reportId.trim()) {
    return { error: "Missing report." };
  }
  const note = formData.get("note");
  if (typeof note !== "string" || !note.trim()) {
    return { error: "Note is required." };
  }
  return resolveReport(reportId.trim(), note);
}

export async function dismissReportFormAction(
  _prev: ReportTriageActionState,
  formData: FormData,
): Promise<ReportTriageActionState> {
  const reportId = formData.get("reportId");
  if (typeof reportId !== "string" || !reportId.trim()) {
    return { error: "Missing report." };
  }
  const note = formData.get("note");
  if (typeof note !== "string" || !note.trim()) {
    return { error: "Note is required." };
  }
  return dismissReport(reportId.trim(), note);
}

export async function takeDownListingFromReportFormAction(
  _prev: ReportTriageActionState,
  formData: FormData,
): Promise<ReportTriageActionState> {
  const reportId = formData.get("reportId");
  if (typeof reportId !== "string" || !reportId.trim()) {
    return { error: "Missing report." };
  }
  const note = formData.get("note");
  if (typeof note !== "string" || !note.trim()) {
    return { error: "Note is required." };
  }
  return takeDownListingFromReport(reportId.trim(), note);
}

export async function banShopFromReportFormAction(
  _prev: ReportTriageActionState,
  formData: FormData,
): Promise<ReportTriageActionState> {
  const reportId = formData.get("reportId");
  if (typeof reportId !== "string" || !reportId.trim()) {
    return { error: "Missing report." };
  }
  const note = formData.get("note");
  if (typeof note !== "string" || !note.trim()) {
    return { error: "Note is required." };
  }
  return banShopFromReport(reportId.trim(), note);
}
