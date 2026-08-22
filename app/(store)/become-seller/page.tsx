import { redirect } from "next/navigation";
import { ROLE_LABELS, userHasLabel } from "@/lib/appwrite/roles";
import { getLoggedInUser } from "@/lib/appwrite/session";
import { getOwnSellerProfile } from "@/lib/services/seller-application";

/** Buyer-facing apply URL is retired — send people to register or their holding page. */
export default async function BecomeSellerRedirectPage() {
  const user = await getLoggedInUser();
  if (!user) {
    redirect("/register");
  }
  if (userHasLabel(user, ROLE_LABELS.seller)) {
    redirect("/seller");
  }
  const existing = await getOwnSellerProfile();
  if (existing) {
    redirect("/seller/pending");
  }
  redirect("/register");
}
