import Link from "next/link";
import {
  DataTableEmpty,
  DataTableShell,
} from "@/components/layout/data-table-shell";
import { PortalPageHeader } from "@/components/layout/portal-page-header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    <div>
      <PortalPageHeader
        title="Earnings"
        description="Completed payments for your shop. Totals reflect payments marked paid. Payouts are processed manually to your registered bank account."
      />

      <section className="mt-6 rounded-xl border border-border bg-card px-4 py-5">
        <p className="text-sm text-muted-foreground">Total paid</p>
        <p className="mt-2 text-3xl font-bold tracking-tight">
          {formatRevenue(earnings.total, earnings.currency)}
        </p>
      </section>

      <section className="mt-6 rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold tracking-tight">
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
        <h3 className="text-base font-semibold tracking-tight">By product</h3>
        {analytics.byProduct.length === 0 ? (
          <DataTableEmpty className="mt-4" message="No paid line items yet." />
        ) : (
          <DataTableShell className="mt-4">
            <Table aria-label="Earnings by product">
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4">Product</TableHead>
                  <TableHead className="px-4 text-right">Sold</TableHead>
                  <TableHead className="px-4 text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.byProduct.map((row) => (
                  <TableRow key={row.productId}>
                    <TableCell className="px-4">
                      <Link
                        href={`/seller/listings/${row.productId}`}
                        className="hover:text-accent"
                      >
                        {row.title}
                      </Link>
                    </TableCell>
                    <TableCell className="px-4 text-right font-mono text-sm tabular-nums text-muted-foreground">
                      {row.quantity}
                    </TableCell>
                    <TableCell className="px-4 text-right font-mono text-sm tabular-nums">
                      {formatRevenue(row.revenue, analytics.currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DataTableShell>
        )}
      </section>

      <section className="mt-8">
        {earnings.lineCount > earnings.lines.length ? (
          <p className="text-sm text-muted-foreground">
            Showing {earnings.lines.length} of {earnings.lineCount} paid payments.
          </p>
        ) : (
          <h3 className="text-base font-semibold tracking-tight">Payment history</h3>
        )}
        {earnings.lines.length === 0 ? (
          <DataTableEmpty className="mt-4" message="No paid payments yet." />
        ) : (
          <DataTableShell className="mt-4">
            <Table aria-label="Paid earnings">
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4">Order</TableHead>
                  <TableHead className="px-4">Method</TableHead>
                  <TableHead className="px-4 text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {earnings.lines.map(({ order, payment }) => (
                  <TableRow key={payment.$id}>
                    <TableCell className="px-4">
                      <Link
                        href={`/seller/orders/${order.$id}`}
                        className="font-mono text-sm hover:text-accent"
                      >
                        {order.$id}
                      </Link>
                    </TableCell>
                    <TableCell className="px-4 text-sm text-muted-foreground">
                      {formatPaymentMethod(payment.method)}
                    </TableCell>
                    <TableCell className="px-4 text-right font-mono text-sm tabular-nums">
                      {payment.currency} {payment.amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DataTableShell>
        )}
      </section>
    </div>
  );
}
