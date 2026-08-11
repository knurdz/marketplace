import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
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
  );
}
