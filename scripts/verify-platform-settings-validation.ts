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

assertRejected("checkout.merchant_secret", "x");
assertRejected("random.key", "x");
assertRejected("site.name", "");
assertRejected(PLATFORM_SETTING_KEYS.featuresFreeListings, "yes");

assertAccepted(PLATFORM_SETTING_KEYS.siteName, "Knurdz");
assertAccepted(PLATFORM_SETTING_KEYS.featuresFreeListings, "true");
assertAccepted(PLATFORM_SETTING_KEYS.siteSupportEmail, "support@knurdz.org");

assert(isPlatformSettingKeyDenied("checkout.merchant_secret"), "denylist merchant");
assert(isPlatformSettingKeyDenied("billing.api_key"), "denylist api_key");
assert(!isPlatformSettingKeyDenied(PLATFORM_SETTING_KEYS.siteName), "site.name allowed");

console.log("platform-settings validation checks passed");
