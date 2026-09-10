import Link from "next/link";
import { BankSlipImage } from "@/components/bank-slip/bank-slip-preview";
import {
  DataTableEmpty,
  LoadMoreLink,
} from "@/components/layout/data-table-shell";
import { PortalPageHeader } from "@/components/layout/portal-page-header";
import {
  getBankSlipReviewUrl,
  listPendingBankSlips,
} from "@/lib/services/bank-slip-review";

const PAGE_SIZE = 25;

function formatAmount(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function formatUploadedAt(iso: string): string {
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

type PageProps = {
  searchParams: Promise<{ cursor?: string }>;
};

export default async function AdminBankSlipsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const cursor = params.cursor?.trim() || undefined;

  const { slips, nextCursor } = await listPendingBankSlips({
    limit: PAGE_SIZE,
    cursor,
  });

  const slipUrls = await Promise.all(
    slips.map(async (entry) => ({
      id: entry.slip.$id,
      url: await getBankSlipReviewUrl(entry.slip.fileId),
    })),
  );
  const urlBySlipId = new Map(slipUrls.map((s) => [s.id, s.url]));

  return (
    <div>
      <PortalPageHeader
        title="Bank slip queue"
        description="Read-only view of pending bank transfer proofs. The selling shop approves or rejects each slip."
      />

      {slips.length === 0 ? (
        <DataTableEmpty
          className="mt-6"
          message="No pending bank slips. When buyers upload transfer proofs, they appear here after the seller has them in their order inbox."
        />
      ) : (
        <ul className="mt-6 space-y-4">
          {slips.map((entry) => {
            const imageUrl = urlBySlipId.get(entry.slip.$id) ?? "";
            return (
              <li
                key={entry.slip.$id}
                className="rounded-xl border border-border bg-card px-4 py-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">
                      Order{" "}
                      <Link
                        href={`/admin/orders?status=payment_review&method=bank_transfer`}
                        className="text-accent hover:underline"
                      >
                        {entry.slip.orderId}
                      </Link>
                    </p>
                    <p className="mt-2 text-lg font-bold tracking-tight">
                      {formatAmount(entry.paymentAmount, entry.paymentCurrency)}
                    </p>
                    <dl className="mt-3 space-y-1 font-mono text-xs text-muted-foreground">
                      <div className="flex gap-2">
                        <dt className="text-foreground/70">Seller</dt>
                        <dd>{entry.sellerId || "—"}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="text-foreground/70">Buyer</dt>
                        <dd>{entry.buyerId}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="text-foreground/70">Uploaded</dt>
                        <dd>{formatUploadedAt(entry.uploadedAt)}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="text-foreground/70">Slip</dt>
                        <dd>{entry.slip.$id}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {imageUrl ? (
                  <BankSlipImage
                    src={imageUrl}
                    alt={`Bank slip for order ${entry.slip.orderId}`}
                  />
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {nextCursor ? (
        <LoadMoreLink href={`/admin/payments/bank-slips?cursor=${nextCursor}`} />
      ) : null}
    </div>
  );
}
