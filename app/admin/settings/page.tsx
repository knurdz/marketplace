import { PlatformSettingsManager } from "@/components/admin/platform-settings-manager";
import { PortalPageHeader } from "@/components/layout/portal-page-header";
import { listAllPlatformSettings } from "@/lib/services/platform-settings-admin";

export default async function AdminSettingsPage() {
  const result = await listAllPlatformSettings();

  if ("error" in result) {
    return (
      <div className="max-w-3xl">
        <PortalPageHeader title="Platform settings" />
        <p className="mt-4 text-sm text-destructive">{result.error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <PortalPageHeader
        title="Platform settings"
        description="Edit public-safe platform configuration. All values are readable by any signed-in user. Never store secrets here. Sandbox banner is display-only; PayHere sandbox mode is controlled by Function env."
      />
      <div className="mt-6">
        <PlatformSettingsManager items={result} />
      </div>
    </div>
  );
}
