export function MarketplaceTerminal() {
  return (
    <div
      aria-hidden
      className="overflow-hidden rounded-lg border border-accent/25 bg-background-alt shadow-[0_0_0_1px_color-mix(in_srgb,var(--accent)_12%,transparent)]"
    >
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <span className="size-2.5 shrink-0 rounded-full bg-[#ff5f56]" />
        <span className="size-2.5 shrink-0 rounded-full bg-[#ffbd2e]" />
        <span className="size-2.5 shrink-0 rounded-full bg-[#27c93f]" />
        <p className="flex-1 text-center font-mono text-sm text-muted-foreground">
          knurdz@market
        </p>
        <p className="font-mono text-sm text-muted-foreground">~/listings</p>
      </div>
      <div className="space-y-4 p-5 font-mono text-sm leading-relaxed">
        <p>
          <span className="text-accent">$ market status</span>
          <br />
          <span className="text-foreground">branch: live</span>
        </p>
        <p>
          <span className="text-accent">$ cat listings.md</span>
          <br />
          <span className="text-foreground"># Knurdz Market</span>
          <br />
          <span className="text-muted-foreground">
            stickers, tools, kits from makers
          </span>
        </p>
        <p>
          <span className="text-accent">$ cart add --sku knurdz-tee</span>
          <br />
          <span className="text-foreground">added</span>
        </p>
        <p>
          <span className="text-accent">$ checkout --payhere</span>
          <br />
          <span className="text-foreground">ready</span>
        </p>
        <p className="flex items-center gap-1.5 text-muted-foreground">
          <span className="text-accent">$</span>
          <span
            className="inline-block h-4 w-2 bg-accent animate-cursor-blink"
          />
        </p>
      </div>
    </div>
  );
}
