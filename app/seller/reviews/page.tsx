import { SellerReviewsPanel } from "@/components/seller/seller-reviews-panel";
import { PortalPageHeader } from "@/components/layout/portal-page-header";
import { requireLabel } from "@/lib/backend/roles";
import { getOwnSellerProfile } from "@/lib/services/seller-application";
import { getOwnSellerReviewInsights } from "@/lib/services/reviews";

export default async function SellerReviewsPage() {
  await requireLabel("seller");

  const [insights, profile] = await Promise.all([
    getOwnSellerReviewInsights(),
    getOwnSellerProfile(),
  ]);

  return (
    <div className="w-full">
      <PortalPageHeader
        title="Reviews"
        description="Average rating and feedback from buyers. Only admin-approved reviews count toward your public shop score."
      />

      <div className="mt-6">
        <SellerReviewsPanel
          metrics={insights.metrics}
          reviews={insights.reviews}
          shopSlug={profile?.slug ?? null}
          variant="page"
        />
      </div>
    </div>
  );
}
