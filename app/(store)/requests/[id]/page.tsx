import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PurchaseRequestContactCard } from "@/components/store/purchase-request-contact-card";
import { SellerReviewForm } from "@/components/store/seller-review-form";
import { formatProductPrice } from "@/components/store/product-display";
import { formatPurchaseRequestStatus } from "@/lib/request-display";
import { getLoggedInUser } from "@/lib/appwrite/session";
import {
  canReviewSellerRequest,
  getOwnPurchaseRequestDetail,
  getOwnReviewForRequest,
} from "@/lib/services";
import { Button } from "@/components/ui/button";

type BuyerRequestDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BuyerRequestDetailPage({
  params,
}: BuyerRequestDetailPageProps) {
  const user = await getLoggedInUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/requests")}`);
  }

  const { id } = await params;
  const detail = await getOwnPurchaseRequestDetail(id);
  if (!detail || detail.request.buyerId !== user.$id) {
    notFound();
  }

  const { request, contact } = detail;
  const [eligibility, existingReview] = await Promise.all([
    canReviewSellerRequest(request.$id),
    getOwnReviewForRequest(request.$id),
  ]);
  const unitLabel = formatProductPrice({
    price: request.unitPrice,
    currency: request.currency,
    isFree: request.unitPrice === 0,
  });

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <p className="text-sm text-muted-foreground">
        <Link href="/requests" className="hover:text-foreground">
          Requests
        </Link>
        {" / "}
        {request.title}
      </p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">{request.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Status:{" "}
        <span
          className="font-medium text-foreground"
          data-testid="request-status"
        >
          {formatPurchaseRequestStatus(request.status)}
        </span>
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Quantity {request.quantity} · {unitLabel} each
      </p>

      <div className="mt-8">
        <PurchaseRequestContactCard title="Seller contact" contact={contact} />
      </div>

      {request.status === "sold" ? (
        <div className="mt-6">
          <SellerReviewForm
            requestId={request.$id}
            canReview={eligibility.eligible}
            existing={existingReview}
            existingStatus={eligibility.existingStatus}
          />
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="outline" asChild>
          <Link href={`/products/${request.productId}`}>View product</Link>
        </Button>
      </div>
    </main>
  );
}
