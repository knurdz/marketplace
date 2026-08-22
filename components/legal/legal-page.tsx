import type { ReactNode } from "react";

type LegalPageProps = {
  shell?: string;
  title: string;
  updated: string;
  children: ReactNode;
};

/**
 * Shared chrome for static legal / FAQ pages.
 */
export function LegalPage({ title, updated, children }: LegalPageProps) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
        Legal
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h1>
      <p className="mt-2 font-mono text-xs text-muted-foreground">
        Last updated: {updated}
      </p>
      <p className="mt-4 max-w-2xl border-l-2 border-border pl-3 text-sm text-muted-foreground">
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
      <h2 className="text-sm font-medium">{title}</h2>
      <div className="mt-2 space-y-3 text-muted-foreground">{children}</div>
    </section>
  );
}
