/**
 * Route-level loading chrome for App Router loading.tsx files.
 * Forms should keep button pending labels; use this for segment navigations.
 */
export function PageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      className="mx-auto flex min-h-[40vh] w-full max-w-5xl items-center justify-center px-6 py-16"
      role="status"
      aria-live="polite"
    >
      <p className="animate-pulse font-mono text-sm text-muted-foreground">
        <span className="text-accent">$ </span>
        {label}
      </p>
    </div>
  );
}
