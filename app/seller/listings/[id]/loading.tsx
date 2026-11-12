import { PortalFormPageSkeleton } from "@/components/loading/portal-form-page-skeleton";

export default function SellerListingEditLoading() {
  return (
    <PortalFormPageSkeleton
      className="max-w-2xl"
      showHeaderAction={false}
      variant="listing"
    />
  );
}
