import { Query } from "node-appwrite";
import {
  DATABASE_ID,
  TABLE_PLATFORM_SETTINGS,
  hasAppwritePublicConfig,
} from "@/lib/appwrite/config";
import { PLATFORM_SETTING_KEYS } from "@/lib/platform-settings/keys";
import { createSessionClient } from "@/lib/appwrite/server";
import type { PlatformSetting } from "@/lib/types";

const KEY_MAX = 128;
const LIST_CAP = 50;

/** Normalize a settings key; empty/invalid → null. */
export function normalizePlatformSettingKey(
  raw: string | null | undefined,
): string | null {
  if (raw == null) return null;
  const key = raw.trim().slice(0, KEY_MAX);
  return key.length > 0 ? key : null;
}

function asNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return value.length > 0 ? value : null;
}

/** Map a TablesDB row; returns null if required fields missing. */
export function asPlatformSetting(
  row: Record<string, unknown>,
): PlatformSetting | null {
  const $id = asNullableString(row.$id);
  const key = normalizePlatformSettingKey(asNullableString(row.key));
  const value = typeof row.value === "string" ? row.value : null;
  if (!$id || !key || value === null) return null;

  return {
    $id,
    key,
    value: value.slice(0, 4000),
    description: asNullableString(row.description),
  };
}

/**
 * Safe JSON.parse for settings values. On failure returns `fallback`.
 */
export function parsePlatformSettingJson<T>(
  value: string | null | undefined,
  fallback: T,
): T {
  if (value == null || value.trim() === "") return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

async function withSessionTables(): Promise<{
  tables: Awaited<ReturnType<typeof createSessionClient>>["tables"];
} | null> {
  if (!hasAppwritePublicConfig()) return null;
  try {
    const { tables } = await createSessionClient();
    return { tables };
  } catch {
    // No session or Appwrite unreachable — guests cannot read (table: read(users)).
    return null;
  }
}

/**
 * Read one platform setting by key (signed-in users only).
 * Missing key / no session → null.
 */
export async function getPlatformSetting(
  key: string,
): Promise<PlatformSetting | null> {
  const normalized = normalizePlatformSettingKey(key);
  if (!normalized) return null;

  const client = await withSessionTables();
  if (!client) return null;

  try {
    const result = await client.tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_PLATFORM_SETTINGS,
      queries: [Query.equal("key", normalized), Query.limit(1)],
    });
    const row = result.rows[0];
    if (!row) return null;
    return asPlatformSetting(row as unknown as Record<string, unknown>);
  } catch {
    return null;
  }
}

/**
 * Whether sellers may create/update listings with price = 0.
 * Missing setting or any value other than "false" → enabled (MVP default).
 */
export async function areFreeListingsEnabled(): Promise<boolean> {
  const setting = await getPlatformSetting(
    PLATFORM_SETTING_KEYS.featuresFreeListings,
  );
  return setting?.value.trim() !== "false";
}

/**
 * Read settings as `key → value`.
 * - With `keys`: fetch those keys only (parallel / OR query).
 * - Without: list up to LIST_CAP rows for the signed-in user.
 * No session → {}.
 */
export async function getPlatformSettings(
  keys?: readonly string[],
): Promise<Record<string, string>> {
  const client = await withSessionTables();
  if (!client) return {};

  const normalizedKeys =
    keys
      ?.map((k) => normalizePlatformSettingKey(k))
      .filter((k): k is string => k != null) ?? null;

  if (normalizedKeys && normalizedKeys.length === 0) return {};

  try {
    const queries =
      normalizedKeys && normalizedKeys.length > 0
        ? [
            Query.equal(
              "key",
              normalizedKeys.length === 1
                ? normalizedKeys[0]!
                : [...normalizedKeys],
            ),
            Query.limit(Math.min(normalizedKeys.length, LIST_CAP)),
          ]
        : [Query.limit(LIST_CAP)];

    const result = await client.tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_PLATFORM_SETTINGS,
      queries,
    });

    const out: Record<string, string> = {};
    for (const row of result.rows) {
      const setting = asPlatformSetting(
        row as unknown as Record<string, unknown>,
      );
      if (setting) out[setting.key] = setting.value;
    }
    return out;
  } catch {
    return {};
  }
}
