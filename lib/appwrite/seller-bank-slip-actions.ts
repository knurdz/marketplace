"use server";

/**
 * Seller-owned bank slip review actions.
 * Core AuthZ lives in lib/services/bank-slip-review.ts (seller label + order.sellerId).
 */

import { revalidatePath } from "next/cache";
import {
  approveBankSlipCore,
  rejectAndCancelBankSlipCore,
  rejectBankSlipCore,
} from "@/lib/services/bank-slip-review";

export type BankSlipActionState = {
  success?: string;
  error?: string;
};

function revalidateSellerBankSlipPaths(): void {
  revalidatePath("/seller/orders", "layout");
  revalidatePath("/seller");
  revalidatePath("/admin/payments/bank-slips");
  revalidatePath("/admin/orders");
  revalidatePath("/orders", "layout");
}

export async function approveBankSlipFormAction(
  _prev: BankSlipActionState,
  formData: FormData,
): Promise<BankSlipActionState> {
  const bankSlipId = formData.get("bankSlipId");
  if (typeof bankSlipId !== "string" || !bankSlipId.trim()) {
    return { error: "Missing bank slip." };
  }

  const result = await approveBankSlipCore(bankSlipId.trim());
  if (!result.ok) return { error: result.error };

  revalidateSellerBankSlipPaths();
  return { success: result.message };
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

  const result = await rejectBankSlipCore(bankSlipId.trim(), reviewNote);
  if (!result.ok) return { error: result.error };

  revalidateSellerBankSlipPaths();
  return { success: result.message };
}

export async function rejectAndCancelBankSlipFormAction(
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

  const result = await rejectAndCancelBankSlipCore(
    bankSlipId.trim(),
    reviewNote,
  );
  if (!result.ok) return { error: result.error };

  revalidateSellerBankSlipPaths();
  return { success: result.message };
}
