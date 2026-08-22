import Link from "next/link";
import type { SessionUserView } from "@/lib/appwrite/session-user";
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
        className="animate-hero-glow pointer-events-none absolute top-[-20%] left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--accent)_18%,transparent)_0%,transparent_68%)]"
      />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col justify-center px-4 py-20 sm:px-6 lg:px-8">
        <p
          className="animate-fade-up text-xs font-medium tracking-[0.22em] text-muted-foreground uppercase"
          style={{ animationDelay: "40ms" }}
        >
          Knurdz Marketplace
        </p>
        <h1
          className="animate-fade-up mt-5 max-w-3xl text-5xl font-bold tracking-tight sm:text-7xl"
          style={{ animationDelay: "120ms" }}
        >
          Find what makers ship
          <span className="text-accent">.</span>
        </h1>
        <p
          className="animate-fade-up mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
          style={{ animationDelay: "200ms" }}
        >
          Browse listings and check out with PayHere, bank transfer, or free
          when the price is zero.
        </p>

        <div
          className="animate-fade-up mt-10 flex flex-wrap gap-3"
          style={{ animationDelay: "280ms" }}
        >
          {user ? (
            <>
              <Button size="lg" asChild>
                <Link href="/market">Go to market</Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </>
          ) : (
            <>
              <Button size="lg" asChild>
                <Link href="/register">Create account</Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/market">Browse market</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
