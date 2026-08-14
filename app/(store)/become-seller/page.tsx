import Link from "next/link";
import { redirect } from "next/navigation";
import { SellerApplyForm } from "@/components/seller/seller-apply-form";
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

      {existing?.status === "pending" ? (
        <div className="mt-8 rounded-md border border-border bg-card p-5">
          <p className="font-medium">Application under review</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Your shop <strong>{existing.shopName}</strong> (
            <span className="font-mono">{existing.slug}</span>) is waiting for
            admin approval. You will get seller portal access once approved.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            <Link href="/" className="text-accent hover:underline">
              Back to storefront
            </Link>
          </p>
        </div>
      ) : null}

      {existing?.status === "rejected" ? (
        <div className="mt-8 rounded-md border border-border bg-card p-5">
          <p className="font-medium">Application not approved</p>
          {existing.rejectionReason ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Reason: {existing.rejectionReason}
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              Your seller application was rejected. Contact support if you have
              questions.
            </p>
          )}
          <p className="mt-4 text-sm text-muted-foreground">
            Re-application will be available in a later update.
          </p>
        </div>
      ) : null}

      {!existing ? <SellerApplyForm /> : null}
    </div>
  );
}
