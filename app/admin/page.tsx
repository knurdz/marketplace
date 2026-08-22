import { getAdminMetrics } from "@/lib/services";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

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

export default async function AdminPage() {
  const metrics = await getAdminMetrics();

  const cards = [
    { label: "Total users", value: formatCount(metrics.totalUsers) },
    { label: "Active sellers", value: formatCount(metrics.activeSellers) },
    { label: "Total orders", value: formatCount(metrics.totalOrders) },
    {
      label: "Gross revenue",
      value: formatRevenue(metrics.grossRevenue, metrics.currency),
    },
  ];

  return (
    <div>
      <PageHeader
        headingAs="h2"
        eyebrow="Admin"
        title="Dashboard"
        description="Platform snapshot. Approvals, slips, and moderation live in the sidebar."
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value }) => (
          <Card key={label}>
            <CardContent>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
