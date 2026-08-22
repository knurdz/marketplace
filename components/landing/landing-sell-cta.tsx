import Link from "next/link";
import { Button } from "@/components/ui/button";

type LandingSellCtaProps = {
  isSeller: boolean;
};

export function LandingSellCta({ isSeller }: LandingSellCtaProps) {
  return (
    <section className="rounded-2xl border border-border bg-card/40 px-6 py-12 sm:px-10">
      <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
        For makers
      </p>
      <h2 className="mt-3 max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">
        List what you already make.
      </h2>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
        Apply once. After approval, publish listings, fulfill orders, and get
        paid through PayHere or bank transfer.
      </p>
      <div className="mt-8">
        <Button size="lg" asChild>
          <Link href={isSeller ? "/seller" : "/become-seller"}>
            {isSeller ? "Open seller dashboard" : "Become a seller"}
          </Link>
        </Button>
      </div>
    </section>
  );
}
