import { redirect } from "next/navigation";

type EditListingPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { id } = await params;
  redirect(`/seller/listings?edit=${encodeURIComponent(id)}`);
}
