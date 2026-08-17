import Link from "next/link";
import { CreateProductForm } from "@/components/seller/create-product-form";
import { listCategories } from "@/lib/services";

export default async function SellerNewListingPage() {
  const categories = await listCategories({ limit: 100 });

  return (
    <div className="mx-auto max-w-3xl">
      <p className="font-mono text-sm text-accent">$ ./seller --listings --new</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight">Create listing</h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Add a draft product with images. It will not appear on the storefront until
        you publish it in a later step.
      </p>

      <CreateProductForm categories={categories} />

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
