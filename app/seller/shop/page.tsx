import { ShopProfileForm } from "@/components/seller/shop-profile-form";
import { PageHeader } from "@/components/layout/page-header";
import { requireLabel } from "@/lib/appwrite/roles";
import { getShopBannerPreviewUrl } from "@/lib/appwrite/storage-urls";
import { getOwnSellerProfile } from "@/lib/services/seller-application";

export default async function SellerShopPage() {
  await requireLabel("seller");
  const profile = await getOwnSellerProfile();

  if (!profile) {
    return (
      <div>
        <PageHeader
          headingAs="h2"
          title="Shop profile"
          description="How buyers see your shop, plus bank details for transfer payouts."
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
    <div>
      <PageHeader
        headingAs="h2"
        title="Shop profile"
        description="How buyers see your shop, plus bank details for transfer payouts."
      />
      <div className="mt-8">
        <ShopProfileForm profile={profile} bannerPreviewUrl={bannerPreviewUrl} />
      </div>
    </div>
  );
}
