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
    <div className="grid divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      {STEPS.map(({ icon: Icon, title, body }, index) => (
        <div
          key={title}
          className="group relative flex items-start gap-4 p-6 transition-all duration-300 hover:bg-card-hover"
        >
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-background-alt text-accent shadow-xs transition-transform duration-300 group-hover:scale-110 group-hover:border-accent/50 group-hover:bg-accent/10 group-hover:shadow-[0_0_15px_rgba(0,199,88,0.2)]">
            <Icon className="size-5 stroke-[1.8]" aria-hidden />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-accent font-semibold">0{index + 1}</span>
              <p className="text-sm font-semibold tracking-tight text-foreground">{title}</p>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {body}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
