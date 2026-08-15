import { getSellerMetrics } from "@/lib/services";

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
    { label: "Orders", value: formatCount(metrics.orderCount) },
    {
      label: "Revenue",
      value: formatRevenue(metrics.revenue, metrics.currency),
    },
    { label: "Pending", value: formatCount(metrics.pendingCount) },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <p className="font-mono text-sm text-accent">$ ./seller --dashboard</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight">Dashboard</h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Your order totals, paid revenue, and orders awaiting fulfillment.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {cards.map(({ label, value }) => (
          <div
            key={label}
            className="rounded-md border border-border bg-card px-4 py-5"
          >
            <p className="font-mono text-xs text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
