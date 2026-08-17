import type { PublicSellerInfo } from "@/lib/services/sellers";

type SellerPolicyBlocksProps = {
  seller: Pick<PublicSellerInfo, "returnPolicy" | "shippingPolicy">;
  className?: string;
};

export function SellerPolicyBlocks({ seller, className }: SellerPolicyBlocksProps) {
  const hasReturn = Boolean(seller.returnPolicy);
  const hasShipping = Boolean(seller.shippingPolicy);
  if (!hasReturn && !hasShipping) return null;

  return (
    <div className={className}>
      {hasReturn ? (
        <section aria-labelledby="return-policy-heading">
          <h3
            id="return-policy-heading"
            className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
          >
            Return policy
          </h3>
          <p className="mt-2 max-w-prose whitespace-pre-wrap text-sm text-muted-foreground">
            {seller.returnPolicy}
          </p>
        </section>
      ) : null}
      {hasShipping ? (
        <section
          aria-labelledby="shipping-policy-heading"
          className={hasReturn ? "mt-6" : undefined}
        >
          <h3
            id="shipping-policy-heading"
            className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
          >
            Shipping policy
          </h3>
          <p className="mt-2 max-w-prose whitespace-pre-wrap text-sm text-muted-foreground">
            {seller.shippingPolicy}
          </p>
        </section>
      ) : null}
    </div>
  );
}
