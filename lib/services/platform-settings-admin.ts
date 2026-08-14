import { ID, Query } from "node-appwrite";
import {
  DATABASE_ID,
  TABLE_AUDIT_LOGS,
  TABLE_PLATFORM_SETTINGS,
  hasAppwritePublicConfig,
} from "@/lib/appwrite/config";
import { ROLE_LABELS, userHasLabel } from "@/lib/appwrite/roles";
import { getLoggedInUser } from "@/lib/appwrite/session";
import { createAdminClient, createSessionClient } from "@/lib/appwrite/server";
import {
  ALL_PLATFORM_SETTING_KEYS,
  PLATFORM_SETTING_KEYS,
  type PlatformSettingKey,
} from "@/lib/platform-settings/keys";
import type { PlatformSetting } from "@/lib/types";
import {
  asPlatformSetting,
  normalizePlatformSettingKey,
} from "./platform-settings";

const VALUE_MAX = 4000;
const DESCRIPTION_MAX = 500;

const KEY_DENYLIST_SUBSTRINGS = [
  "secret",
  "merchant",
  "api_key",
  "password",
  "token",
  "private_key",
] as const;

const BOOLEAN_KEYS: readonly PlatformSettingKey[] = [
  PLATFORM_SETTING_KEYS.featuresFreeListings,
  PLATFORM_SETTING_KEYS.checkoutSandboxModeDisplay,
];

export type PlatformSettingMutationResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

export type PlatformSettingValidationResult =
  | { ok: false; error: string }
  | { ok: true; key: PlatformSettingKey; value: string };

export type PlatformSettingListItem = {
  key: PlatformSettingKey;
  setting: PlatformSetting | null;
};

function isAllowlistedKey(key: string): key is PlatformSettingKey {
  return (ALL_PLATFORM_SETTING_KEYS as readonly string[]).includes(key);
}

function keyMatchesDenylist(key: string): boolean {
  const lower = key.toLowerCase();
  return KEY_DENYLIST_SUBSTRINGS.some((sub) => lower.includes(sub));
}

function validateBooleanValue(
  value: string,
): PlatformSettingValidationResult | null {
  if (value !== "true" && value !== "false") {
    return {
      ok: false,
      error: 'Boolean settings must be exactly "true" or "false".',
    };
  }
  return null;
}

function validateFeePercent(
  value: string,
): PlatformSettingValidationResult | null {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return { ok: false, error: "Fee percent must be a number." };
  }
  if (n < 0 || n > 100) {
    return { ok: false, error: "Fee percent must be between 0 and 100." };
  }
  return null;
}

/** Pure write validation (allowlist first, then denylist, then value rules). */
export function validatePlatformSettingInput(
  key: string,
  value: string,
): PlatformSettingValidationResult {
  const normalized = normalizePlatformSettingKey(key);
  if (!normalized || !isAllowlistedKey(normalized)) {
    return { ok: false, error: "Setting key is not allowed." };
  }

  if (keyMatchesDenylist(normalized)) {
    return { ok: false, error: "Setting key is not allowed." };
  }

  const trimmedValue = typeof value === "string" ? value.trim() : "";
  if (!trimmedValue) {
    return { ok: false, error: "Value is required." };
  }
  if (trimmedValue.length > VALUE_MAX) {
    return {
      ok: false,
      error: `Value must be at most ${VALUE_MAX} characters.`,
    };
  }

  if (BOOLEAN_KEYS.includes(normalized)) {
    const boolErr = validateBooleanValue(trimmedValue);
    if (boolErr) return boolErr;
  }

  if (normalized === PLATFORM_SETTING_KEYS.checkoutFeePercent) {
    const feeErr = validateFeePercent(trimmedValue);
    if (feeErr) return feeErr;
  }

  return { ok: true, key: normalized, value: trimmedValue };
}

/** Defense-in-depth: reject keys containing sensitive substrings. */
export function isPlatformSettingKeyDenied(key: string): boolean {
  return keyMatchesDenylist(key);
}

