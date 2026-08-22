import Link from "next/link";
import { getSellerMetrics } from "@/lib/services";
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

export default async function SellerPage() {
  const metrics = await getSellerMetrics();

  const cards = [
    {
      label: "Orders",
      value: formatCount(metrics.orderCount),
      href: "/seller/orders",
    },
    {
      label: "Revenue",
      value: formatRevenue(metrics.revenue, metrics.currency),
      href: "/seller/earnings",
    },
    {
      label: "Pending",
      value: formatCount(metrics.pendingCount),
      href: "/seller/orders?filter=pending",
    },
  ];

  return (
    <div>
      <PageHeader
        headingAs="h2"
        eyebrow="Seller"
        title="Dashboard"
        description="Order totals, paid revenue, and work waiting on you."
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {cards.map(({ label, value, href }) => (
          <Link key={label} href={href}>
            <Card className="h-full transition-colors hover:border-foreground/20 hover:bg-card-hover">
              <CardContent>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
