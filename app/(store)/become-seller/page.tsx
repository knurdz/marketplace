import { redirect } from "next/navigation";
import { SellerApplyForm } from "@/components/seller/seller-apply-form";
import { SellerApplicationStatus } from "@/components/seller/seller-application-status";
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
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="font-mono text-sm text-accent">$ ./seller --apply</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">Become a seller</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Apply to open a shop on Knurdz. An admin reviews applications before you
        can publish listings.
      </p>

      {existing?.status === "pending" || existing?.status === "rejected" ? (
        <SellerApplicationStatus profile={existing} />
      ) : null}

      {!existing ? <SellerApplyForm /> : null}
    </div>
  );
}
