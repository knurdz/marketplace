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

export async function createProductReport(
  input: CreateProductReportInput,
): Promise<ReportActionState> {
  const result = await createProductReportImpl(input);
  if (result.success) {
    revalidatePath(`/products/${input.productId}`);
  }
  return result;
}

export type { ReportActionState } from "./report-errors";
