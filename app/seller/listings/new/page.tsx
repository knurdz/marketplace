import { redirect } from "next/navigation";

export default function NewListingPage() {
  redirect("/seller/listings?compose=new");
}
