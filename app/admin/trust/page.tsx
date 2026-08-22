import Link from "next/link";
import {
  listSellersWithFlags,
  listVerifiedSellers,
  MAX_SELLERS_EVALUATED,
} from "@/lib/services/trust-signals";

const RULE_LABELS: Record<string, string> = {
  rejected_bank_slips: "Rejected bank slips",
  new_seller_high_first_order: "New seller, high first order",
  open_unresolved_reports: "Open reports",
  rapid_cancellation_rate: "High cancellation rate",
};

function ruleLabel(rule: string): string {
  return RULE_LABELS[rule] ?? rule;
}

export default async function AdminTrustPage() {
  const [flagged, verified] = await Promise.all([
    listSellersWithFlags(),
    listVerifiedSellers(),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="mt-3 text-3xl font-bold tracking-tight">Trust signals</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Read-only computed heuristics for human review. Verified badge
        eligibility and fraud flags are evaluated live from existing data — no
        persisted state. See{" "}
        <span className="font-mono text-xs">docs/agent/TRUST_RULES.md</span>{" "}
        for thresholds.
      </p>
      <p className="mt-2 font-mono text-xs text-muted-foreground">
        Evaluating up to {MAX_SELLERS_EVALUATED} most recently approved sellers
        per load.
      </p>

      <section className="mt-10">
        <h3 className="text-xl font-bold tracking-tight">Flagged sellers</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Sellers with one or more triggered risk rules. Use{" "}
          <Link href="/admin/sellers" className="text-accent underline-offset-2 hover:underline">
            Sellers
          </Link>{" "}
          or{" "}
          <Link href="/admin/users" className="text-accent underline-offset-2 hover:underline">
            Users
          </Link>{" "}
          for follow-up actions.
        </p>

        {flagged.length === 0 ? (
          <p className="mt-6 rounded-md border border-border bg-card px-4 py-5 font-mono text-sm text-muted-foreground">
            No flagged sellers in the current evaluation window.
          </p>
        ) : (
          <ul className="mt-6 space-y-4">
            {flagged.map((row) => (
              <li
                key={row.sellerId}
                className="rounded-md border border-border bg-card px-4 py-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-lg font-bold tracking-tight">{row.shopName}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    sellerId: {row.sellerId}
                  </p>
                </div>
                <ul className="mt-4 space-y-2">
                  {row.flags.map((flag) => (
                    <li
                      key={`${row.sellerId}-${flag.rule}`}
                      className="border-l-2 border-destructive/60 pl-3"
                    >
                      <p className="font-mono text-xs font-medium text-destructive">
                        {ruleLabel(flag.rule)}
                      </p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {flag.reason}
                      </p>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h3 className="text-xl font-bold tracking-tight">
          Verified-eligible sellers
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Sellers who currently meet all computed Verified badge criteria. This
          is awareness only — no badge is granted or displayed here.
        </p>

        {verified.length === 0 ? (
          <p className="mt-6 rounded-md border border-border bg-card px-4 py-5 font-mono text-sm text-muted-foreground">
            No sellers currently meet Verified eligibility criteria.
          </p>
        ) : (
          <ul className="mt-6 space-y-4">
            {verified.map((row) => (
              <li
                key={row.sellerId}
                className="rounded-md border border-border bg-card px-4 py-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-lg font-bold tracking-tight">{row.shopName}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    sellerId: {row.sellerId}
                  </p>
                </div>
                <ul className="mt-3 space-y-1">
                  {row.verifiedReasons.map((reason) => (
                    <li
                      key={`${row.sellerId}-${reason}`}
                      className="text-sm text-muted-foreground"
                    >
                      {reason}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
