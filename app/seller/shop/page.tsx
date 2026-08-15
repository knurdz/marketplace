import { redirect } from "next/navigation";
import { ShopProfileForm } from "@/components/seller/shop-profile-form";
import { getShopBannerPreviewUrl } from "@/lib/appwrite/storage-urls";
import { getOwnSellerProfile } from "@/lib/services/seller-application";

export default async function SellerShopPage() {
  const profile = await getOwnSellerProfile();

  if (!profile) {
    redirect("/become-seller");
  }

  if (profile.status !== "approved") {
    redirect("/become-seller");
  }

  const bannerPreviewUrl = getShopBannerPreviewUrl(profile.bannerFileId);

  return (
    <div className="mx-auto max-w-3xl">
      <p className="font-mono text-sm text-accent">$ ./seller --shop</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight">Shop profile</h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Edit how buyers see your shop on the public storefront and add bank
        details for bank-transfer payouts.
      </p>

      <ShopProfileForm profile={profile} bannerPreviewUrl={bannerPreviewUrl} />
    </div>
  );
}
