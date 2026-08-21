import { ID, Query } from "node-appwrite";
import {
  DATABASE_ID,
  TABLE_COUPON_REDEMPTIONS,
  TABLE_COUPONS,
  hasAppwritePublicConfig,
} from "@/lib/appwrite/config";
import { createAdminClient } from "@/lib/appwrite/server";
import type { Coupon, CouponType } from "@/lib/types/coupon";
import { isCouponType } from "@/lib/types/coupon";

function asNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return value.length > 0 ? value : null;
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function asBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  return fallback;
}

export function asCoupon(row: Record<string, unknown>): Coupon | null {
  const $id = asNullableString(row.$id);
  const code = asNullableString(row.code);
  const typeRaw = row.type;
  const createdBy = asNullableString(row.createdBy);
  if (!$id || !code || !isCouponType(typeRaw) || !createdBy) return null;

  const expiresAt = asNullableString(row.expiresAt);

  return {
    $id,
    code,
    type: typeRaw,
    value: Math.max(0, asNumber(row.value)),
    active: asBoolean(row.active, false),
    maxRedemptions: Math.max(0, Math.floor(asNumber(row.maxRedemptions))),
    redemptionCount: Math.max(0, Math.floor(asNumber(row.redemptionCount))),
    minOrderAmount: Math.max(0, asNumber(row.minOrderAmount)),
    expiresAt,
    createdBy,
  };
}

/** Uppercase alphanumeric + hyphen/underscore; max 32. */
export function normalizeCouponCode(raw: string): string | null {
  const trimmed = raw.trim().toUpperCase().replace(/\s+/g, "");
  if (!trimmed || trimmed.length > 32) return null;
  if (!/^[A-Z0-9_-]+$/.test(trimmed)) return null;
  return trimmed;
}

function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export function calculateCouponDiscount(
  coupon: Coupon,
  subtotal: number,
): number {
  const base = Math.max(0, subtotal);
  if (base === 0) return 0;

  let discount = 0;
  if (coupon.type === "percent") {
    const pct = Math.min(100, Math.max(0, coupon.value));
    discount = roundMoney((base * pct) / 100);
  } else {
    discount = roundMoney(Math.min(base, coupon.value));
  }

  return Math.min(base, Math.max(0, discount));
}

export type CouponValidationResult =
  | {
      ok: true;
      coupon: Coupon;
      discountAmount: number;
      payableTotal: number;
      code: string;
    }
  | { ok: false; error: string };

export async function validateCouponForCheckout(params: {
  code: string;
  subtotal: number;
}): Promise<CouponValidationResult> {
  if (!hasAppwritePublicConfig() || !process.env.APPWRITE_API_KEY?.trim()) {
    return { ok: false, error: "Coupons are not available right now." };
  }

  const normalized = normalizeCouponCode(params.code);
  if (!normalized) {
    return { ok: false, error: "Enter a valid coupon code." };
  }

  const subtotal = Math.max(0, params.subtotal);
  if (subtotal <= 0) {
    return { ok: false, error: "Coupon does not apply to free orders." };
  }

  try {
    const { tables } = await createAdminClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_COUPONS,
      queries: [Query.equal("code", normalized), Query.limit(1)],
    });

    const row = result.rows[0] as Record<string, unknown> | undefined;
    const coupon = row ? asCoupon(row) : null;
    if (!coupon) {
      return { ok: false, error: "Coupon code is not valid." };
    }

    if (!coupon.active) {
      return { ok: false, error: "This coupon is no longer active." };
    }

    if (coupon.expiresAt) {
      const expires = Date.parse(coupon.expiresAt);
      if (Number.isFinite(expires) && Date.now() > expires) {
        return { ok: false, error: "This coupon has expired." };
      }
    }

    if (
      coupon.maxRedemptions > 0 &&
      coupon.redemptionCount >= coupon.maxRedemptions
    ) {
      return { ok: false, error: "This coupon has reached its usage limit." };
    }

    if (subtotal < coupon.minOrderAmount) {
      return {
        ok: false,
        error: `Order total must be at least ${coupon.minOrderAmount.toFixed(2)} to use this coupon.`,
      };
    }

    const discountAmount = calculateCouponDiscount(coupon, subtotal);
    const payableTotal = roundMoney(subtotal - discountAmount);

    return {
      ok: true,
      coupon,
      discountAmount,
      payableTotal,
      code: coupon.code,
    };
  } catch {
    return { ok: false, error: "Could not validate coupon. Try again." };
  }
}

