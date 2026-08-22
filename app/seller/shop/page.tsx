import { redirect } from "next/navigation";
import { ShopProfileForm } from "@/components/seller/shop-profile-form";
import { PageHeader } from "@/components/layout/page-header";
import { getShopBannerPreviewUrl } from "@/lib/appwrite/storage-urls";
import { getOwnSellerProfile } from "@/lib/services/seller-application";

export default async function SellerShopPage() {
  const profile = await getOwnSellerProfile();

  if (!profile) {
    redirect("/seller/pending");
  }

  if (profile.status !== "approved") {
    redirect("/seller/pending");
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
