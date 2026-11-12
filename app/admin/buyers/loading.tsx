import { PortalFilterTableSkeleton } from "@/components/loading/portal-filter-table-skeleton";

export default function AdminBuyersLoading() {
  return <PortalFilterTableSkeleton filterVariant="toolbar" rows={8} />;
}
