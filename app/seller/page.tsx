export default function SellerPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <p className="font-mono text-sm text-accent">$ ./seller --dashboard</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight">Dashboard</h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Empty seller shell. Listings, orders, and earnings land in Member 3
        steps.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {["Orders", "Revenue", "Listings"].map((label) => (
          <div
            key={label}
            className="rounded-md border border-border bg-card px-4 py-5"
          >
            <p className="font-mono text-xs text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight">—</p>
          </div>
        ))}
      </div>
    </div>
  );
}
