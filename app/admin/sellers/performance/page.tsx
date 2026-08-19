import Link from "next/link";
import { listApprovedSellerPerformance } from "@/lib/services";

const PAGE_SIZE = 25;

type PageProps = {
  searchParams: Promise<{ cursor?: string }>;
};

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

export default async function AdminSellerPerformancePage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const cursor = params.cursor?.trim() || undefined;

  const { rows, nextCursor } = await listApprovedSellerPerformance({
    limit: PAGE_SIZE,
    cursor,
  });

  const nextHref = nextCursor
    ? `/admin/sellers/performance?${new URLSearchParams({
        cursor: nextCursor,
      }).toString()}`
    : null;

  return (
    <div className="mx-auto max-w-5xl">
      <p className="font-mono text-sm text-accent">
        $ ./admin --sellers-performance
      </p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight">
        Seller performance
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Basic KPIs for approved sellers. Revenue matches paid payments on the
        seller earnings view. Pending is paid through ready-for-pickup — not
        unpaid checkout.{" "}
        <Link
          href="/admin/sellers"
          className="text-accent underline-offset-2 hover:underline"
        >
          Seller approvals
        </Link>
      </p>

      {rows.length === 0 ? (
        <p className="mt-10 rounded-md border border-border bg-card px-4 py-5 font-mono text-sm text-muted-foreground">
          No approved sellers yet. After an application is approved, their
          orders, pending fulfillment, and paid revenue appear here.
        </p>
      ) : (
        <div className="mt-10 overflow-x-auto rounded-md border border-border">
          <table className="w-full min-w-[36rem] border-collapse text-left">
            <caption className="sr-only">
              Approved seller order counts, pending fulfillment, and paid
              revenue
            </caption>
            <thead>
              <tr className="border-b border-border bg-card font-mono text-xs text-muted-foreground">
                <th scope="col" className="px-4 py-3 font-medium">
                  Shop
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Slug
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-right">
                  Orders
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-right">
                  Pending
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-right">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.sellerId}
                  className="border-b border-border last:border-b-0"
                >
                  <th scope="row" className="px-4 py-3 font-bold tracking-tight">
                    <Link
                      href={`/shop/${row.slug}`}
                      className="hover:text-accent hover:underline hover:underline-offset-2"
                    >
                      {row.shopName}
                    </Link>
                  </th>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    /shop/{row.slug}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm">
                    {formatCount(row.orderCount)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm">
                    {formatCount(row.pendingCount)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm">
                    {formatRevenue(row.revenue, row.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {nextHref ? (
        <div className="mt-8">
          <Link
            href={nextHref}
            className="inline-flex items-center rounded-md border border-border px-4 py-2 font-mono text-sm hover:bg-muted"
          >
            Next page →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
