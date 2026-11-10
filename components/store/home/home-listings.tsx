import { DemoListingCard } from "@/components/store/demo-listing-card";
import { SectionHeading } from "@/components/store/section-heading";
import type { HomeListing } from "@/lib/store/home-demo";

export function HomeListings({ listings }: { listings: HomeListing[] }) {
  return (
    <section className="space-y-5">
      <SectionHeading title="Just listed" />
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-background to-transparent"
        />
        <ul className="scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain py-1 pr-8 sm:gap-5">
          {listings.map((listing) => (
            <DemoListingCard
              key={listing.id}
              listing={listing}
              className="w-40 shrink-0 snap-start sm:w-44 lg:w-48"
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
