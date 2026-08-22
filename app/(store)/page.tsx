import { CategoryMarquee } from "@/components/store/category-marquee";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works";
import { ProductGrid } from "@/components/store/product-grid";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { toSessionUserView } from "@/lib/appwrite/session-user";
import {
  getSessionUser,
  listCategories,
  listCoverImagesByProductIds,
  listFeaturedProducts,
  listTrendingProducts,
} from "@/lib/services";
import Link from "next/link";

export default async function Home() {
  const authUser = await getSessionUser();
  const user = authUser ? toSessionUserView(authUser) : null;
  const [categories, featured, trending] = await Promise.all([
    listCategories(),
    listFeaturedProducts({ limit: 8 }),
    listTrendingProducts({ limit: 8 }),
  ]);

  const coverIds = [...featured, ...trending].map((product) => product.$id);
  const covers = await listCoverImagesByProductIds(coverIds);

  return (
    <main className="relative">
      <LandingHero user={user} />

      {categories.length > 0 ? (
        <Reveal>
          <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-5 flex items-end justify-between gap-4">
              <h2 className="text-lg font-semibold tracking-tight">Shop by category</h2>
              <Button variant="ghost" asChild>
                <Link href="/categories">All categories</Link>
              </Button>
            </div>
            <CategoryMarquee categories={categories} />
          </section>
        </Reveal>
      ) : null}

      {featured.length > 0 ? (
        <Reveal>
          <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                  Featured
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight">Hand-picked</h2>
              </div>
              <Button asChild>
                <Link href="/market">Browse market</Link>
              </Button>
            </div>
            <ProductGrid products={featured} covers={covers} />
          </section>
        </Reveal>
      ) : null}

      {trending.length > 0 ? (
        <Reveal>
          <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-6">
              <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                Trending
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">Moving now</h2>
            </div>
            <ProductGrid products={trending} covers={covers} />
          </section>
        </Reveal>
      ) : null}

      <Reveal>
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
              How it works
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">Three steps. No noise.</h2>
          </div>
          <LandingHowItWorks />
        </section>
      </Reveal>
    </main>
  );
}
