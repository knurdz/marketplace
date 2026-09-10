import { getAdminMetrics } from "@/lib/services";
import { PortalPageHeader } from "@/components/layout/portal-page-header";
import { StatCardGrid } from "@/components/layout/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

function formatCount(value: number): string {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatRevenue(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "LKR",
      maximumFractionDigits: 2,
    }).format(amount);
  }
}

const QUEUES = [
  {
    title: "Seller approvals",
    body: "Applications waiting for a decision.",
    href: "/admin/sellers",
    cta: "Open queue",
  },
  {
    title: "Listing moderation",
    body: "Pending listings before they reach the storefront.",
    href: "/admin/listings?view=pending",
    cta: "Review listings",
  },
  {
    title: "Bank slips",
    body: "Read-only view; sellers approve their own order slips.",
    href: "/admin/payments/bank-slips",
    cta: "View slips",
  },
  {
    title: "Reports",
    body: "Buyer and seller reports needing triage.",
    href: "/admin/reports",
    cta: "Triage reports",
  },
] as const;

export default async function AdminPage() {
  const metrics = await getAdminMetrics();

  const cards = [
    {
      label: "Total users",
      value: formatCount(metrics.totalUsers),
      href: "/admin/users",
    },
    {
      label: "Active sellers",
      value: formatCount(metrics.activeSellers),
      href: "/admin/sellers/performance",
    },
    {
      label: "Total orders",
      value: formatCount(metrics.totalOrders),
      href: "/admin/orders",
    },
    {
      label: "Gross revenue",
      value: formatRevenue(metrics.grossRevenue, metrics.currency),
      hint: "Paid payments only",
      href: "/admin/analytics",
    },
  ];

  return (
    <div>
      <PortalPageHeader
        title="Dashboard"
        description="Platform snapshot. Approvals, slips, and moderation live in the sidebar."
        actions={
          <Button variant="secondary" size="sm" asChild>
            <Link href="/admin/analytics">Analytics</Link>
          </Button>
        }
      />

      <StatCardGrid cards={cards} className="mt-6" />

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {QUEUES.map((queue) => (
          <Card key={queue.title}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold tracking-tight">
                  {queue.title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {queue.body}
                </p>
              </div>
              <Button variant="secondary" size="sm" asChild>
                <Link href={queue.href}>{queue.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
