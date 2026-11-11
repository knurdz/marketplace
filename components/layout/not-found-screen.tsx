import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  FolderOpen,
  LayoutGrid,
  Package,
  SearchX,
  Store,
} from "lucide-react";
import { BrandLogoLink } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NotFoundLink = {
  href: string;
  label: string;
  variant?: "default" | "secondary";
};

export type NotFoundKind =
  | "product"
  | "shop"
  | "category"
  | "showcase"
  | "buyer-request"
  | "seller-request"
  | "admin-shop"
  | "store"
  | "seller"
  | "admin"
  | "general";

type NotFoundPreset = {
  title: string;
  description: string;
  icon: LucideIcon;
  links: NotFoundLink[];
};

const PRESETS: Record<NotFoundKind, NotFoundPreset> = {
  product: {
    title: "This product isn’t available",
    description:
      "Check the link or browse the market for something else.",
    icon: Package,
    links: [
      { href: "/market", label: "Market" },
      { href: "/", label: "Home", variant: "secondary" },
    ],
  },
  shop: {
    title: "This shop isn’t available",
    description:
      "Check the link or browse the market for other shops.",
    icon: Store,
    links: [
      { href: "/market", label: "Market" },
      { href: "/", label: "Home", variant: "secondary" },
    ],
  },
  category: {
    title: "This category isn’t available",
    description:
      "Check the link or browse categories for something else.",
    icon: LayoutGrid,
    links: [
      { href: "/categories", label: "Categories" },
      { href: "/", label: "Home", variant: "secondary" },
    ],
  },
  showcase: {
    title: "This product isn’t available",
    description:
      "Check the link or browse the market for something else.",
    icon: Package,
    links: [
      { href: "/market", label: "Market" },
      { href: "/", label: "Home", variant: "secondary" },
    ],
  },
  "buyer-request": {
    title: "This request isn’t available",
    description: "Check the link or open your purchase requests.",
    icon: FolderOpen,
    links: [{ href: "/requests", label: "My requests" }],
  },
  "seller-request": {
    title: "This request isn’t available",
    description: "Check the link or open your seller requests.",
    icon: FolderOpen,
    links: [{ href: "/seller/requests", label: "Seller requests" }],
  },
  "admin-shop": {
    title: "This shop isn’t available",
    description: "Check the link or return to the sellers list.",
    icon: Store,
    links: [{ href: "/admin/sellers", label: "Sellers" }],
  },
  store: {
    title: "Page not found",
    description:
      "Check the link or try one of the options below.",
    icon: SearchX,
    links: [
      { href: "/", label: "Home" },
      { href: "/market", label: "Market", variant: "secondary" },
      { href: "/categories", label: "Categories", variant: "secondary" },
    ],
  },
  seller: {
    title: "Page not found",
    description: "Check the link or return to your seller dashboard.",
    icon: SearchX,
    links: [{ href: "/seller", label: "Seller home" }],
  },
  admin: {
    title: "Page not found",
    description: "Check the link or return to the admin dashboard.",
    icon: SearchX,
    links: [{ href: "/admin", label: "Admin home" }],
  },
  general: {
    title: "Page not found",
    description:
      "Check the link or try one of the options below.",
    icon: SearchX,
    links: [
      { href: "/", label: "Home" },
      { href: "/market", label: "Market", variant: "secondary" },
    ],
  },
};

type NotFoundScreenProps = {
  kind: NotFoundKind;
  /** Show brand logo above the message (root / unknown URL). */
  branded?: boolean;
  className?: string;
};

/**
 * Shared 404 UI for App Router not-found.tsx files.
 * Copy stays generic so missing, inactive, and unauthorized-as-404 cases share one UX.
 */
export function NotFoundScreen({
  kind,
  branded = false,
  className,
}: NotFoundScreenProps) {
  const preset = PRESETS[kind];
  const Icon = preset.icon;

  return (
    <main
      className={cn(
        "mx-auto flex w-full max-w-lg flex-col items-center justify-center px-6 py-16 text-center",
        branded ? "min-h-screen" : "min-h-[50vh]",
        className,
      )}
    >
      {branded ? (
        <BrandLogoLink className="mb-10" priority />
      ) : null}
      <div
        aria-hidden
        className="mb-5 flex size-12 items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground"
      >
        <Icon className="size-5" strokeWidth={1.75} />
      </div>
      <h1 className="font-heading text-2xl font-bold tracking-tight">
        {preset.title}
      </h1>
      <p className="mt-3 max-w-sm text-sm text-muted-foreground">
        {preset.description}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {preset.links.map((link) => (
          <Button
            key={link.href}
            variant={link.variant ?? "default"}
            asChild
          >
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>
    </main>
  );
}
