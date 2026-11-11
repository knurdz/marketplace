import {
  DataTableEmpty,
  DataTableShell,
  FilterTabs,
} from "@/components/layout/data-table-shell";
import { PortalPageHeader } from "@/components/layout/portal-page-header";
import { StatusPill, type StatusTone } from "@/components/layout/status-pill";
import { ReviewModerationActions } from "@/components/admin/review-moderation-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listReviewsForAdmin } from "@/lib/services";
import type { ReviewStatus } from "@/lib/types";

type AdminReviewsPageProps = {
  searchParams: Promise<{ filter?: string }>;
};

function parseFilter(raw: string | undefined): ReviewStatus {
  if (raw === "approved" || raw === "rejected" || raw === "pending") return raw;
  return "pending";
}

function reviewTone(status: ReviewStatus): StatusTone {
  if (status === "approved") return "positive";
  if (status === "rejected") return "danger";
  return "warning";
}

export default async function AdminReviewsPage({
  searchParams,
}: AdminReviewsPageProps) {
  const { filter } = await searchParams;
  const status = parseFilter(filter);
  const reviews = await listReviewsForAdmin({ status });

  const filterBar = (
    <FilterTabs
      tabs={[
        {
          href: "/admin/reviews",
          label: "Pending",
          active: status === "pending",
        },
        {
          href: "/admin/reviews?filter=approved",
          label: "Approved",
          active: status === "approved",
        },
        {
          href: "/admin/reviews?filter=rejected",
          label: "Rejected",
          active: status === "rejected",
        },
      ]}
    />
  );

  return (
    <div className="w-full">
      <PortalPageHeader
        title="Reviews"
        description="Approve or reject seller reviews from buyers with a sold request. Only approved reviews appear on shops."
      />

      {reviews.length === 0 ? (
        <div className="mt-6 space-y-4">
          {filterBar}
          <DataTableEmpty
            message={
              status === "pending"
                ? "No pending reviews."
                : `No ${status} reviews.`
            }
          />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {filterBar}
        <DataTableShell>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  Rating
                </TableHead>
                <TableHead>
                  Comment
                </TableHead>
                <TableHead>
                  Buyer
                </TableHead>
                <TableHead>
                  Seller
                </TableHead>
                <TableHead>
                  Status
                </TableHead>
                <TableHead>
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((review) => (
                <TableRow key={review.$id}>
                  <TableCell className="font-medium tabular-nums">
                    {review.rating}/5
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm">
                    {review.comment ?? "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {review.buyerId.slice(0, 8)}…
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {review.sellerId.slice(0, 8)}…
                  </TableCell>
                  <TableCell>
                    <StatusPill
                      label={review.status}
                      tone={reviewTone(review.status)}
                    />
                  </TableCell>
                  <TableCell>
                    {review.status === "pending" ? (
                      <ReviewModerationActions reviewId={review.$id} />
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataTableShell>
        </div>
      )}
    </div>
  );
}
