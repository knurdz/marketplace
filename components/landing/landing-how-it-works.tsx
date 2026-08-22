import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STEPS = [
  {
    n: "01",
    title: "Browse",
    body: "Filter by category and price. Every listing is an active, in-stock offer from an approved seller.",
  },
  {
    n: "02",
    title: "Checkout",
    body: "PayHere sandbox, bank transfer, or free when the price is zero. One seller per order.",
  },
  {
    n: "03",
    title: "Fulfill",
    body: "Sellers ship or mark ready for pickup. You track the order from your dashboard.",
  },
] as const;

export function LandingHowItWorks() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {STEPS.map((step) => (
        <Card key={step.n} className="bg-card/60">
          <CardHeader>
            <p className="font-mono text-xs tabular-nums text-muted-foreground">
              {step.n}
            </p>
            <CardTitle className="text-xl">{step.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {step.body}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
