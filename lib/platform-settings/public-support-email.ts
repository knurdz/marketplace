import { eq } from "drizzle-orm";
import { hasDatabaseConfig } from "@/lib/config/app";
import { getDb } from "@/lib/db/client";
import { platformSettings } from "@/lib/db/schema";
import { PLATFORM_SETTING_KEYS } from "@/lib/platform-settings/keys";

const DEFAULT_SUPPORT_EMAIL = "marketplace@knurdz.org";

function isValidSupportEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Public support contact (no signed-in session required). */
export async function getPublicSupportEmail(): Promise<string> {
  if (!hasDatabaseConfig()) {
    return DEFAULT_SUPPORT_EMAIL;
  }
  try {
    const rows = await getDb()
      .select({ value: platformSettings.value })
      .from(platformSettings)
      .where(eq(platformSettings.key, PLATFORM_SETTING_KEYS.siteSupportEmail))
      .limit(1);
    const raw = rows[0]?.value?.trim();
    if (raw && isValidSupportEmail(raw)) {
      return raw;
    }
  } catch {
    // fall through to default
  }
  return DEFAULT_SUPPORT_EMAIL;
}
