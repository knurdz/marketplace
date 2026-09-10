"use client";

import {
  CreditCard,
  Lock,
  Package,
  Rocket,
  ShieldCheck,
  Sparkles,
  Tag,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TICKER_ITEMS = [
  { icon: Zap, text: "Live Community Drops" },
  { icon: Sparkles, text: "Verified Creators & Builders" },
  { icon: Package, text: "Instant Digital & Direct Dispatch" },
  { icon: ShieldCheck, text: "Buyer Protection Guarantee" },
  { icon: CreditCard, text: "PayHere & Bank Transfer Ready" },
  { icon: Tag, text: "Zero Buyer Platform Fees" },
  { icon: Rocket, text: "Built for Builders Who Ship" },
  { icon: Lock, text: "Secure Community Checkout" },
];

export function MarqueeBanner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "group/marquee relative overflow-hidden rounded-xl border border-border bg-card/60 backdrop-blur-md py-2.5 shadow-xs select-none",
        className,
      )}
      aria-label="Marketplace highlights"
    >
      {/* Left/right fade gradients */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 sm:w-20 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 sm:w-20 bg-gradient-to-l from-background to-transparent" />

      <div className="flex w-max animate-marquee gap-8">
        {/* First copy */}
        <div className="flex shrink-0 items-center gap-8">
          {TICKER_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={`ticker-1-${i}`}
                className="flex items-center gap-2 text-xs font-mono tracking-wide uppercase text-muted-foreground transition-colors hover:text-foreground"
              >
                <Icon className="size-3.5 text-accent shrink-0" aria-hidden />
                <span>{item.text}</span>
                <span className="ml-6 size-1 rounded-full bg-border" aria-hidden />
              </div>
            );
          })}
        </div>

        {/* Duplicate copy for seamless loop */}
        <div className="flex shrink-0 items-center gap-8" aria-hidden="true">
          {TICKER_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={`ticker-2-${i}`}
                className="flex items-center gap-2 text-xs font-mono tracking-wide uppercase text-muted-foreground transition-colors hover:text-foreground"
              >
                <Icon className="size-3.5 text-accent shrink-0" aria-hidden />
                <span>{item.text}</span>
                <span className="ml-6 size-1 rounded-full bg-border" aria-hidden />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
