import { notFound, redirect } from "next/navigation";
import { BuyerRequestDetail } from "@/components/store/buyer-request-detail";
import { getLoggedInUser } from "@/lib/appwrite/session";
import {
  canReviewSellerRequest,
  getOwnPurchaseRequestDetail,
  getOwnReviewForRequest,
} from "@/lib/services";
import { listCoverImagesByProductIds } from "@/lib/services/products";

type BuyerRequestDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BuyerRequestDetailPage({
  params,
}: BuyerRequestDetailPageProps) {
  const { id } = await params;
  const user = await getLoggedInUser();
  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent(`/requests/${id}`)}`,
    );
  }

  const detail = await getOwnPurchaseRequestDetail(id);
  if (!detail || detail.request.buyerId !== user.$id) {
    notFound();
  }

  const { request, contact } = detail;
  const [eligibility, existingReview, covers] = await Promise.all([
    canReviewSellerRequest(request.$id),
    getOwnReviewForRequest(request.$id),
    listCoverImagesByProductIds([request.productId]),
  ]);
  const coverFileId = covers[request.productId]?.fileId;

  return (
    <BuyerRequestDetail
      request={request}
      contact={contact}
      coverFileId={coverFileId}
      canReview={eligibility.eligible}
      existingReview={existingReview}
      existingStatus={eligibility.existingStatus}
    />
  );
}
