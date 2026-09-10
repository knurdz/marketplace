"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Store, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CreatorCtaBanner({ className }: { className?: string }) {
  return (
    <section
      aria-label="Become a seller on Knurdz"
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border bg-card p-8 sm:p-12 shadow-md transition-all duration-300 hover:border-accent/35",
        className,
      )}
    >
      {/* Subtle moving ambient glows */}
      <div className="animate-pulse-subtle pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
      <div className="animate-float-slow pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent/10 blur-2xl" />

      <div className="relative z-10 flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3 py-1 text-xs font-mono uppercase tracking-wider text-accent backdrop-blur-xs">
            <Store className="size-3.5" />
            <span>Seller Onboarding Open</span>
          </div>

          <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Have something to sell? <br className="hidden sm:inline" />
            Ship to the Knurdz community.
          </h2>

          <p className="mt-2 text-base text-muted-foreground">
            List your digital tools, hardware, design assets, or goods. Keep 100% of your earnings with instant PayHere or direct bank settlement.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Button
              size="lg"
              asChild
              className="group/cta bg-accent text-accent-foreground font-semibold shadow-md transition-all duration-300 hover:scale-105 hover:bg-accent-bright hover:shadow-[0_0_24px_rgba(0,199,88,0.35)]"
            >
              <Link href="/become-seller">
                Start selling today
                <ArrowRight className="ml-1.5 size-4 transition-transform duration-200 group-hover/cta:translate-x-1" />
              </Link>
            </Button>

            <Button variant="ghost" size="lg" asChild className="hover:text-accent">
              <Link href="/market">
                Explore listings
              </Link>
            </Button>
          </div>
        </div>

        {/* Floating visual objects */}
        <div className="relative hidden md:block w-72 shrink-0">
          <div className="relative rounded-2xl border border-border/80 bg-background-alt/90 p-5 shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <TrendingUp className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Fast Verification</p>
                <p className="text-xs text-muted-foreground">Live within 24h</p>
              </div>
            </div>

            <div className="mt-4 space-y-2 border-t border-border/60 pt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Commission</span>
                <span className="font-mono font-bold text-accent">0% on Free</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Settlement</span>
                <span className="font-mono font-bold text-foreground">Direct PayHere</span>
              </div>
            </div>

            {/* Floating micro-badge */}
            <div className="animate-float absolute -top-3 -right-3 flex items-center gap-1.5 rounded-full border border-accent/40 bg-card px-2.5 py-1 shadow-md">
              <Sparkles className="size-3 text-accent" />
              <span className="font-mono text-[10px] font-semibold text-accent">Active community</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
