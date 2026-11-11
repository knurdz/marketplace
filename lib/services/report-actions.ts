"use server";

/**
 * Client-callable report mutations for storefront UI.
 */

import { revalidatePath } from "next/cache";
import {
  createProductReport as createProductReportImpl,
  type CreateProductReportInput,
} from "./reports";
import type { ReportActionState } from "./report-errors";
import { verifyFormGuard } from "@/lib/security/bot-guard";

export async function createProductReport(
  formData: FormData,
): Promise<ReportActionState> {
  const guard = await verifyFormGuard(formData, "report.product.create");
  if (!guard.ok) {
    return { error: "Could not submit this form. Please refresh and try again." };
  }
  const input: CreateProductReportInput = {
    productId: readString(formData, "productId"),
    reason: readString(formData, "reason"),
    details: readString(formData, "details") || null,
  };
  const result = await createProductReportImpl(input);
  if (result.success) {
    revalidatePath(`/products/${input.productId}`);
  }
  return result;
}

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export type { ReportActionState } from "./report-errors";
