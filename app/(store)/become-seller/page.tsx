import { redirect } from "next/navigation";
import { SellerApplyForm } from "@/components/seller/seller-apply-form";
import { SellerApplicationStatus } from "@/components/seller/seller-application-status";
import { PageHeader } from "@/components/layout/page-header";
import { ROLE_LABELS, userHasLabel } from "@/lib/appwrite/roles";
import { getLoggedInUser } from "@/lib/appwrite/session";
import { getOwnSellerProfile } from "@/lib/services/seller-application";

export default async function BecomeSellerPage() {
  const user = await getLoggedInUser();
  if (!user) {
    redirect("/login?next=/become-seller");
  }

  if (userHasLabel(user, ROLE_LABELS.seller)) {
    redirect("/seller");
  }

  const existing = await getOwnSellerProfile();

  if (existing?.status === "approved") {
    redirect("/seller");
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Sell"
        title="Become a seller"
        description="Apply to open a shop. An admin reviews applications before you can publish listings."
      />

      {existing?.status === "pending" || existing?.status === "rejected" ? (
        <div className="mt-8">
          <SellerApplicationStatus profile={existing} />
        </div>
      ) : null}

      {!existing ? (
        <div className="mt-8">
          <SellerApplyForm />
        </div>
      ) : null}
    </main>
  );
}
