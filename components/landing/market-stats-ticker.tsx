"use client";

import { ShieldCheck, Sparkles, Truck, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const STATS = [
  {
    icon: Sparkles,
    label: "Community Drops",
    value: "100% Curated",
    sub: "By builders, for builders",
  },
  {
    icon: ShieldCheck,
    label: "Safe Transactions",
    value: "PayHere & Escrow",
    sub: "Card, Bank & COD",
  },
  {
    icon: Users,
    label: "Approved Sellers",
    value: "Manual Review",
    sub: "Zero spam guarantee",
  },
  {
    icon: Truck,
    label: "Direct Dispatch",
    value: "< 24h Average",
    sub: "Digital & Physical items",
  },
];

export function MarketStatsTicker({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4",
        className,
      )}
    >
      {STATS.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:bg-card-hover hover:shadow-[0_8px_24px_rgba(0,199,88,0.1)]"
          >
            <div className="flex items-center gap-2 text-muted-foreground transition-colors group-hover:text-accent">
              <Icon className="size-4 shrink-0 stroke-[2]" aria-hidden />
              <span className="font-mono text-xs uppercase tracking-wider">{stat.label}</span>
            </div>
            <p className="mt-2 text-base font-bold tracking-tight text-foreground">
              {stat.value}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {stat.sub}
            </p>
            <div className="pointer-events-none absolute top-0 right-0 h-16 w-16 -translate-y-6 translate-x-6 rounded-full bg-accent/5 blur-xl transition-all duration-300 group-hover:bg-accent/15" />
          </div>
        );
      })}
    </div>
  );
}
