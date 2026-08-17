import Link from "next/link";
import { notFound } from "next/navigation";
import { EditListingForm } from "@/components/seller/edit-listing-form";
import { Button } from "@/components/ui/button";
import { listCategories } from "@/lib/services/categories";
import { listProductImages } from "@/lib/services/products";
import { getOwnProduct } from "@/lib/services/seller-listings";

type EditListingPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getOwnProduct(id),
    listCategories(),
  ]);

  if (!product) {
    notFound();
  }

  const images = await listProductImages(product.$id);

  return (
    <div className="mx-auto max-w-3xl">
      <p className="font-mono text-sm text-accent">$ ./seller --listings edit</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight">Edit listing</h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Update your draft or live listing. Publishing to the storefront is step 3.6.
      </p>

      <EditListingForm product={product} categories={categories} images={images} />

      <div className="mt-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/seller/listings">Back to listings</Link>
        </Button>
      </div>
    </div>
  );
}
