import Link from "next/link";
import {
  formatLkr,
  unsplashUrl,
  type HomeListing,
} from "@/lib/store/home-demo";
import { cn } from "@/lib/utils";

export function DemoListingCard({
  listing,
  className,
}: {
  listing: HomeListing;
  className?: string;
}) {
  return (
    <li className={cn(className)}>
      <Link
        href={`/showcase/${listing.id}`}
        className="group flex h-full flex-col gap-3"
      >
        <div className="aspect-square overflow-hidden rounded-xl bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element -- static remote showcase image */}
          <img
            src={unsplashUrl(listing.photoId, 480)}
            alt={listing.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <p className="line-clamp-2 text-sm leading-snug text-foreground group-hover:text-accent">
            {listing.title}
          </p>
          <p className="text-base font-bold text-foreground">
            {formatLkr(listing.price)}
          </p>
          <p className="text-xs text-muted-foreground">
            Listed by {listing.listedBy}
          </p>
        </div>
      </Link>
    </li>
  );
}
