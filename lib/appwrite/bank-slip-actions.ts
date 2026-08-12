"use server";

/**
 * Admin-only bank slip review actions.
 * Core logic in lib/services/bank-slip-review.ts — not exported here for client import safety.
 */

import { revalidatePath } from "next/cache";
import { ROLE_LABELS, userHasLabel } from "@/lib/appwrite/roles";
import { getLoggedInUser } from "@/lib/appwrite/session";
import {
  approveBankSlipCore,
  rejectBankSlipCore,
} from "@/lib/services/bank-slip-review";

export type BankSlipActionState = {
  success?: string;
  error?: string;
  oversoldWarnings?: string[];
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
  return { ok: true, userId: user.$id };
}

function revalidateBankSlipPaths(): void {
  revalidatePath("/admin/payments/bank-slips");
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
}

export async function approveBankSlip(
  bankSlipId: string,
): Promise<BankSlipActionState> {
  const auth = await assertAdmin();
  if (!auth.ok) return { error: auth.error };

  if (typeof bankSlipId !== "string" || !bankSlipId.trim()) {
    return { error: "Missing bank slip." };
  }

  const result = await approveBankSlipCore(auth.userId, bankSlipId.trim());
  if (!result.ok) return { error: result.error };

  revalidateBankSlipPaths();
  return {
    success: result.message,
    oversoldWarnings: result.oversoldWarnings,
  };
}

export async function rejectBankSlip(
  bankSlipId: string,
  reviewNote: string,
): Promise<BankSlipActionState> {
  const auth = await assertAdmin();
  if (!auth.ok) return { error: auth.error };

  if (typeof bankSlipId !== "string" || !bankSlipId.trim()) {
    return { error: "Missing bank slip." };
  }

  if (typeof reviewNote !== "string" || !reviewNote.trim()) {
    return { error: "Review note is required." };
  }

  const result = await rejectBankSlipCore(
    auth.userId,
    bankSlipId.trim(),
    reviewNote,
  );
  if (!result.ok) return { error: result.error };

  revalidateBankSlipPaths();
  return { success: result.message };
}

export async function approveBankSlipFormAction(
  _prev: BankSlipActionState,
  formData: FormData,
): Promise<BankSlipActionState> {
  const bankSlipId = formData.get("bankSlipId");
  if (typeof bankSlipId !== "string" || !bankSlipId.trim()) {
    return { error: "Missing bank slip." };
  }
  return approveBankSlip(bankSlipId.trim());
}

export async function rejectBankSlipFormAction(
  _prev: BankSlipActionState,
  formData: FormData,
): Promise<BankSlipActionState> {
  const bankSlipId = formData.get("bankSlipId");
  if (typeof bankSlipId !== "string" || !bankSlipId.trim()) {
    return { error: "Missing bank slip." };
  }

  const reviewNote = formData.get("reviewNote");
  if (typeof reviewNote !== "string" || !reviewNote.trim()) {
    return { error: "Review note is required." };
  }

  return rejectBankSlip(bankSlipId.trim(), reviewNote);
}
