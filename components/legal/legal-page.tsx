import type { ReactNode } from "react";

type LegalPageProps = {
  shell: string;
  title: string;
  updated: string;
  children: ReactNode;
};

/**
 * Shared chrome for static legal / FAQ pages.
 * Matches storefront mono + accent language (home/search).
 */
export function LegalPage({ shell, title, updated, children }: LegalPageProps) {
  return (
    <main className="relative mx-auto w-full max-w-5xl px-6 py-16 sm:px-10">
      <p className="font-mono text-sm text-accent">{shell}</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h1>
      <p className="mt-2 font-mono text-xs text-muted-foreground">
        Last updated: {updated}
      </p>
      <p className="mt-4 max-w-2xl border-l-2 border-accent/40 pl-3 text-sm text-muted-foreground">
        This is an MVP template for Knurdz Marketplace development — not formal
        legal advice. Replace with counsel-reviewed policies before production.
      </p>
      <div className="mt-10 max-w-2xl space-y-8 text-sm leading-relaxed text-foreground">
        {children}
      </div>
    </main>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="font-mono text-sm text-accent">{title}</h2>
      <div className="mt-2 space-y-3 text-muted-foreground">{children}</div>
    </section>
  );
}
