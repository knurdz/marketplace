"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  updatePlatformSettingFormAction,
  type PlatformSettingActionState,
} from "@/lib/appwrite/platform-settings-actions";
import { PLATFORM_SETTING_KEYS } from "@/lib/platform-settings/keys";
import type { PlatformSettingListItem } from "@/lib/services/platform-settings-admin";
import { toast } from "@/lib/ui/toast";

const initial: PlatformSettingActionState = {};

const BOOLEAN_KEYS = new Set<string>([
  PLATFORM_SETTING_KEYS.featuresFreeListings,
  PLATFORM_SETTING_KEYS.checkoutSandboxModeDisplay,
]);

const KEY_LABELS: Record<string, string> = {
  [PLATFORM_SETTING_KEYS.siteName]: "Site name",
  [PLATFORM_SETTING_KEYS.siteSupportEmail]: "Support email",
  [PLATFORM_SETTING_KEYS.checkoutCurrencyDefault]: "Default currency",
  [PLATFORM_SETTING_KEYS.checkoutBankInstructions]: "Bank transfer instructions",
  [PLATFORM_SETTING_KEYS.checkoutSandboxModeDisplay]: "Sandbox mode banner",
  [PLATFORM_SETTING_KEYS.checkoutFeePercent]: "Platform fee (%)",
  [PLATFORM_SETTING_KEYS.featuresFreeListings]: "Free listings enabled",
};

const KEY_HELP: Record<string, string> = {
  [PLATFORM_SETTING_KEYS.checkoutSandboxModeDisplay]:
    "Shows a public “Sandbox — test mode” banner to signed-in users. Does not control PayHere Function env.",
  [PLATFORM_SETTING_KEYS.checkoutFeePercent]:
    "Platform fee percentage (0–100). Stored as a numeric string.",
  [PLATFORM_SETTING_KEYS.checkoutBankInstructions]:
    "Buyer-facing bank transfer copy shown at checkout.",
};

function useSettingToast(state: PlatformSettingActionState) {
  const lastToast = useRef<string | null>(null);
  const router = useRouter();

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
        router.refresh();
      }
    }
  }, [state, router]);
}

function SettingFieldForm({ item }: { item: PlatformSettingListItem }) {
  const [state, formAction, pending] = useActionState(
    updatePlatformSettingFormAction,
    initial,
  );
  useSettingToast(state);

  const currentValue = item.setting?.value ?? "";
  const description =
    item.setting?.description ?? KEY_HELP[item.key] ?? undefined;
  const label = KEY_LABELS[item.key] ?? item.key;
  const isBoolean = BOOLEAN_KEYS.has(item.key);
  const isFee = item.key === PLATFORM_SETTING_KEYS.checkoutFeePercent;
  const isBankInstructions =
    item.key === PLATFORM_SETTING_KEYS.checkoutBankInstructions;

  const [boolChecked, setBoolChecked] = useState(currentValue === "true");

  useEffect(() => {
    setBoolChecked(currentValue === "true");
  }, [currentValue]);

  return (
    <form
      action={formAction}
      className="rounded-md border border-border bg-card px-4 py-5"
    >
      <input type="hidden" name="key" value={item.key} />
      {description ? (
        <input type="hidden" name="description" value={description} />
      ) : null}

      <p className="font-mono text-xs text-muted-foreground">{item.key}</p>
      <Label htmlFor={`setting-${item.key}`} className="mt-1 text-lg font-bold">
        {label}
      </Label>
      {description ? (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      ) : null}

      <div className="mt-4">
        {isBoolean ? (
          <div className="flex items-center gap-3">
            <input type="hidden" name="value" value={boolChecked ? "true" : "false"} />
            <input
              id={`setting-${item.key}`}
              type="checkbox"
              checked={boolChecked}
              onChange={(e) => setBoolChecked(e.target.checked)}
              className="size-4 rounded border border-border"
            />
            <span className="text-sm text-muted-foreground">
              {boolChecked ? "Enabled" : "Disabled"}
            </span>
          </div>
        ) : isFee ? (
          <Input
            id={`setting-${item.key}`}
            name="value"
            type="number"
            min={0}
            max={100}
            step="0.01"
            defaultValue={currentValue}
            required
          />
        ) : isBankInstructions ? (
          <textarea
            id={`setting-${item.key}`}
            name="value"
            defaultValue={currentValue}
            required
            rows={5}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        ) : (
          <Input
            id={`setting-${item.key}`}
            name="value"
            type="text"
            defaultValue={currentValue}
            required
          />
        )}
      </div>

      {!item.setting ? (
        <p className="mt-2 font-mono text-xs text-accent">
          Not set yet — save to create this row.
        </p>
      ) : null}

      <Button type="submit" className="mt-4" disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}

type PlatformSettingsManagerProps = {
  items: PlatformSettingListItem[];
};

export function PlatformSettingsManager({ items }: PlatformSettingsManagerProps) {
  return (
    <div className="mt-10 space-y-4">
      {items.map((item) => (
        <SettingFieldForm key={item.key} item={item} />
      ))}
    </div>
  );
}
