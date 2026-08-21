"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  getOrCreateBuyerThread,
  getOrCreateSellerThread,
  sendThreadMessage,
} from "@/lib/services/threads";

export type MessageActionState = {
  error?: string;
  success?: string;
};

export async function openBuyerThreadFormAction(
  formData: FormData,
): Promise<void> {
  const orderId = String(formData.get("orderId") ?? "").trim();
  const result = await getOrCreateBuyerThread(orderId);
  if (!result.ok) {
    redirect(
      `/orders/${encodeURIComponent(orderId)}?msgError=${encodeURIComponent(result.error)}`,
    );
  }
  redirect(`/messages/${encodeURIComponent(result.threadId)}`);
}

export async function openSellerThreadFormAction(
  formData: FormData,
): Promise<void> {
  const orderId = String(formData.get("orderId") ?? "").trim();
  const result = await getOrCreateSellerThread(orderId);
  if (!result.ok) {
    redirect(
      `/seller/orders/${encodeURIComponent(orderId)}?msgError=${encodeURIComponent(result.error)}`,
    );
  }
  redirect(`/seller/messages/${encodeURIComponent(result.threadId)}`);
}

export async function sendMessageFormAction(
  _prev: MessageActionState,
  formData: FormData,
): Promise<MessageActionState> {
  const threadId = String(formData.get("threadId") ?? "").trim();
  const body = String(formData.get("body") ?? "");
  const portal = String(formData.get("portal") ?? "buyer");

  if (!threadId) return { error: "Invalid conversation." };

  const result = await sendThreadMessage(threadId, body);
  if (!result.ok) return { error: result.error };

  revalidatePath(`/messages/${threadId}`);
  revalidatePath(`/seller/messages/${threadId}`);
  revalidatePath(portal === "seller" ? "/seller/messages" : "/messages");

  return { success: "Message sent." };
}
