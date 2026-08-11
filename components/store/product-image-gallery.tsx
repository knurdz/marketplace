import { BUCKET_PRODUCT_IMAGES } from "@/lib/appwrite/config";
import { getFilePreviewUrl } from "@/lib/appwrite/storage-urls";
import type { ProductImage } from "@/lib/types";

type ProductImageGalleryProps = {
  images: ProductImage[];
  productTitle: string;
};

export function ProductImageGallery({
  images,
  productTitle,
}: ProductImageGalleryProps) {
  if (images.length === 0) {
    return (
      <div
        className="flex aspect-[4/3] w-full items-center justify-center border border-dashed border-border bg-muted/30"
        aria-label="No product images"
      >
        <p className="font-mono text-sm text-muted-foreground">
          No images for this listing yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] w-full overflow-hidden border border-border bg-muted/20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getFilePreviewUrl(BUCKET_PRODUCT_IMAGES, images[0].fileId, {
            width: 960,
            height: 720,
          })}
          alt={images[0].alt ?? productTitle}
          className="h-full w-full object-cover"
        />
      </div>
      {images.length > 1 ? (
        <ul className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {images.slice(1).map((image) => (
            <li
              key={image.$id}
              className="relative aspect-square overflow-hidden border border-border"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getFilePreviewUrl(BUCKET_PRODUCT_IMAGES, image.fileId, {
                  width: 160,
                  height: 160,
                })}
                alt={image.alt ?? productTitle}
                className="h-full w-full object-cover"
              />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
