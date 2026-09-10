import { CouponsManager } from "@/components/admin/coupons-manager";
import { PortalPageHeader } from "@/components/layout/portal-page-header";
import { listCouponsAdmin } from "@/lib/services/coupons";

export default async function AdminCouponsPage() {
  const coupons = await listCouponsAdmin();

  return (
    <div className="max-w-3xl">
      <PortalPageHeader
        title="Coupons"
        description="Create discount codes for checkout. Buyers enter a code at checkout; the server validates and applies the discount."
      />
      <div className="mt-6">
        <CouponsManager coupons={coupons} />
      </div>
    </div>
  );
}
