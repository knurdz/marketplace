import Link from "next/link";
import type { PublicSellerInfo } from "@/lib/services/sellers";
import { SellerPolicyBlocks } from "@/components/store/seller-policy-blocks";

type SellerInfoCardProps = {
  seller: PublicSellerInfo | null;
};

export function SellerInfoCard({ seller }: SellerInfoCardProps) {
  return (
    <section aria-labelledby="seller-info-heading" className="border-t border-border pt-10">
      <h2
        id="seller-info-heading"
        className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
      >
        Seller
      </h2>
      {seller ? (
        <div className="mt-4 space-y-2">
          <p className="text-lg font-semibold tracking-tight">{seller.shopName}</p>
          <Link
            href={`/shop/${seller.slug}`}
            className="font-mono text-xs text-accent hover:underline"
          >
            @{seller.slug}
          </Link>
          {seller.bio ? (
            <p className="max-w-prose text-sm text-muted-foreground">{seller.bio}</p>
          ) : null}
          <SellerPolicyBlocks seller={seller} className="mt-4" />
        </div>
      ) : (
        <p className="mt-4 font-mono text-sm text-muted-foreground">
          Seller unavailable.
        </p>
      )}
    </section>
  );
}
