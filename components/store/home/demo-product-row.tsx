import Link from "next/link";
import { Heart, Star } from "lucide-react";
import { SectionHeading } from "@/components/store/section-heading";
import {
  formatLkr,
  unsplashUrl,
  type DemoProduct,
  type DemoSection,
} from "@/lib/store/home-demo";

export function Rating({
  value,
  reviews,
  size = "sm",
}: {
  value: number;
  reviews: number;
  size?: "sm" | "md";
}) {
  const filled = Math.round(value);
  const star = size === "md" ? "size-4.5" : "size-3.5";
  return (
    <div className="flex items-center gap-1.5">
      <span className="flex" aria-label={`Rated ${value} out of 5`}>
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={
              i < filled
                ? `${star} fill-amber-400 text-amber-400`
                : `${star} fill-muted text-muted-foreground/40`
            }
            aria-hidden
          />
        ))}
      </span>
      <span className={size === "md" ? "text-sm text-muted-foreground" : "text-xs text-muted-foreground"}>
        {size === "md" ? `${value} · ${reviews} ratings` : `(${reviews})`}
      </span>
    </div>
  );
}

function DemoProductCard({ product }: { product: DemoProduct }) {
  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : null;

  return (
    <li>
      <Link
        href={`/showcase/${product.id}`}
        className="group flex h-full flex-col gap-3"
      >
        <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element -- static remote showcase image */}
          <img
            src={unsplashUrl(product.photoId, 480)}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
          <span
            className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm"
            aria-hidden
          >
            <Heart className="size-4" />
          </span>
          {discount ? (
            <span className="absolute top-2 left-2 rounded-md bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
              -{discount}%
            </span>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <p className="line-clamp-2 text-sm leading-snug text-foreground group-hover:text-accent">
            {product.title}
          </p>
          <Rating value={product.rating} reviews={product.reviews} />
          <p className="flex flex-wrap items-baseline gap-2">
            <span className="text-base font-bold text-foreground">
              {formatLkr(product.price)}
            </span>
            {product.compareAtPrice ? (
              <span className="text-xs text-muted-foreground line-through">
                {formatLkr(product.compareAtPrice)}
              </span>
            ) : null}
          </p>
        </div>
      </Link>
    </li>
  );
}

export function DemoProductRow({
  section,
  href = "/",
}: {
  section: DemoSection;
  href?: string;
}) {
  return (
    <section className="space-y-5">
      <SectionHeading title={section.title} href={href} />
      <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
        {section.products.map((product) => (
          <DemoProductCard key={`${section.id}-${product.id}`} product={product} />
        ))}
      </ul>
    </section>
  );
}
