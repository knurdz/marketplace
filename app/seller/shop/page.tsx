import { ShopProfileForm } from "@/components/seller/shop-profile-form";
import { PortalPageHeader } from "@/components/layout/portal-page-header";
import { requireLabel } from "@/lib/backend/roles";
import { getShopBannerPreviewUrl } from "@/lib/backend/storage-urls";
import { getOwnSellerProfile } from "@/lib/services/seller-application";

export default async function SellerShopPage() {
  await requireLabel("seller");
  const profile = await getOwnSellerProfile();

  if (!profile) {
    return (
      <div>
        <PortalPageHeader
          title="Shop profile"
          description="How buyers see your shop on the storefront."
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

  const bannerPreviewUrl = getShopBannerPreviewUrl(profile.bannerFileId);

  return (
    <div className="w-full">
      <PortalPageHeader
        title="Shop profile"
        description="How buyers see your shop on the storefront."
      />
      <div className="mt-6 w-full">
        <ShopProfileForm profile={profile} bannerPreviewUrl={bannerPreviewUrl} />
      </div>
    </div>
  );
}
