import { redirect } from "next/navigation";
import { ShopPolicyForm } from "@/components/seller/shop-policy-form";
import { getOwnSellerProfile } from "@/lib/services/seller-application";

export default async function SellerSettingsPage() {
  const profile = await getOwnSellerProfile();

  if (!profile) {
    redirect("/become-seller");
  }

  if (profile.status !== "approved") {
    redirect("/become-seller");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="mt-3 text-3xl font-bold tracking-tight">Settings</h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Return and shipping policies buyers see on your shop and listings.
      </p>

      <ShopPolicyForm
        profile={{
          returnPolicy: profile.returnPolicy,
          shippingPolicy: profile.shippingPolicy,
          slug: profile.slug,
        }}
      />
    </div>
  );
}
