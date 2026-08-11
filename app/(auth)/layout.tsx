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
        className="relative min-h-screen overflow-hidden bg-background text-foreground outline-none"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--background-alt)_0%,_transparent_55%)]"
        />
        <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
          <Link
            href="/"
            className="mb-8 font-mono text-sm text-muted-foreground transition hover:text-foreground"
          >
            ← Knurdz
            <span className="text-accent">.</span>
          </Link>
          {children}
        </div>
      </main>
    </>
  );
}
