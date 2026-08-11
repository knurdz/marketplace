export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--background-alt)_0%,_transparent_55%)]"
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-16 sm:px-10">
        <p className="font-mono text-sm text-accent">
          $ ./marketplace --bootstrap
        </p>

        <h1 className="mt-6 text-5xl font-bold tracking-tight sm:text-7xl">
          Knurdz
          <span className="text-accent">.</span>
        </h1>

        <p className="mt-4 max-w-xl text-lg text-muted sm:text-xl">
          A marketplace for creators — browse listings, sell what you build, and
          check out with PayHere, bank transfer, or free.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <a
            href="#"
            className="inline-flex items-center justify-center rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
          >
            Browse
          </a>
          <a
            href="#"
            className="inline-flex items-center justify-center rounded-md border border-border bg-transparent px-5 py-2.5 font-mono text-sm text-foreground transition hover:bg-card"
          >
            Sign in
          </a>
        </div>
      </div>
    </main>
  );
}
