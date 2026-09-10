"use client";

import { CheckCircle2, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Ambient glowing mesh elements that drift subtly in the background,
 * transforming the flat black void into a rich, deep, luminous marketplace environment.
 */
export function AmbientMarketplaceGlow() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Primary emerald ambient aura */}
      <div className="animate-pulse-subtle absolute -top-24 left-1/4 h-[380px] w-[500px] rounded-full bg-accent/8 blur-[120px] dark:bg-accent/[0.07]" />

      {/* Secondary cyan/slate drift aura */}
      <div className="animate-float-slow absolute top-1/3 -right-24 h-[320px] w-[440px] rounded-full bg-emerald-500/5 blur-[130px] dark:bg-accent/[0.05]" />

      {/* Tertiary bottom warmth */}
      <div className="animate-float-delayed absolute bottom-1/4 -left-20 h-[300px] w-[400px] rounded-full bg-accent/6 blur-[100px] dark:bg-accent/[0.04]" />
    </div>
  );
}

/**
 * Static badge chips aligned horizontally under the featured listings without moving
 */
export function FloatingMarketBadges({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-row items-center gap-2.5 sm:gap-3 overflow-x-auto scrollbar-none py-1", className)}>
      {/* Badge 1: Live Drops */}
      <div className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-card/90 px-3.5 py-1.5 shadow-xs backdrop-blur-md transition-colors hover:border-accent/50 hover:bg-card-hover">
        <span className="size-2 rounded-full bg-accent" />
        <span className="font-mono text-xs font-medium text-foreground">
          Live Market Drops
        </span>
      </div>

      {/* Badge 2: Verified Sellers */}
      <div className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-card/90 px-3.5 py-1.5 shadow-xs backdrop-blur-md transition-colors hover:border-accent/50 hover:bg-card-hover">
        <ShieldCheck className="size-3.5 text-accent" />
        <span className="font-mono text-xs font-medium text-foreground">
          100% Verified Sellers
        </span>
      </div>

      {/* Badge 3: PayHere & Instant Checkout */}
      <div className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-card/90 px-3.5 py-1.5 shadow-xs backdrop-blur-md transition-colors hover:border-accent/50 hover:bg-card-hover">
        <Zap className="size-3.5 text-accent" />
        <span className="font-mono text-xs font-medium text-foreground">
          PayHere & Bank Verified
        </span>
      </div>
    </div>
  );
}

/**
 * 3D-styled showcase object for when products don't have large cover photos,
 * or as an interactive centerpiece object.
 */
export function MarketplaceFloatingCard() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Background ambient glow behind card */}
      <div className="animate-pulse-subtle absolute inset-0 -z-10 rounded-3xl bg-accent/20 blur-2xl" />

      {/* Main elevated glass card */}
      <div className="relative w-full max-w-sm rounded-2xl border border-border/80 bg-card/90 p-5 shadow-xl backdrop-blur-xl transition-transform duration-500 hover:scale-[1.02] hover:border-accent/50">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <Sparkles className="size-4" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-accent font-mono">
                Community Marketplace
              </p>
              <p className="text-xs text-muted-foreground">Peer-to-peer verified</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">
            <CheckCircle2 className="size-3" />
            Active
          </span>
        </div>

        {/* Floating miniature stats */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border/60 bg-background-alt/60 p-3">
            <p className="font-mono text-xs text-muted-foreground">Order Settlement</p>
            <p className="mt-1 font-mono text-base font-bold text-foreground">Instant</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-background-alt/60 p-3">
            <p className="font-mono text-xs text-muted-foreground">Buyer Protection</p>
            <p className="mt-1 font-mono text-base font-bold text-accent">100%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
