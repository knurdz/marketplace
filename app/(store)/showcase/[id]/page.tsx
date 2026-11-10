import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CreditCard, Info, Search, ShieldCheck, Truck } from "lucide-react";
import { DemoProductRow, Rating } from "@/components/store/home/demo-product-row";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  demoProductDescription,
  formatLkr,
  getDemoProduct,
  relatedDemoProducts,
  unsplashUrl,
} from "@/lib/store/home-demo";

type ShowcasePageProps = {
  params: Promise<{ id: string }>;
};

const PERKS = [
  { icon: Truck, title: "Delivery across Sri Lanka", detail: "Sellers ship island-wide." },
  { icon: ShieldCheck, title: "Approved sellers", detail: "Every shop is reviewed before listing." },
  {
    icon: CreditCard,
    title: "Flexible payment",
    detail: "PayHere, bank transfer or cash on delivery.",
  },
] as const;

export async function generateMetadata({
  params,
}: ShowcasePageProps): Promise<Metadata> {
  const { id } = await params;
  const product = getDemoProduct(id);
  return { title: product ? `${product.title} · Knurdz Marketplace` : "Knurdz Marketplace" };
}

export default async function ShowcaseProductPage({ params }: ShowcasePageProps) {
  const { id } = await params;
  const product = getDemoProduct(id);
  if (!product) notFound();

  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : null;
  const related = relatedDemoProducts(product.id);
  const searchHref = `/search?q=${encodeURIComponent(product.searchTerm)}`;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/#browse">Browse</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="line-clamp-1">{product.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element -- static remote showcase image */}
          <img
            src={unsplashUrl(product.photoId, 1200)}
            alt={product.title}
            className="h-full w-full object-cover"
          />
          {discount ? (
            <span className="absolute top-4 left-4 rounded-lg bg-red-600 px-3 py-1 text-sm font-semibold text-white">
              -{discount}%
            </span>
          ) : null}
        </div>

        <div className="flex flex-col gap-6 lg:sticky lg:top-32 lg:self-start">
          <div className="space-y-3">
            <h1 className="text-2xl leading-tight font-bold tracking-tight text-foreground sm:text-3xl">
              {product.title}
            </h1>
            <Rating value={product.rating} reviews={product.reviews} size="md" />
          </div>

          <div className="rounded-2xl border border-border bg-background-alt p-5">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-bold tracking-tight text-foreground">
                {formatLkr(product.price)}
              </span>
              {product.compareAtPrice ? (
                <span className="text-base text-muted-foreground line-through">
                  {formatLkr(product.compareAtPrice)}
                </span>
              ) : null}
            </div>
            {product.compareAtPrice ? (
              <p className="mt-1 text-sm font-medium text-green-700">
                You save {formatLkr(product.compareAtPrice - product.price)}
              </p>
            ) : null}
          </div>

          <div
            role="note"
            className="flex gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900"
          >
            <Info className="mt-0.5 size-5 shrink-0 text-blue-600" aria-hidden />
            <p>
              <span className="font-semibold">Showcase item.</span> This product is part of
              our homepage preview and can&apos;t be ordered. Browse similar listings from
              real sellers instead.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={searchHref}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-accent-deep"
            >
              <Search className="size-4" aria-hidden />
              Find similar listings
            </Link>
            <Link
              href="/#browse"
              className="inline-flex flex-1 items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              Browse listings
            </Link>
          </div>

          <ul className="grid gap-3 sm:grid-cols-3">
            {PERKS.map(({ icon: Icon, title, detail }) => (
              <li
                key={title}
                className="flex flex-col gap-1 rounded-xl border border-border p-3"
              >
                <Icon className="size-5 text-accent" aria-hidden />
                <span className="text-sm font-semibold text-foreground">{title}</span>
                <span className="text-xs text-muted-foreground">{detail}</span>
              </li>
            ))}
          </ul>

          <section aria-labelledby="description-heading" className="border-t border-border pt-6">
            <h2 id="description-heading" className="text-base font-semibold text-foreground">
              About this item
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {demoProductDescription(product.id)}
            </p>
          </section>
        </div>
      </div>

      <div className="mt-14 pb-6">
        <DemoProductRow
          section={{ id: "related", title: "You may also like", products: related }}
        />
      </div>
    </main>
  );
}
