"use client";

import { useActionState, useEffect, useRef } from "react";
import { RotateCcw, Truck, type LucideIcon } from "lucide-react";
import {
  updateOwnShopPolicies,
  type ShopProfileActionState,
} from "@/lib/appwrite/seller-application-actions";
import type { SellerProfile } from "@/lib/types";
import { toast } from "@/lib/ui/toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const initial: ShopProfileActionState = {};

const policyTextareaClassName =
  "min-h-[min(280px,40vh)] w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-sm leading-relaxed text-foreground shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50";

function useActionToasts(state: ShopProfileActionState) {
  const last = useRef<string | null>(null);
  useEffect(() => {
    const key = state.error
      ? `e:${state.error}`
      : state.success
        ? `s:${state.success}`
        : null;
    if (!key || key === last.current) return;
    last.current = key;
    if (state.error) toast.error(state.error);
    else if (state.success) toast.success(state.success);
  }, [state.error, state.success]);
}

type ShopPolicyFormProps = {
  profile: Pick<
    SellerProfile,
    "returnPolicy" | "shippingPolicy" | "slug" | "shopName"
  >;
};

function PolicyBlock({
  id,
  name,
  title,
  description,
  icon: Icon,
  defaultValue,
  placeholder,
  pending,
}: {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: LucideIcon;
  defaultValue: string;
  placeholder: string;
  pending: boolean;
}) {
  const hasContent = defaultValue.trim().length > 0;

  return (
    <section className="flex min-h-0 flex-col gap-3">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg border border-border",
            hasContent ? "bg-accent/10 text-accent" : "bg-muted/30 text-muted-foreground",
          )}
        >
          <Icon className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            <span
              className={cn(
                "rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                hasContent
                  ? "border-accent/30 bg-accent/10 text-accent"
                  : "border-border bg-muted/20 text-muted-foreground",
              )}
            >
              {hasContent ? "Visible" : "Hidden"}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={id} className="sr-only">
          {title}
        </Label>
        <textarea
          id={id}
          name={name}
          rows={10}
          maxLength={2000}
          defaultValue={defaultValue}
          placeholder={placeholder}
          disabled={pending}
          className={policyTextareaClassName}
        />
        <p className="text-xs text-muted-foreground">Up to 2,000 characters</p>
      </div>
    </section>
  );
}

export function ShopPolicyForm({ profile }: ShopPolicyFormProps) {
  const [state, action, pending] = useActionState(updateOwnShopPolicies, initial);
  useActionToasts(state);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
      <div className="border-b border-border px-6 py-4">
        <p className="text-sm font-medium text-foreground">Shop policies</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Leave a field empty to hide that section on{" "}
          <span className="font-medium text-foreground">/shop/{profile.slug}</span>{" "}
          and your listings. Payment and delivery are arranged off-platform.
        </p>
      </div>

      <form action={action}>
        <div className="px-6 py-6">
          {state.error ? (
            <p
              role="alert"
              className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
            >
              {state.error}
            </p>
          ) : null}

          <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
            <PolicyBlock
              id="returnPolicy"
              name="returnPolicy"
              title="Return policy"
              description="Refunds, exchanges, and who covers return shipping."
              icon={RotateCcw}
              defaultValue={profile.returnPolicy ?? ""}
              placeholder="e.g. Returns accepted within 7 days if unused and in original packaging."
              pending={pending}
            />
            <PolicyBlock
              id="shippingPolicy"
              name="shippingPolicy"
              title="Shipping policy"
              description="Dispatch time, carriers, and regions you deliver to."
              icon={Truck}
              defaultValue={profile.shippingPolicy ?? ""}
              placeholder="e.g. Ships within 2 business days island-wide via courier."
              pending={pending}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border bg-muted/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Changes apply to your public shop and active listings.
          </p>
          <Button
            type="submit"
            variant="info"
            size="sm"
            className="shrink-0"
            disabled={pending}
          >
            {pending ? "Saving…" : "Save policies"}
          </Button>
        </div>
      </form>
    </div>
  );
}
