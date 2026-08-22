import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatPaymentMethod } from "@/lib/order-display";
import { getSellerEarnings } from "@/lib/services";

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

export default async function SellerEarningsPage() {
  const earnings = await getSellerEarnings();

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="mt-3 text-3xl font-bold tracking-tight">Earnings</h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Completed payments for your shop. Totals reflect payments marked paid.
      </p>

      <section className="mt-10 rounded-md border border-border bg-card px-4 py-5">
        <p className="font-mono text-xs text-muted-foreground">Total paid</p>
        <p className="mt-2 text-3xl font-bold tracking-tight">
          {formatRevenue(earnings.total, earnings.currency)}
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Payouts are processed manually to your registered bank account. Only
          payments marked paid are included.
        </p>
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
          ) : null}
          <ul
            className={
              earnings.lineCount > earnings.lines.length ? "mt-4" : "mt-10"
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
