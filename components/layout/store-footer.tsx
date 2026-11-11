import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";

const FOOTER_COLUMNS = [
  {
    title: "Market",
    links: [
      { href: "/#browse", label: "Browse listings" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/faq", label: "FAQ" },
      { href: "/legal/terms", label: "Terms of Service" },
      { href: "/legal/privacy", label: "Privacy Policy" },
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
      { href: "/legal/terms", label: "Terms of Service" },
      { href: "/legal/privacy", label: "Privacy Policy" },
      { href: "/faq", label: "FAQ" },
    ],
  },
] as const;

export function StoreFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-background-alt">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-5 lg:px-8">
        <div className="md:col-span-1">
          <BrandLogo className="h-14" />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
            A market for the community that already ships.
          </p>
        </div>
        {FOOTER_COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <p className="text-sm font-semibold text-foreground">
              {column.title}
            </p>
            <ul className="mt-3 space-y-2">
              {column.links.map((link) => (
                <li key={`${column.title}-${link.href}-${link.label}`}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition hover:text-accent"
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
        <p className="mx-auto w-full max-w-7xl px-4 py-4 text-xs text-muted-foreground sm:px-6 lg:px-8">
          © Knurdz Marketplace
        </p>
      </div>
    </footer>
  );
}
