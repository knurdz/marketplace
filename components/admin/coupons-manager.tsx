"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createCouponFormAction,
  setCouponActiveFormAction,
  type CouponActionState,
} from "@/lib/appwrite/coupon-actions";
import type { Coupon } from "@/lib/types/coupon";
import { toast } from "@/lib/ui/toast";

const initial: CouponActionState = {};

function useCouponToast(state: CouponActionState) {
  const lastToast = useRef<string | null>(null);

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
      }
    }
  }, [state]);
}

export function CouponsManager({ coupons }: { coupons: Coupon[] }) {
  const [createState, createAction, createPending] = useActionState(
    createCouponFormAction,
    initial,
  );
  useCouponToast(createState);

  return (
    <div className="space-y-12">
      <section className="rounded-md border border-border bg-card px-4 py-5">
        <h3 className="mt-2 text-lg font-bold">New coupon</h3>
        <form action={createAction} className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="code">Code</Label>
            <Input
              id="code"
              name="code"
              required
              maxLength={32}
              className="font-mono uppercase"
              placeholder="SAVE10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              name="type"
              required
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              defaultValue="percent"
            >
              <option value="percent">Percent off</option>
              <option value="fixed">Fixed amount off</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="value">Value</Label>
            <Input
              id="value"
              name="value"
              type="number"
              required
              min={0.01}
              step="0.01"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="minOrderAmount">Min order (LKR)</Label>
            <Input
              id="minOrderAmount"
              name="minOrderAmount"
              type="number"
              min={0}
              step="0.01"
              defaultValue={0}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxRedemptions">Max uses (0 = unlimited)</Label>
            <Input
              id="maxRedemptions"
              name="maxRedemptions"
              type="number"
              min={0}
              step={1}
              defaultValue={0}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="expiresAt">
              Expires at <span className="text-muted-foreground">(optional ISO)</span>
            </Label>
            <Input
              id="expiresAt"
              name="expiresAt"
              type="datetime-local"
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={createPending}>
              {createPending ? "Creating…" : "Create coupon"}
            </Button>
          </div>
        </form>
      </section>

      <section>
        <h3 className="mt-2 text-lg font-bold">All coupons</h3>
        {coupons.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">No coupons yet.</p>
        ) : (
          <ul className="mt-6 space-y-3">
            {coupons.map((coupon) => (
              <CouponRow key={coupon.$id} coupon={coupon} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function CouponRow({ coupon }: { coupon: Coupon }) {
  const [state, formAction, pending] = useActionState(
    setCouponActiveFormAction,
    initial,
  );
  useCouponToast(state);

  const valueLabel =
    coupon.type === "percent"
      ? `${coupon.value}% off`
      : `LKR ${coupon.value.toFixed(2)} off`;

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card px-4 py-4">
      <div>
        <p className="font-mono font-bold">{coupon.code}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {valueLabel}
          {coupon.minOrderAmount > 0
            ? ` · min LKR ${coupon.minOrderAmount.toFixed(2)}`
            : ""}
          {" · "}
          used {coupon.redemptionCount}
          {coupon.maxRedemptions > 0 ? ` / ${coupon.maxRedemptions}` : ""}
          {" · "}
          {coupon.active ? "Active" : "Inactive"}
        </p>
      </div>
      <form action={formAction}>
        <input type="hidden" name="couponId" value={coupon.$id} />
        <input type="hidden" name="active" value={coupon.active ? "false" : "true"} />
        <Button type="submit" variant="outline" size="sm" disabled={pending}>
          {pending
            ? "Saving…"
            : coupon.active
              ? "Deactivate"
              : "Activate"}
        </Button>
      </form>
    </li>
  );
}
