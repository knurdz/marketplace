import Link from "next/link";
import type { SessionUserView } from "@/lib/appwrite/session-user";
import { MarketplaceTerminal } from "@/components/landing/marketplace-terminal";
import { Button } from "@/components/ui/button";

type LandingHeroProps = {
  user: SessionUserView | null;
};

export function LandingHero({ user }: LandingHeroProps) {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid-faint opacity-40" />
      <div
        aria-hidden
        className="animate-hero-glow pointer-events-none absolute top-[-18%] left-[12%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--accent)_22%,transparent)_0%,transparent_68%)]"
      />
      <div
        aria-hidden
        className="animate-hero-glow pointer-events-none absolute right-[-8%] bottom-[-20%] h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--accent)_12%,transparent)_0%,transparent_70%)]"
      />

      <div className="relative mx-auto grid min-h-[calc(100dvh-4rem)] w-full max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-16">
        <div>
          <p
            className="animate-fade-up inline-flex w-fit items-center rounded-full border border-border bg-card px-3 py-1 font-mono text-sm"
            style={{ animationDelay: "40ms" }}
          >
            <span className="text-accent">$</span>
            <span className="text-muted-foreground">&nbsp;./welcome --market</span>
          </p>
          <h1
            className="animate-fade-up mt-6 text-5xl font-bold tracking-tight sm:text-7xl lg:text-8xl leading-[0.95]"
            style={{ animationDelay: "120ms" }}
          >
            <span className="block text-foreground">Browse.</span>
            <span className="block text-muted-foreground">Build.</span>
            <span className="block text-foreground">
              Together
              <span className="text-accent">.</span>
            </span>
          </h1>
          <p
            className="animate-fade-up mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
            style={{ animationDelay: "200ms" }}
          >
            Listings from Knurdz makers. Pay with PayHere, bank transfer, or
            free when the price is zero.
          </p>

          <div
            className="animate-fade-up mt-10 flex flex-wrap gap-3"
            style={{ animationDelay: "280ms" }}
          >
            {user ? (
              <>
                <Button size="lg" className="font-mono" asChild>
                  <Link href="/market">open market</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="font-mono"
                  asChild
                >
                  <Link href="/dashboard">open dashboard</Link>
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" className="font-mono" asChild>
                  <Link href="/market">browse market</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="font-mono"
                  asChild
                >
                  <Link href="/register">create account</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        <div
          className="animate-fade-up hidden lg:block"
          style={{ animationDelay: "200ms" }}
        >
          <MarketplaceTerminal />
        </div>
      </div>
    </section>
  );
}
