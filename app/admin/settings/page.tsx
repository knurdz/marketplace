import { PlatformSettingsManager } from "@/components/admin/platform-settings-manager";
import { listAllPlatformSettings } from "@/lib/services/platform-settings-admin";

export default async function AdminSettingsPage() {
  const result = await listAllPlatformSettings();

  if ("error" in result) {
    return (
      <div className="mx-auto max-w-3xl">
        <h2 className="mt-3 text-3xl font-bold tracking-tight">
          Platform settings
        </h2>
        <p className="mt-4 text-sm text-destructive">{result.error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="mt-3 text-3xl font-bold tracking-tight">
        Platform settings
      </h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Edit public-safe platform configuration. All values are readable by any
        signed-in user — never store secrets here. Sandbox banner is display-only;
        PayHere sandbox mode is controlled by Function env.
      </p>

      <PlatformSettingsManager items={result} />
    </div>
  );
}
