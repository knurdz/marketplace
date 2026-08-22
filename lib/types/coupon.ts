export const COUPON_TYPES = ["percent", "fixed"] as const;

export type CouponType = (typeof COUPON_TYPES)[number];

export function isCouponType(value: unknown): value is CouponType {
  return (
    typeof value === "string" &&
    (COUPON_TYPES as readonly string[]).includes(value)
  );
}

export type Coupon = {
  $id: string;
  code: string;
  type: CouponType;
  value: number;
  active: boolean;
  maxRedemptions: number;
  redemptionCount: number;
  minOrderAmount: number;
  expiresAt: string | null;
  createdBy: string;
};

export type CouponRedemption = {
  $id: string;
  couponId: string;
  orderId: string;
  buyerId: string;
  discountAmount: number;
};
