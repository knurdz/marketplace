import { CouponsManager } from "@/components/admin/coupons-manager";
import { listCouponsAdmin } from "@/lib/services/coupons";

export default async function AdminCouponsPage() {
  const coupons = await listCouponsAdmin();

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="mt-3 text-3xl font-bold tracking-tight">Coupons</h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Create discount codes for checkout. Buyers enter a code at checkout;
        the server validates and applies the discount.
      </p>
      <div className="mt-10">
        <CouponsManager coupons={coupons} />
      </div>
    </div>
  );
}