async function writeAuditLog(params: {
  actorId: string;
  event: string;
  resourceType: string;
  resourceId: string;
  meta: Record<string, string>;
}): Promise<void> {
  const { tables } = await createAdminClient();
  await tables.createRow({
    databaseId: DATABASE_ID,
    tableId: TABLE_AUDIT_LOGS,
    rowId: ID.unique(),
    data: {
      actorId: params.actorId,
      event: params.event.slice(0, 128),
      resourceType: params.resourceType.slice(0, 64),
      resourceId: params.resourceId,
      meta: JSON.stringify(params.meta).slice(0, 4000),
    },
    permissions: [],
  });
}

async function assertAdminUser(): Promise<
  { ok: true; userId: string } | { ok: false; error: string }
> {
  const user = await getLoggedInUser();
  if (!user) {
    return { ok: false, error: "Unauthorized" };
  }
  if (!userHasLabel(user, ROLE_LABELS.admin)) {
    return { ok: false, error: "Unauthorized" };
  }
  return { ok: true, userId: user.$id };
}

async function findSettingByKey(
  key: string,
): Promise<PlatformSetting | null> {
  const { tables } = await createSessionClient();
  const result = await tables.listRows({
    databaseId: DATABASE_ID,
    tableId: TABLE_PLATFORM_SETTINGS,
    queries: [Query.equal("key", key), Query.limit(1)],
  });
  const row = result.rows[0];
  if (!row) return null;
  return asPlatformSetting(row as unknown as Record<string, unknown>);
}

/**
 * Admin-scoped list of all allowlisted platform settings.
 * Iterates ALL_PLATFORM_SETTING_KEYS — stray DB rows never appear.
 */
export async function listAllPlatformSettings(): Promise<
  PlatformSettingListItem[] | { error: string }
> {
  if (!hasAppwritePublicConfig()) {
    return { error: "Appwrite is not configured." };
  }

  const auth = await assertAdminUser();
  if (!auth.ok) return { error: auth.error };

  try {
    const { tables } = await createSessionClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_PLATFORM_SETTINGS,
      queries: [
        Query.equal("key", [...ALL_PLATFORM_SETTING_KEYS]),
        Query.limit(ALL_PLATFORM_SETTING_KEYS.length),
      ],
    });

    const byKey = new Map<string, PlatformSetting>();
    for (const row of result.rows) {
      const setting = asPlatformSetting(row as unknown as Record<string, unknown>);
      if (setting) byKey.set(setting.key, setting);
    }

    return ALL_PLATFORM_SETTING_KEYS.map((key) => ({
      key,
      setting: byKey.get(key) ?? null,
    }));
  } catch {
    return { error: "Failed to load platform settings." };
  }
}

export async function updatePlatformSettingCore(
  actorId: string,
  key: string,
  value: string,
  description?: string,
): Promise<PlatformSettingMutationResult> {
  const validated = validatePlatformSettingInput(key, value);
  if (!validated.ok) return validated;

  const { key: normalized, value: trimmedValue } = validated;

  const trimmedDescription =
    description !== undefined && description !== null
      ? String(description).trim().slice(0, DESCRIPTION_MAX)
      : undefined;

  let existing: PlatformSetting | null = null;
  try {
    existing = await findSettingByKey(normalized);
  } catch {
    return { ok: false, error: "Failed to load existing setting." };
  }

  const data: Record<string, string> = { key: normalized, value: trimmedValue };
  if (trimmedDescription !== undefined) {
    data.description = trimmedDescription;
  }

  const { tables } = await createSessionClient();
  try {
    if (existing) {
      await tables.updateRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_PLATFORM_SETTINGS,
        rowId: existing.$id,
        data,
      });
    } else {
      await tables.createRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_PLATFORM_SETTINGS,
        rowId: ID.unique(),
        data,
      });
    }
  } catch {
    return { ok: false, error: "Failed to save platform setting." };
  }

  const meta: Record<string, string> = { newValue: trimmedValue };
  if (existing) {
    meta.previousValue = existing.value;
  }

  try {
    await writeAuditLog({
      actorId,
      event: "platform_setting.updated",
      resourceType: "platform_setting",
      resourceId: normalized,
      meta,
    });
  } catch {
    return {
      ok: false,
      error: "Setting saved but audit log failed. Please notify an operator.",
    };
  }

  return {
    ok: true,
    message: `Setting "${normalized}" saved.`,
  };
}
