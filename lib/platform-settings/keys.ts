/**
 * Canonical platform_settings keys.
 * Values are strings in TablesDB; parse JSON flags via parsePlatformSettingJson.
 */
export const PLATFORM_SETTING_KEYS = {
  siteName: "site.name",
  siteSupportEmail: "site.support_email",
  featuresFreeListings: "features.free_listings",
} as const;

export type PlatformSettingKey =
  (typeof PLATFORM_SETTING_KEYS)[keyof typeof PLATFORM_SETTING_KEYS];

export const ALL_PLATFORM_SETTING_KEYS: readonly PlatformSettingKey[] =
  Object.values(PLATFORM_SETTING_KEYS);
