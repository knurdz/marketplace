import { CreditCard, PackageCheck, Search } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "Find it",
    body: "Filter by category and price across active listings from approved sellers.",
  },
  {
    icon: CreditCard,
    title: "Pay your way",
    body: "PayHere, bank transfer, cash on delivery, or free when the price is zero.",
  },
  {
    icon: PackageCheck,
    title: "Track it",
    body: "Follow fulfillment from your dashboard. One seller per order.",
  },
] as const;

export function HowItWorksStrip() {
  return (
    <div className="grid divide-y divide-border overflow-hidden rounded-xl border border-border bg-card sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      {STEPS.map(({ icon: Icon, title, body }) => (
        <div key={title} className="flex gap-3 p-5">
          <Icon className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-tight">{title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {body}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
