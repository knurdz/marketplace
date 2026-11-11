import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DemoProductRow } from "@/components/store/home/demo-product-row";
import { ShowcaseActionButtons } from "@/components/store/showcase-action-buttons";
import { ShowcaseGallery } from "@/components/store/showcase-gallery";
import { ShowcaseSellerRating } from "@/components/store/showcase-seller-rating";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getLoggedInUser } from "@/lib/appwrite/session";
import {
  demoProductBullets,
  demoProductDescription,
  demoProductPhotos,
  formatLkr,
  getDemoProduct,
  getDemoSellerMeta,
  relatedDemoProducts,
} from "@/lib/store/home-demo";

type ShowcasePageProps = {
  params: Promise<{ id: string }>;
};

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

  const user = await getLoggedInUser();
  const seller = getDemoSellerMeta(product.id);
  const loginHref = `/login?next=${encodeURIComponent(`/showcase/${product.id}`)}`;

  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : null;
  const related = relatedDemoProducts(product.id);
  const photos = demoProductPhotos(product);
  const about = demoProductDescription(product.id);
  const bullets = demoProductBullets(product.id);

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

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-12">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <ShowcaseGallery
            photoIds={photos}
            title={product.title}
            discount={discount}
          />
        </div>

        <div className="flex flex-col gap-6">
          <div className="space-y-3">
            <h1 className="text-2xl leading-tight font-bold tracking-tight text-foreground sm:text-3xl">
              {product.title}
            </h1>
            <ShowcaseSellerRating
              name={seller.listedBy}
              rating={seller.sellerRating}
              reviews={seller.sellerReviews}
            />
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

          <ShowcaseActionButtons
            showcaseId={product.id}
            title={product.title}
            isLoggedIn={Boolean(user)}
            loginHref={loginHref}
          />

          <section aria-labelledby="description-heading" className="border-t border-border pt-6">
            <h2
              id="description-heading"
              className="text-xl font-bold tracking-tight text-foreground sm:text-2xl"
            >
              About this item
            </h2>
            {about ? (
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                {about}
              </p>
            ) : null}
            {bullets.length > 0 ? (
              <ul className="mt-5 list-disc space-y-2 pl-5 text-base leading-relaxed text-foreground">
                {bullets.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            ) : null}
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
