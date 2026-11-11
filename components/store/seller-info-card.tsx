import Link from "next/link";
import type { PublicSellerInfo } from "@/lib/services/sellers";
import { SellerPolicyBlocks } from "@/components/store/seller-policy-blocks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SellerInfoCardProps = {
  seller: PublicSellerInfo | null;
};

export function SellerInfoCard({ seller }: SellerInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>The person selling this</CardTitle>
      </CardHeader>
      <CardContent>
        {seller ? (
          <div className="space-y-3">
            <p className="text-lg font-semibold tracking-tight">{seller.shopName}</p>
            <p className="text-sm text-muted-foreground">
              An individual in the community. Knurdz does not sell this item.
            </p>
            {seller.bio ? (
              <p className="max-w-prose text-sm text-muted-foreground">{seller.bio}</p>
            ) : null}
            <SellerPolicyBlocks seller={seller} className="mt-2" />
            <Button variant="secondary" asChild>
              <Link href={`/shop/${seller.slug}`}>See their other listings</Link>
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            This listing&apos;s person is not available right now.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
