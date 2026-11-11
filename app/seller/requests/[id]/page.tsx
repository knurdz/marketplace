import { notFound, redirect } from "next/navigation";
import { SellerRequestDetail } from "@/components/seller/seller-request-detail";
import { getLoggedInUser } from "@/lib/appwrite/session";
import { getOwnPurchaseRequestDetail } from "@/lib/services";
import { listCoverImagesByProductIds } from "@/lib/services/products";

type SellerRequestDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SellerRequestDetailPage({
  params,
}: SellerRequestDetailPageProps) {
  const user = await getLoggedInUser();
  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const detail = await getOwnPurchaseRequestDetail(id);
  if (!detail || detail.request.sellerId !== user.$id) {
    notFound();
  }

  const { request, contact } = detail;
  const covers = await listCoverImagesByProductIds([request.productId]);
  const coverFileId = covers[request.productId]?.fileId;

  return (
    <SellerRequestDetail
      request={request}
      contact={contact}
      coverFileId={coverFileId}
    />
  );
}
