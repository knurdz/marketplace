import { AdminDashboardCharts } from "@/components/admin/admin-dashboard-charts";
import { PortalPageHeader } from "@/components/layout/portal-page-header";
import {
  getAdminMetrics,
  getSalesOverTime,
  getUserGrowthOverTime,
} from "@/lib/services";

function formatCount(value: number): string {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
  }).format(value);
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
    title: "Buy requests",
    body: "Read-only requests between buyers and sellers.",
    href: "/admin/requests",
    cta: "View requests",
  },
  {
    title: "Reports",
    body: "Buyer and seller reports needing triage.",
    href: "/admin/reports",
    cta: "Triage reports",
  },
] as const;

export default async function AdminPage() {
  const [metrics, sales30d, sales12m, growth30d, growth12m] = await Promise.all([
    getAdminMetrics(),
    getSalesOverTime({ range: "30d" }),
    getSalesOverTime({ range: "12m" }),
    getUserGrowthOverTime({ range: "30d" }),
    getUserGrowthOverTime({ range: "12m" }),
  ]);

  return (
    <div className="w-full">
      <PortalPageHeader
        title="Dashboard"
        description="Platform activity at a glance."
      />

      <AdminDashboardCharts
        metrics={{
          totalUsers: formatCount(metrics.totalUsers),
          activeSellers: formatCount(metrics.activeSellers),
          totalOrders: formatCount(metrics.openRequests),
          grossRevenue: formatCount(metrics.soldRequests),
        }}
        sales30d={sales30d}
        sales12m={sales12m}
        growth30d={growth30d}
        growth12m={growth12m}
        queues={[...QUEUES]}
      />
    </div>
  );
}
