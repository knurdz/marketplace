import Link from "next/link";
import { notFound } from "next/navigation";
import { EditProductForm } from "@/components/seller/edit-product-form";
import { BUCKET_PRODUCT_IMAGES } from "@/lib/appwrite/config";
import { getFilePreviewUrl } from "@/lib/appwrite/storage-urls";
import {
  getOwnSellerProduct,
  listCategories,
  listProductImages,
} from "@/lib/services";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function SellerEditListingPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getOwnSellerProduct(id);
  if (!product) notFound();

  const [categories, productImages] = await Promise.all([
    listCategories({ limit: 100 }),
    listProductImages(product.$id),
  ]);

  if (product.status === "archived") {
    return (
      <div className="mx-auto max-w-3xl">
        <p className="font-mono text-sm text-accent">$ ./seller --listings --edit</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight">Archived listing</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{product.title}</span> is
          archived and cannot be edited. It is not shown on the storefront.
        </p>
        <Link
          href="/seller/listings"
          className="mt-8 inline-block text-sm text-accent hover:underline"
        >
          ← Back to listings
        </Link>
      </div>
    );
  }

  const images = productImages.map((image) => ({
    id: image.$id,
    previewUrl: getFilePreviewUrl(BUCKET_PRODUCT_IMAGES, image.fileId, {
      width: 112,
      height: 112,
    }),
    alt: image.alt,
  }));

  return (
    <div className="mx-auto max-w-3xl">
      <p className="font-mono text-sm text-accent">$ ./seller --listings --edit</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight">Edit listing</h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Update fields for <span className="font-medium">{product.title}</span>.
        Status stays <span className="font-mono">{product.status}</span> until you
        publish in a later step.
      </p>

      <EditProductForm
        product={product}
        categories={categories}
        images={images}
      />

      <p className="mt-8">
        <Link
          href="/seller/listings"
          className="text-sm text-accent hover:underline"
        >
          ← Back to listings
        </Link>
      </p>
    </div>
  );
}
