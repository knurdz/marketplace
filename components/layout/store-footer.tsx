import Link from "next/link";

const FOOTER_COLUMNS = [
  {
    title: "Market",
    links: [
      { href: "/market", label: "Browse listings" },
      { href: "/categories", label: "Categories" },
      { href: "/search", label: "Search" },
    ],
  },
  {
    title: "Sell",
    links: [
      { href: "/become-seller", label: "Become a seller" },
      { href: "/seller", label: "Seller dashboard" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Sign in" },
      { href: "/register", label: "Create account" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/legal/terms", label: "Terms" },
      { href: "/legal/privacy", label: "Privacy" },
      { href: "/faq", label: "Help" },
    ],
  },
] as const;

export function StoreFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-5">
        <div className="md:col-span-1">
          <p className="text-sm font-semibold tracking-tight">
            Knurdz<span className="text-accent">.</span>
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
            A market for the community that already ships.
          </p>
        </div>
        {FOOTER_COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
              {column.title}
            </p>
            <ul className="mt-3 space-y-2">
              {column.links.map((link) => (
                <li key={`${column.title}-${link.href}-${link.label}`}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-border">
        <p className="mx-auto w-full max-w-6xl px-4 py-4 font-mono text-xs text-muted-foreground sm:px-6">
          Knurdz Marketplace
        </p>
      </div>
    </footer>
  );
}
