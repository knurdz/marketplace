/**
 * Canonical platform_settings keys (Members 2–4).
 * Values are strings in TablesDB; parse JSON flags via parsePlatformSettingJson.
 */
export const PLATFORM_SETTING_KEYS = {
  siteName: "site.name",
  siteSupportEmail: "site.support_email",
  checkoutCurrencyDefault: "checkout.currency_default",
  checkoutBankInstructions: "checkout.bank_instructions",
  checkoutSandboxModeDisplay: "checkout.sandbox_mode_display",
  checkoutFeePercent: "checkout.fee_percent",
  featuresFreeListings: "features.free_listings",
} as const;

export type PlatformSettingKey =
  (typeof PLATFORM_SETTING_KEYS)[keyof typeof PLATFORM_SETTING_KEYS];

export const ALL_PLATFORM_SETTING_KEYS: readonly PlatformSettingKey[] =
  Object.values(PLATFORM_SETTING_KEYS);
