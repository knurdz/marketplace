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
]);

const KEY_LABELS: Record<string, string> = {
  [PLATFORM_SETTING_KEYS.siteName]: "Site name",
  [PLATFORM_SETTING_KEYS.siteSupportEmail]: "Support email",
  [PLATFORM_SETTING_KEYS.featuresFreeListings]: "Free listings enabled",
};

const KEY_HELP: Record<string, string> = {
  [PLATFORM_SETTING_KEYS.featuresFreeListings]:
    "When true, sellers may list products at price 0.",
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

function SettingRow({ item }: { item: PlatformSettingListItem }) {
  const [state, formAction, pending] = useActionState(
    updatePlatformSettingFormAction,
    initial,
  );
  useSettingToast(state);
  const [value, setValue] = useState(item.setting?.value ?? "");
  const isBoolean = BOOLEAN_KEYS.has(item.key);

  return (
    <form
      action={formAction}
      className="space-y-3 rounded-lg border border-border p-4"
    >
      <input type="hidden" name="key" value={item.key} />
      <div>
        <Label htmlFor={`setting-${item.key}`}>
          {KEY_LABELS[item.key] ?? item.key}
        </Label>
        {KEY_HELP[item.key] ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {KEY_HELP[item.key]}
          </p>
        ) : null}
      </div>
      {isBoolean ? (
        <select
          id={`setting-${item.key}`}
          name="value"
          className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          value={value === "true" ? "true" : "false"}
          onChange={(e) => setValue(e.target.value)}
        >
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      ) : (
        <Input
          id={`setting-${item.key}`}
          name="value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      )}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}

export function PlatformSettingsManager({
  items,
}: {
  items: PlatformSettingListItem[];
}) {
  return (
    <div className="mt-6 grid gap-4">
      {items.map((item) => (
        <SettingRow key={item.key} item={item} />
      ))}
    </div>
  );
}
