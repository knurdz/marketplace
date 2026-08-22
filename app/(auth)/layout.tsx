import Link from "next/link";
import type { ReactNode } from "react";
import { SkipToContent } from "@/components/layout/skip-to-content";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SkipToContent />
      <main
        id="main-content"
        tabIndex={-1}
        className="grid min-h-screen bg-background text-foreground outline-none lg:grid-cols-2"
      >
        <aside className="relative hidden overflow-hidden border-r border-border lg:block">
          <div aria-hidden className="absolute inset-0 bg-grid-faint opacity-50" />
          <div
            aria-hidden
            className="animate-hero-glow absolute top-[18%] left-[20%] h-72 w-72 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--accent)_16%,transparent)_0%,transparent_70%)]"
          />
          <div className="relative flex h-full flex-col justify-between px-12 py-16">
            <Link href="/" className="text-sm font-semibold tracking-tight">
              Knurdz<span className="text-accent">.</span>
            </Link>
            <div>
              <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
                Marketplace
              </p>
              <h1 className="mt-4 max-w-sm text-4xl font-bold tracking-tight">
                Trade what you build.
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
                One account for buying, selling, and running the floor.
              </p>
            </div>
            <p className="font-mono text-xs text-muted-foreground">knurdz.org</p>
          </div>
        </aside>
        <div className="relative flex min-h-screen items-center justify-center px-6 py-16">
          <div className="w-full max-w-md">
            <Link
              href="/"
              className="mb-8 inline-block text-sm text-muted-foreground transition hover:text-foreground lg:hidden"
            >
              ← Knurdz
              <span className="text-accent">.</span>
            </Link>
            {children}
          </div>
        </div>
      </main>
    </>
  );
}
