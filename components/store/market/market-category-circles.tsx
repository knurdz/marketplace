import type { ReactNode } from "react";
import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { SectionHeading } from "@/components/store/section-heading";
import {
  MARKET_CATEGORIES,
  unsplashUrl,
  type MarketCategory,
} from "@/lib/store/home-demo";
import { cn } from "@/lib/utils";

function CategoryItem({
  href,
  active,
  label,
  children,
}: {
  href: string;
  active: boolean;
  label: string;
  children: ReactNode;
}) {
  return (
    <li className="w-24 shrink-0 snap-start">
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className="group flex w-full flex-col items-center gap-2"
      >
        <span
          className={cn(
            "relative flex size-24 items-center justify-center overflow-hidden rounded-full",
            "outline outline-2 -outline-offset-2 transition duration-200",
            active
              ? "outline-accent"
              : "outline-transparent group-hover:outline-accent/40",
          )}
        >
          {children}
        </span>
        <span
          className={cn(
            "max-w-full truncate text-center text-sm font-medium",
            active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground",
          )}
        >
          {label}
        </span>
      </Link>
    </li>
  );
}

function AllCategoryCircle({ active }: { active: boolean }) {
  return (
    <CategoryItem href="/#browse" active={active} label="All">
      <span
        className={cn(
          "flex size-full items-center justify-center transition",
          active
            ? "bg-accent text-accent-foreground"
            : "bg-muted text-muted-foreground group-hover:bg-muted/80 group-hover:text-foreground",
        )}
      >
        <LayoutGrid className="size-8 stroke-[1.5]" aria-hidden />
      </span>
    </CategoryItem>
  );
}

function CategoryCircle({
  category,
  active,
}: {
  category: MarketCategory;
  active: boolean;
}) {
  return (
    <CategoryItem
      href={`/?category=${encodeURIComponent(category.slug)}#browse`}
      active={active}
      label={category.label}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static remote showcase image */}
      <img
        src={unsplashUrl(category.photoId, 240)}
        alt=""
        loading="lazy"
        className="size-full object-cover transition duration-300 group-hover:scale-105"
      />
    </CategoryItem>
  );
}

export function MarketCategoryCircles({
  activeSlug,
}: {
  activeSlug?: string | null;
}) {
  const allSelected = !activeSlug;

  return (
    <section className="space-y-5">
      <SectionHeading title="Browse categories" />
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-background to-transparent"
        />
        <ul className="scrollbar-none flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain py-1 pr-8 sm:gap-6">
          <AllCategoryCircle active={allSelected} />
          {MARKET_CATEGORIES.map((category) => (
            <CategoryCircle
              key={category.slug}
              category={category}
              active={activeSlug === category.slug}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
