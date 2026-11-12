import { PortalFilterTableSkeleton } from "@/components/loading/portal-filter-table-skeleton";

export default function AdminAuditLoading() {
  return <PortalFilterTableSkeleton filterVariant="audit" rows={10} />;
}
