import { notFound } from "next/navigation";
import { ProductList } from "@/components/store/product-list";
import { getShopBannerPreviewUrl } from "@/lib/appwrite/storage-urls";
import { getPublicSellerBySlug, listActiveProducts } from "@/lib/services";

type ShopPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ShopPage({ params }: ShopPageProps) {
  const { slug } = await params;
  const seller = await getPublicSellerBySlug(slug);
  if (!seller) notFound();

  const products = await listActiveProducts({
    sellerId: seller.userId,
    limit: 48,
  });

  const bannerUrl = getShopBannerPreviewUrl(seller.bannerFileId);

  return (
    <main className="relative mx-auto w-full max-w-5xl px-6 py-16 sm:px-10">
      <p className="font-mono text-sm text-accent">$ ./shop --slug={seller.slug}</p>

      {bannerUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- Appwrite Storage URL
        <img
          src={bannerUrl}
          alt=""
          className="mt-8 h-40 w-full rounded-md border border-border object-cover sm:h-52"
        />
      ) : null}

      <header className={bannerUrl ? "mt-8" : "mt-8"}>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {seller.shopName}
        </h1>
        <p className="mt-2 font-mono text-sm text-muted-foreground">
          @{seller.slug}
        </p>
        {seller.bio ? (
          <p className="mt-4 max-w-prose text-sm text-muted-foreground">
            {seller.bio}
          </p>
        ) : null}
      </header>

      <section aria-labelledby="shop-listings-heading" className="mt-12">
        <h2
          id="shop-listings-heading"
          className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
        >
          Listings
        </h2>
        {products.length > 0 ? (
          <div className="mt-4">
            <ProductList products={products} />
          </div>
        ) : (
          <p className="mt-4 font-mono text-sm text-muted-foreground">
            No active listings yet.
          </p>
        )}
      </section>
    </main>
  );
}
