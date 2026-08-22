import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatPaymentMethod } from "@/lib/order-display";
import {
  getSellerEarningsAnalytics,
  parseSellerAnalyticsRange,
} from "@/lib/services";
import { SellerEarningsChart } from "@/components/seller/seller-earnings-chart";

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

export default async function SellerEarningsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const params = await searchParams;
  const range = parseSellerAnalyticsRange(params.range);
  const analytics = await getSellerEarningsAnalytics(range);
  const { earnings } = analytics;

  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="mt-3 text-3xl font-bold tracking-tight">Earnings</h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Completed payments for your shop. Totals reflect payments marked paid.
        Payouts are processed manually to your registered bank account.
      </p>

      <section className="mt-10 rounded-md border border-border bg-card px-4 py-5">
        <p className="text-sm text-muted-foreground">Total paid</p>
        <p className="mt-2 text-3xl font-bold tracking-tight">
          {formatRevenue(earnings.total, earnings.currency)}
        </p>
      </section>

      <section className="mt-8 rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold tracking-tight">
            {range === "12m" ? "Monthly revenue" : "Daily revenue (30 days)"}
          </h3>
          <div className="flex gap-2">
            <Button variant={range === "30d" ? "default" : "secondary"} size="sm" asChild>
              <Link href="/seller/earnings?range=30d">30 days</Link>
            </Button>
            <Button variant={range === "12m" ? "default" : "secondary"} size="sm" asChild>
              <Link href="/seller/earnings?range=12m">12 months</Link>
            </Button>
          </div>
        </div>
        <div className="mt-6">
          <SellerEarningsChart
            series={analytics.series}
            currency={analytics.currency}
            range={range}
          />
        </div>
      </section>

      <section className="mt-8">
        <h3 className="text-lg font-semibold tracking-tight">By product</h3>
        {analytics.byProduct.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No paid line items yet.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border" aria-label="Earnings by product">
            {analytics.byProduct.map((row) => (
              <li key={row.productId} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
                <Link
                  href={`/seller/listings/${row.productId}`}
                  className="text-sm hover:text-accent"
                >
                  {row.title}
                </Link>
                <span className="text-sm text-muted-foreground">
                  {row.quantity} sold
                </span>
                <span className="font-mono text-sm tabular-nums">
                  {formatRevenue(row.revenue, analytics.currency)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {earnings.lines.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">
          No paid payments yet.
        </p>
      ) : (
        <>
          {earnings.lineCount > earnings.lines.length ? (
            <p className="mt-10 text-sm text-muted-foreground">
              Showing {earnings.lines.length} of {earnings.lineCount} paid
              payments.
            </p>
          ) : (
            <h3 className="mt-10 text-lg font-semibold tracking-tight">
              Payment history
            </h3>
          )}
          <ul
            className={
              earnings.lineCount > earnings.lines.length ? "mt-4" : "mt-4"
            }
            aria-label="Paid earnings"
          >
          {earnings.lines.map(({ order, payment }) => (
            <li
              key={payment.$id}
              className="border-b border-border py-4 last:border-b-0"
            >
              <Link
                href={`/seller/orders/${order.$id}`}
                className="group block transition hover:opacity-90"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-mono text-sm text-foreground group-hover:text-accent">
                    {order.$id}
                  </span>
                  <span className="font-mono text-sm tabular-nums">
                    {payment.currency} {payment.amount.toFixed(2)}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span>{formatPaymentMethod(payment.method)}</span>
                  <span className="font-mono">paid</span>
                </div>
              </Link>
            </li>
          ))}
          </ul>
        </>
      )}

      <p className="mt-12">
        <Button variant="outline" size="sm" asChild>
          <Link href="/seller">Back to dashboard</Link>
        </Button>
      </p>
    </div>
  );
}
