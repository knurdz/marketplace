import { Query } from "node-appwrite";
import {
  DATABASE_ID,
  TABLE_SELLER_PROFILES,
} from "@/lib/appwrite/config";
import { createAdminClient } from "@/lib/appwrite/server";
import { isSellerStatus } from "@/lib/types";
import { getOwnOrder, getOwnPaymentForOrder } from "./orders";

/** Public storefront seller card — never includes bank or rejection fields. */
export type PublicSellerInfo = {
  userId: string;
  shopName: string;
  slug: string;
  bio: string | null;
  bannerFileId: string | null;
  returnPolicy: string | null;
  shippingPolicy: string | null;
};

function asNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return value.length > 0 ? value : null;
}

/** Whether a seller_profiles status is safe to expose on the public storefront. */
export function isApprovedPublicSellerStatus(status: unknown): boolean {
  return isSellerStatus(status) && status === "approved";
}

export function toPublicSellerInfo(
  record: Record<string, unknown>,
): PublicSellerInfo | null {
  if (!isApprovedPublicSellerStatus(record.status)) return null;

  const userId = asNullableString(record.userId);
  const shopName = asNullableString(record.shopName);
  const slug = asNullableString(record.slug);
  if (!userId || !shopName || !slug) return null;

  return {
    userId,
    shopName,
    slug,
    bio: asNullableString(record.bio),
    bannerFileId: asNullableString(record.bannerFileId),
    returnPolicy: asNullableString(record.returnPolicy),
    shippingPolicy: asNullableString(record.shippingPolicy),
  };
}

/**
 * Approved seller profile for storefront display.
 * Uses admin client (seller_profiles is admin-read only); returns null when
 * missing, non-approved, or on error — never exposes bank account fields.
 */
export async function getPublicSellerByUserId(
  userId: string,
): Promise<PublicSellerInfo | null> {
  const trimmed = userId?.trim();
  if (!trimmed) return null;

  try {
    const { tables } = await createAdminClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_SELLER_PROFILES,
      queries: [Query.equal("userId", trimmed), Query.limit(1)],
    });

    const row = result.rows[0];
    if (!row) return null;

    return toPublicSellerInfo(row as unknown as Record<string, unknown>);
  } catch {
    return null;
  }
}

/**
 * Approved seller profile by shop slug for `/shop/[slug]`.
 * Returns null for missing, pending, rejected, or invalid slug — same 404 UX.
 */
export async function getPublicSellerBySlug(
  slug: string,
): Promise<PublicSellerInfo | null> {
  const trimmed = slug?.trim();
  if (!trimmed) return null;

  try {
    const { tables } = await createAdminClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_SELLER_PROFILES,
      queries: [Query.equal("slug", trimmed), Query.limit(1)],
    });

    const row = result.rows[0];
    if (!row) return null;

    return toPublicSellerInfo(row as unknown as Record<string, unknown>);
  } catch {
    return null;
  }
}

const CHECKOUT_BANK_PAYMENT_STATUSES = [
  "pending",
  "awaiting_verification",
] as const;

/** Bank details for an owned bank-transfer checkout — server-only, never on public seller cards. */
export type CheckoutSellerBankDetails = {
  bankAccountName: string | null;
  bankAccountNumber: string | null;
  bankName: string | null;
  bankTransferNotes: string | null;
};

/**
 * Seller bank account fields for an owned bank-transfer order that still needs payment.
 * Verifies the signed-in buyer owns the order, method is bank_transfer, and payment
 * is pending or awaiting_verification. Returns null otherwise.
 */
export async function getSellerBankDetailsForCheckout(
  orderId: string,
): Promise<CheckoutSellerBankDetails | null> {
  const trimmed = orderId?.trim();
  if (!trimmed) return null;

  const order = await getOwnOrder(trimmed);
  if (!order || order.paymentMethod !== "bank_transfer") return null;

  const payment = await getOwnPaymentForOrder(trimmed);
  if (
    !payment ||
    payment.method !== "bank_transfer" ||
    !(CHECKOUT_BANK_PAYMENT_STATUSES as readonly string[]).includes(
      payment.status,
    )
  ) {
    return null;
  }

  try {
    const { tables } = await createAdminClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_SELLER_PROFILES,
      queries: [Query.equal("userId", order.sellerId), Query.limit(1)],
    });

    const row = result.rows[0];
    if (!row) return null;

    const record = row as unknown as Record<string, unknown>;
    const statusRaw = record.status;
    if (!isSellerStatus(statusRaw) || statusRaw !== "approved") {
      return null;
    }

    return {
      bankAccountName: asNullableString(record.bankAccountName),
      bankAccountNumber: asNullableString(record.bankAccountNumber),
      bankName: asNullableString(record.bankName),
      bankTransferNotes: asNullableString(record.bankTransferNotes),
    };
  } catch {
    return null;
  }
}
