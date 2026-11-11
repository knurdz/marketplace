import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { ShopPolicyForm } from "@/components/seller/shop-policy-form";
import { PortalPageHeader } from "@/components/layout/portal-page-header";
import { Button } from "@/components/ui/button";
import { requireLabel } from "@/lib/backend/roles";
import { getOwnSellerProfile } from "@/lib/services/seller-application";

export default async function SellerSettingsPage() {
  await requireLabel("seller");
  const profile = await getOwnSellerProfile();

  if (!profile) {
    return (
      <div className="w-full">
        <PortalPageHeader
          title="Settings"
          description="Return and shipping policies for your storefront."
        />
        <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card shadow-xs">
          <p role="alert" className="px-6 py-5 text-sm text-muted-foreground">
            We could not load your shop profile. Try refreshing the page or
            contact support if this continues.
          </p>
        </div>
      </div>
    );
  }

  const publicShopHref = `/shop/${profile.slug}`;

  return (
    <div className="w-full">
      <PortalPageHeader
        title="Settings"
        description={`Policies for ${profile.shopName} — shown on your shop and listing pages when filled in.`}
        actions={
          <>
            <Button variant="info" size="sm" asChild>
              <Link href="/seller/shop">Shop profile</Link>
            </Button>
            <Button variant="info" size="sm" asChild>
              <Link
                href={publicShopHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                View shop
                <ExternalLink data-icon="inline-end" />
              </Link>
            </Button>
          </>
        }
      />

      <div className="mt-6">
        <ShopPolicyForm
          profile={{
            returnPolicy: profile.returnPolicy,
            shippingPolicy: profile.shippingPolicy,
            slug: profile.slug,
            shopName: profile.shopName,
          }}
        />
      </div>
    </div>
  );
}