/** Record redemption after order row exists (admin SDK; idempotent on orderId). */
export async function recordCouponRedemption(params: {
  couponId: string;
  orderId: string;
  buyerId: string;
  discountAmount: number;
}): Promise<void> {
  if (!process.env.APPWRITE_API_KEY?.trim()) return;

  const { tables } = await createAdminClient();

  try {
    const existing = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_COUPON_REDEMPTIONS,
      queries: [Query.equal("orderId", params.orderId), Query.limit(1)],
    });
    if (existing.rows.length > 0) return;
  } catch {
    return;
  }

  try {
    await tables.createRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_COUPON_REDEMPTIONS,
      rowId: ID.unique(),
      data: {
        couponId: params.couponId,
        orderId: params.orderId,
        buyerId: params.buyerId,
        discountAmount: params.discountAmount,
      },
      permissions: [],
    });
  } catch {
    return;
  }

  try {
    const couponRow = await tables.getRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_COUPONS,
      rowId: params.couponId,
    });
    const coupon = asCoupon(couponRow as unknown as Record<string, unknown>);
    if (!coupon) return;

    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_COUPONS,
      rowId: params.couponId,
      data: { redemptionCount: coupon.redemptionCount + 1 },
    });
  } catch {
    /* redemption row is source of truth for order; count may lag */
  }
}

export async function listCouponsAdmin(): Promise<Coupon[]> {
  if (!process.env.APPWRITE_API_KEY?.trim()) return [];

  try {
    const { tables } = await createAdminClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_COUPONS,
      queries: [Query.orderDesc("$createdAt"), Query.limit(100)],
    });

    const out: Coupon[] = [];
    for (const row of result.rows) {
      const coupon = asCoupon(row as Record<string, unknown>);
      if (coupon) out.push(coupon);
    }
    return out;
  } catch {
    return [];
  }
}

export type CreateCouponInput = {
  code: string;
  type: CouponType;
  value: number;
  maxRedemptions?: number;
  minOrderAmount?: number;
  expiresAt?: string | null;
};

export type CouponAdminResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

export async function createCouponAdmin(
  adminUserId: string,
  input: CreateCouponInput,
): Promise<CouponAdminResult> {
  const code = normalizeCouponCode(input.code);
  if (!code) {
    return { ok: false, error: "Invalid coupon code." };
  }
  if (!isCouponType(input.type)) {
    return { ok: false, error: "Invalid coupon type." };
  }
  if (input.value <= 0) {
    return { ok: false, error: "Value must be greater than zero." };
  }
  if (input.type === "percent" && input.value > 100) {
    return { ok: false, error: "Percent cannot exceed 100." };
  }

  const { tables } = await createAdminClient();
  try {
    const dup = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_COUPONS,
      queries: [Query.equal("code", code), Query.limit(1)],
    });
    if (dup.rows.length > 0) {
      return { ok: false, error: "Coupon code already exists." };
    }

    await tables.createRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_COUPONS,
      rowId: ID.unique(),
      data: {
        code,
        type: input.type,
        value: input.value,
        active: true,
        maxRedemptions: Math.max(0, Math.floor(input.maxRedemptions ?? 0)),
        redemptionCount: 0,
        minOrderAmount: Math.max(0, input.minOrderAmount ?? 0),
        expiresAt: input.expiresAt?.trim() || null,
        createdBy: adminUserId,
      },
      permissions: [],
    });

    return { ok: true, message: `Coupon ${code} created.` };
  } catch {
    return { ok: false, error: "Failed to create coupon." };
  }
}

export async function setCouponActiveAdmin(
  couponId: string,
  active: boolean,
): Promise<CouponAdminResult> {
  const trimmed = couponId?.trim();
  if (!trimmed) return { ok: false, error: "Missing coupon." };

  const { tables } = await createAdminClient();
  try {
    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_COUPONS,
      rowId: trimmed,
      data: { active },
    });
    return {
      ok: true,
      message: active ? "Coupon activated." : "Coupon deactivated.",
    };
  } catch {
    return { ok: false, error: "Failed to update coupon." };
  }
}
