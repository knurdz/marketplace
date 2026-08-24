import { redirect } from "next/navigation";
import { SellerApplyForm } from "@/components/seller/seller-apply-form";
import { PageHeader } from "@/components/layout/page-header";
import { ROLE_LABELS, userHasLabel } from "@/lib/appwrite/roles";
import { getLoggedInUser } from "@/lib/appwrite/session";
import { getOwnSellerProfile } from "@/lib/services/seller-application";

export default async function RegisterShopPage() {
  const user = await getLoggedInUser();
  if (!user) {
    redirect("/login?next=/register/shop");
  }

  if (userHasLabel(user, ROLE_LABELS.seller)) {
    redirect("/seller");
  }
  if (userHasLabel(user, ROLE_LABELS.admin)) {
    redirect("/admin");
  }

  const existing = await getOwnSellerProfile();
  if (existing) {
    redirect("/seller/pending");
  }

  return (
    <div>
      <PageHeader
        eyebrow="Seller"
        title="Tell us about your shop"
        description="Your account is ready. Submit shop details so an admin can review your application."
      />
      <SellerApplyForm />
    </div>
  );
}
