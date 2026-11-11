import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import {
  SellerApproveButton,
  SellerRejectForm,
} from "@/components/admin/seller-approval-actions";
import {
  UserSuspendForm,
  UserUnsuspendButton,
} from "@/components/admin/user-management-actions";
import { DataTableShell } from "@/components/layout/data-table-shell";
import { PortalPageHeader } from "@/components/layout/portal-page-header";
import { PortalPanel } from "@/components/layout/portal-panel";
import { StatusPill, type StatusTone } from "@/components/layout/status-pill";
import { SellerDashboardCharts } from "@/components/seller/seller-dashboard-charts";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getShopBannerPreviewUrl } from "@/lib/appwrite/storage-urls";
import { formatPurchaseRequestStatus } from "@/lib/request-display";
import { getAdminShopDetail } from "@/lib/services";
import type { SellerStatus } from "@/lib/types";
import { purchaseRequestStatusTone } from "@/lib/ui/status-tone";

type PageProps = {
  params: Promise<{ profileId: string }>;
};

function statusTone(status: SellerStatus): StatusTone {
  if (status === "approved") return "positive";
  if (status === "pending") return "warning";
  return "danger";
}

function formatWhen(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatCount(value: number): string {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function AdminShopDetailPage({ params }: PageProps) {
  const { profileId } = await params;
  const detail = await getAdminShopDetail(profileId);
  if (!detail) notFound();

  const {
    profile,
    account,
    snapshot,
    listingExtras,
    conversion,
    reviewModeration,
    reportCounts,
    audit,
    $createdAt,
    $updatedAt,
  } = detail;

  const bannerUrl = getShopBannerPreviewUrl(profile.bannerFileId);
  const canSuspend = !account.isAdmin && !account.suspended;
  const canUnsuspend = !account.isAdmin && account.suspended;

  return (
    <div className="w-full">
      <PortalPageHeader
        title={profile.shopName}
        description={`Admin view of /shop/${profile.slug}. Same analytics the seller sees, plus account and moderation details.`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/sellers">
                <ArrowLeft data-icon="inline-start" />
                Sellers
              </Link>
            </Button>
            {profile.status === "approved" ? (
              <Button variant="info" size="sm" asChild>
                <Link href={`/shop/${profile.slug}`}>
                  <ExternalLink data-icon="inline-start" />
                  Public shop
                </Link>
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <StatusPill label={profile.status} tone={statusTone(profile.status)} />
        <span className="text-xs text-muted-foreground">
          Applied {formatWhen($createdAt)}
          {$updatedAt ? ` · Updated ${formatWhen($updatedAt)}` : ""}
        </span>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <PortalPanel>
          <h3 className="text-base font-semibold tracking-tight">Shop</h3>
          {bannerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- storage preview URL
            <img
              src={bannerUrl}
              alt=""
              className="mt-4 h-32 w-full rounded-lg border border-border object-cover"
            />
          ) : null}
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Slug</dt>
              <dd className="mt-0.5 font-medium">/shop/{profile.slug}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Bio</dt>
              <dd className="mt-0.5 whitespace-pre-wrap">
                {profile.bio?.trim() || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Return policy</dt>
              <dd className="mt-0.5 whitespace-pre-wrap">
                {profile.returnPolicy?.trim() || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Shipping policy</dt>
              <dd className="mt-0.5 whitespace-pre-wrap">
                {profile.shippingPolicy?.trim() || "—"}
              </dd>
            </div>
            {profile.status === "rejected" && profile.rejectionReason ? (
              <div>
                <dt className="text-muted-foreground">Rejection reason</dt>
                <dd className="mt-0.5 text-rose-700">
                  {profile.rejectionReason}
                </dd>
              </div>
            ) : null}
          </dl>
          {profile.status === "pending" ? (
            <div className="mt-6 flex flex-wrap items-start gap-2">
              <SellerApproveButton sellerProfileId={profile.$id} />
              <SellerRejectForm
                sellerProfileId={profile.$id}
                shopName={profile.shopName}
              />
            </div>
          ) : null}
        </PortalPanel>

        <PortalPanel>
          <h3 className="text-base font-semibold tracking-tight">Account</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Name</dt>
              <dd className="mt-0.5 font-medium">{account.name || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="mt-0.5 font-medium">{account.email || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Phone</dt>
              <dd className="mt-0.5 font-medium">{account.phone || "—"}</dd>
            </div>
            <div className="flex flex-wrap gap-4">
              <div>
                <dt className="text-muted-foreground">Email verified</dt>
                <dd className="mt-0.5">
                  <StatusPill
                    label={account.emailVerified ? "yes" : "no"}
                    tone={account.emailVerified ? "positive" : "warning"}
                  />
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Role</dt>
                <dd className="mt-0.5">
                  <StatusPill label={account.role} tone="info" />
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Account</dt>
                <dd className="mt-0.5">
                  <StatusPill
                    label={account.suspended ? "suspended" : "active"}
                    tone={account.suspended ? "danger" : "positive"}
                  />
                </dd>
              </div>
            </div>
          </dl>
          {!account.isAdmin ? (
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {canSuspend ? (
                <UserSuspendForm
                  userId={account.userId}
                  displayLabel={account.email || account.name || "seller"}
                />
              ) : null}
              {canUnsuspend ? (
                <UserUnsuspendButton userId={account.userId} />
              ) : null}
            </div>
          ) : (
            <p className="mt-6 text-xs text-muted-foreground">
              Admin accounts cannot be suspended from this page.
            </p>
          )}
        </PortalPanel>
      </div>

      <SellerDashboardCharts
        metrics={snapshot.metrics}
        listingCounts={snapshot.listingCounts}
        views={snapshot.views}
        earningsSeries={snapshot.earningsSeries}
        requestSeries={snapshot.requestSeries}
        viewProducts={snapshot.viewProducts}
        shopName={snapshot.shop.shopName}
        reviewInsights={snapshot.reviewInsights}
        linkMetrics={false}
        reviewsHref="/admin/reviews"
      />

      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <PortalPanel>
          <h3 className="text-sm font-semibold tracking-tight">
            Listing extras
          </h3>
          <ul className="mt-3 space-y-1.5 text-sm tabular-nums text-muted-foreground">
            <li className="flex justify-between gap-3">
              <span>Rejected</span>
              <span>{formatCount(listingExtras.rejected)}</span>
            </li>
            <li className="flex justify-between gap-3">
              <span>Archived</span>
              <span>{formatCount(listingExtras.archived)}</span>
            </li>
            <li className="flex justify-between gap-3">
              <span>Unavailable</span>
              <span>{formatCount(listingExtras.unavailable)}</span>
            </li>
            <li className="flex justify-between gap-3">
              <span>Featured</span>
              <span>{formatCount(listingExtras.featured)}</span>
            </li>
          </ul>
        </PortalPanel>

        <PortalPanel>
          <h3 className="text-sm font-semibold tracking-tight">
            30-day conversion
          </h3>
          <ul className="mt-3 space-y-1.5 text-sm tabular-nums text-muted-foreground">
            <li className="flex justify-between gap-3">
              <span>Shop views</span>
              <span>{formatCount(conversion.shopViews30d)}</span>
            </li>
            <li className="flex justify-between gap-3">
              <span>New requests</span>
              <span>{formatCount(conversion.newRequests30d)}</span>
            </li>
            <li className="flex justify-between gap-3">
              <span>Sold</span>
              <span>{formatCount(conversion.sold30d)}</span>
            </li>
            <li className="flex justify-between gap-3">
              <span>Sold / request</span>
              <span>
                {conversion.soldPerRequestRate == null
                  ? "—"
                  : `${conversion.soldPerRequestRate}%`}
              </span>
            </li>
          </ul>
        </PortalPanel>

        <PortalPanel>
          <h3 className="text-sm font-semibold tracking-tight">
            Review moderation
          </h3>
          <ul className="mt-3 space-y-1.5 text-sm tabular-nums text-muted-foreground">
            <li className="flex justify-between gap-3">
              <span>Pending</span>
              <span>{formatCount(reviewModeration.pending)}</span>
            </li>
            <li className="flex justify-between gap-3">
              <span>Rejected</span>
              <span>{formatCount(reviewModeration.rejected)}</span>
            </li>
            <li className="flex justify-between gap-3">
              <span>Approved</span>
              <span>{formatCount(snapshot.reviewInsights.metrics.count)}</span>
            </li>
          </ul>
        </PortalPanel>

        <PortalPanel>
          <h3 className="text-sm font-semibold tracking-tight">
            Listing reports
          </h3>
          <ul className="mt-3 space-y-1.5 text-sm tabular-nums text-muted-foreground">
            <li className="flex justify-between gap-3">
              <span>Open / reviewing</span>
              <span>{formatCount(reportCounts.open)}</span>
            </li>
            <li className="flex justify-between gap-3">
              <span>Resolved / dismissed</span>
              <span>{formatCount(reportCounts.resolved)}</span>
            </li>
          </ul>
          <Button variant="info" size="xs" className="mt-4" asChild>
            <Link href="/admin/reports">Reports queue</Link>
          </Button>
        </PortalPanel>
      </div>

      <PortalPanel className="mt-6">
        <h3 className="text-base font-semibold tracking-tight">
          Recent requests
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Read-only. Buyer contact details stay on the request detail flow.
        </p>
        {snapshot.recentRequests.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">No requests yet.</p>
        ) : (
          <DataTableShell className="mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {snapshot.recentRequests.map((request) => (
                  <TableRow key={request.$id}>
                    <TableCell className="font-medium">{request.title}</TableCell>
                    <TableCell className="tabular-nums">
                      {request.quantity}
                    </TableCell>
                    <TableCell>
                      <StatusPill
                        tone={purchaseRequestStatusTone(request.status)}
                        label={formatPurchaseRequestStatus(request.status)}
                      />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatWhen(request.$createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DataTableShell>
        )}
      </PortalPanel>

      {snapshot.lowStock.length > 0 ? (
        <PortalPanel className="mt-6">
          <h3 className="text-base font-semibold tracking-tight">Low stock</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {snapshot.lowStock.map((product) => (
              <li key={product.$id} className="flex justify-between gap-3">
                <span className="font-medium">{product.title}</span>
                <span className="tabular-nums text-muted-foreground">
                  {product.stock}
                </span>
              </li>
            ))}
          </ul>
        </PortalPanel>
      ) : null}

      <PortalPanel className="mt-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold tracking-tight">
              Recent audit
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Events for this seller profile. Meta payloads are omitted here.
            </p>
          </div>
          <Button variant="info" size="sm" asChild>
            <Link href={`/admin/audit?resourceType=seller_profile&resourceId=${encodeURIComponent(profile.$id)}`}>
              Full audit
            </Link>
          </Button>
        </div>
        {audit.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">
            No audit events for this shop yet.
          </p>
        ) : (
          <DataTableShell className="mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Actor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {audit.map((entry) => (
                  <TableRow key={entry.$id}>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatWhen(entry.$createdAt)}
                    </TableCell>
                    <TableCell className="font-medium">{entry.event}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {entry.actorId?.slice(0, 8) ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DataTableShell>
        )}
      </PortalPanel>
    </div>
  );
}
