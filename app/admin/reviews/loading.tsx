import { PortalFilterTableSkeleton } from "@/components/loading/portal-filter-table-skeleton";

export default function AdminReviewsLoading() {
  return <PortalFilterTableSkeleton filterVariant="tabs" rows={8} />;
}
