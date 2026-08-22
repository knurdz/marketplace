import { redirect } from "next/navigation";
import { SellerApplicationStatus } from "@/components/seller/seller-application-status";
import { PageHeader } from "@/components/layout/page-header";
import { ROLE_LABELS, userHasLabel } from "@/lib/appwrite/roles";
import { getLoggedInUser } from "@/lib/appwrite/session";
import { getOwnSellerProfile } from "@/lib/services/seller-application";

export default async function SellerPendingPage() {
  const user = await getLoggedInUser();
  if (!user) {
    redirect("/login?next=/seller/pending");
  }

  if (userHasLabel(user, ROLE_LABELS.seller)) {
    redirect("/seller");
  }

  const existing = await getOwnSellerProfile();
  if (!existing) {
    redirect("/register");
  }

  if (existing.status === "approved") {
    redirect("/seller");
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        headingAs="h2"
        eyebrow="Seller"
        title="Shop application"
        description="Admin review is required before you can open the seller dashboard."
      />
      <SellerApplicationStatus profile={existing} />
    </div>
  );
}
