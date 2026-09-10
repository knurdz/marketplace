import { ShopPolicyForm } from "@/components/seller/shop-policy-form";
import { PortalPageHeader } from "@/components/layout/portal-page-header";
import { requireLabel } from "@/lib/appwrite/roles";
import { getOwnSellerProfile } from "@/lib/services/seller-application";

export default async function SellerSettingsPage() {
  await requireLabel("seller");
  const profile = await getOwnSellerProfile();

  if (!profile) {
    return (
      <div className="max-w-3xl">
        <PortalPageHeader
          title="Settings"
          description="Return and shipping policies buyers see on your shop and listings."
        />
        <p
          role="alert"
          className="mt-8 rounded-md border border-border bg-card px-4 py-3 text-sm text-muted-foreground"
        >
          We could not load your shop profile. Try refreshing the page or contact
          support if this continues.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <PortalPageHeader
        title="Settings"
        description="Return and shipping policies buyers see on your shop and listings."
      />

      <div className="mt-6">
        <ShopPolicyForm
          profile={{
            returnPolicy: profile.returnPolicy,
            shippingPolicy: profile.shippingPolicy,
            slug: profile.slug,
          }}
        />
      </div>
    </div>
  );
}
