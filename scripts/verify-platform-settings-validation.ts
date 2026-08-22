/**
 * Runnable validation checks for platform settings write path.
 * Run: npx tsx scripts/verify-platform-settings-validation.ts
 */
import { PLATFORM_SETTING_KEYS } from "../lib/platform-settings/keys";
import {
  isPlatformSettingKeyDenied,
  validatePlatformSettingInput,
} from "../lib/services/platform-settings-admin";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function assertRejected(key: string, value: string): void {
  const result = validatePlatformSettingInput(key, value);
  assert(!result.ok, `Expected reject for key=${key} value=${value}`);
}

function assertAccepted(key: string, value: string): void {
  const result = validatePlatformSettingInput(key, value);
  assert(result.ok, `Expected accept for key=${key} value=${value}`);
}

assertRejected("payhere.merchant_secret", "x");
assertRejected("random.key", "x");
assertRejected("site.name", "");
assertRejected(PLATFORM_SETTING_KEYS.checkoutFeePercent, "abc");
assertRejected(PLATFORM_SETTING_KEYS.checkoutFeePercent, "101");
assertRejected(PLATFORM_SETTING_KEYS.checkoutFeePercent, "-1");
assertRejected(PLATFORM_SETTING_KEYS.featuresFreeListings, "yes");
assertRejected(PLATFORM_SETTING_KEYS.checkoutSandboxModeDisplay, "1");

assertAccepted(PLATFORM_SETTING_KEYS.siteName, "Knurdz");
assertAccepted(PLATFORM_SETTING_KEYS.checkoutFeePercent, "0");
assertAccepted(PLATFORM_SETTING_KEYS.checkoutFeePercent, "100");
assertAccepted(PLATFORM_SETTING_KEYS.checkoutFeePercent, "2.5");
assertAccepted(PLATFORM_SETTING_KEYS.featuresFreeListings, "true");
assertAccepted(PLATFORM_SETTING_KEYS.checkoutSandboxModeDisplay, "false");
assertAccepted(PLATFORM_SETTING_KEYS.checkoutBankInstructions, "Transfer to …");

assert(isPlatformSettingKeyDenied("checkout.merchant_secret"), "denylist merchant");
assert(isPlatformSettingKeyDenied("payhere.api_key"), "denylist api_key");
assert(!isPlatformSettingKeyDenied(PLATFORM_SETTING_KEYS.siteName), "site.name allowed");

console.log("platform-settings validation checks passed");
