import { formatOrderStatus } from "@/lib/order-display";
import { deriveOrderTimeline, type OrderStatus } from "@/lib/types";

type OrderTimelineProps = {
  status: OrderStatus;
};

export function OrderTimeline({ status }: OrderTimelineProps) {
  const view = deriveOrderTimeline(status);

  return (
    <section className="mt-10 space-y-4">
      <p className="font-mono text-sm text-accent">$ ./order --timeline</p>
      <h2 className="text-xl font-bold tracking-tight">Order status</h2>

      {view.terminalOutcome ? (
        <p
          role="status"
          className="rounded-md border border-border bg-card px-3 py-2 font-mono text-sm text-accent-bright"
        >
          Order {formatOrderStatus(view.terminalOutcome).toLowerCase()}
        </p>
      ) : null}

      <ol className="space-y-3" aria-label="Order progress">
        {view.steps.map((step) => (
          <li
            key={step.status}
            className="flex items-center gap-3 text-sm"
            aria-current={step.state === "current" ? "step" : undefined}
          >
            <span
              className={
                step.state === "done"
                  ? "size-2 shrink-0 rounded-full bg-accent"
                  : step.state === "current"
                    ? "size-2 shrink-0 rounded-full bg-accent-bright ring-2 ring-accent/40"
                    : "size-2 shrink-0 rounded-full border border-border bg-background"
              }
              aria-hidden
            />
            <span
              className={
                step.state === "current"
                  ? "font-medium text-foreground"
                  : step.state === "done"
                    ? "text-muted-foreground"
                    : "text-muted-foreground/70"
              }
            >
              {formatOrderStatus(step.status)}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
