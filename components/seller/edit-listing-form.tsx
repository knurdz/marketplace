"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import {
  addOwnListingImages,
  archiveOwnListing,
  deleteOwnListingImage,
  updateOwnListing,
  type EditListingActionState,
} from "@/lib/appwrite/seller-listing-actions";
import { BUCKET_PRODUCT_IMAGES } from "@/lib/appwrite/config";
import { getFilePreviewUrl } from "@/lib/appwrite/storage-urls";
import type { Category, Product, ProductImage } from "@/lib/types";
import { toast } from "@/lib/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: EditListingActionState = {};

function useActionToasts(state: EditListingActionState) {
  const last = useRef<string | null>(null);
  useEffect(() => {
    const key = state.error
      ? `e:${state.error}`
      : state.success
        ? `s:${state.success}`
        : null;
    if (!key || key === last.current) return;
    last.current = key;
    if (state.error) toast.error(state.error);
    else if (state.success) toast.success(state.success);
  }, [state.error, state.success]);
}

type EditListingFormProps = {
  product: Product;
  categories: Category[];
  images: ProductImage[];
  freeListingsEnabled?: boolean;
};

export function EditListingForm({
  product,
  categories,
  images,
  freeListingsEnabled = true,
}: EditListingFormProps) {
  const isArchived = product.status === "archived";
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [isFree, setIsFree] = useState(
    freeListingsEnabled && (product.isFree || product.price === 0),
  );

  const [updateState, updateAction, updatePending] = useActionState(
    updateOwnListing,
    initial,
  );
  const [addImagesState, addImagesAction, addImagesPending] = useActionState(
    addOwnListingImages,
    initial,
  );
  const [archiveState, archiveAction, archivePending] = useActionState(
    archiveOwnListing,
    initial,
  );

  useActionToasts(updateState);
  useActionToasts(addImagesState);
  useActionToasts(archiveState);

  useEffect(() => {
    if (archiveState.success) {
      setShowArchiveConfirm(false);
    }
  }, [archiveState.success]);

  return (
    <div className="mt-8 space-y-10">
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="outline">{product.status}</Badge>
        {isArchived ? (
          <p className="text-sm text-muted-foreground">
            This listing is archived and cannot be edited.
          </p>
        ) : null}
      </div>

      <section className="space-y-4">
        <p className="font-mono text-sm text-accent">$ ./listings --images</p>
        <h3 className="text-xl font-bold tracking-tight">Images</h3>
        {images.length === 0 ? (
          <p className="text-sm text-muted-foreground">No images yet.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((image) => (
              <li
                key={image.$id}
                className="space-y-2 rounded-md border border-border p-2"
              >
                <div className="relative aspect-square overflow-hidden bg-muted/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getFilePreviewUrl(BUCKET_PRODUCT_IMAGES, image.fileId, {
                      width: 240,
                      height: 240,
                    })}
                    alt={image.alt ?? product.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                {!isArchived ? (
                  <DeleteImageButton productId={product.$id} imageId={image.$id} />
                ) : null}
              </li>
            ))}
          </ul>
        )}

        {!isArchived && images.length < 8 ? (
          <form action={addImagesAction} className="max-w-lg space-y-3">
            <input type="hidden" name="productId" value={product.$id} />
            <div className="space-y-2">
              <Label htmlFor="images">Add images</Label>
              <Input
                id="images"
                name="images"
                type="file"
                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                multiple
                disabled={addImagesPending}
              />
              <p className="text-xs text-muted-foreground">
                {images.length} of 8 images used. JPG, PNG, or WebP. Max 5MB each.
              </p>
            </div>
            <Button type="submit" size="sm" disabled={addImagesPending}>
              {addImagesPending ? "Uploading…" : "Upload images"}
            </Button>
          </form>
        ) : null}
      </section>

      <form action={updateAction} className="max-w-lg space-y-5">
        <input type="hidden" name="productId" value={product.$id} />

        {updateState.error ? (
          <p
            role="alert"
            className="rounded-md border border-border bg-card px-3 py-2 font-mono text-sm text-accent-bright"
          >
            {updateState.error}
          </p>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            type="text"
            required
            maxLength={200}
            defaultValue={product.title}
            disabled={updatePending || isArchived}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            rows={5}
            required
            maxLength={10000}
            defaultValue={product.description}
            disabled={updatePending || isArchived}
            className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoryId">Category</Label>
          <select
            id="categoryId"
            name="categoryId"
            required
            defaultValue={product.categoryId}
            disabled={updatePending || isArchived || categories.length === 0}
            className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
          >
            {categories.map((c) => (
              <option key={c.$id} value={c.$id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {freeListingsEnabled ? (
          <div className="flex items-center gap-2">
            <input
              id="isFree"
              name="isFree"
              type="checkbox"
              checked={isFree}
              onChange={(e) => setIsFree(e.target.checked)}
              disabled={updatePending || isArchived}
              className="size-4 rounded border border-input"
            />
            <Label htmlFor="isFree" className="font-normal">
              Free listing (buyers checkout at no cost)
            </Label>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="price">Price (LKR)</Label>
            {isFree ? <input type="hidden" name="price" value="0" /> : null}
            <Input
              id="price"
              name={isFree ? undefined : "price"}
              type="number"
              min={0.01}
              step="0.01"
              required={!isFree}
              defaultValue={product.price}
              disabled={updatePending || isArchived || isFree}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              name="stock"
              type="number"
              min={0}
              step={1}
              required
              defaultValue={product.stock}
              disabled={updatePending || isArchived}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="available"
            name="available"
            type="checkbox"
            defaultChecked={product.available}
            disabled={updatePending || isArchived}
            className="size-4 rounded border border-input"
          />
          <Label htmlFor="available" className="font-normal">
            Available for purchase
          </Label>
        </div>

        {!isArchived ? (
          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" disabled={updatePending}>
              {updatePending ? "Saving…" : "Save changes"}
            </Button>
            <Button variant="outline" type="button" disabled={updatePending} asChild>
              <Link href="/seller/listings">Back to listings</Link>
            </Button>
          </div>
        ) : (
          <Button variant="outline" type="button" asChild>
            <Link href="/seller/listings">Back to listings</Link>
          </Button>
        )}
      </form>

      {!isArchived ? (
        <section className="rounded-md border border-border bg-card px-4 py-4">
          <p className="font-mono text-sm text-accent">$ ./listings --archive</p>
          <h3 className="mt-2 text-lg font-bold tracking-tight">Archive listing</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Archived listings are hidden from buyers and cannot be edited. This cannot
            be undone.
          </p>

          {archiveState.error ? (
            <p
              role="alert"
              className="mt-3 rounded-md border border-border px-3 py-2 font-mono text-sm text-accent-bright"
            >
              {archiveState.error}
            </p>
          ) : null}

          {!showArchiveConfirm ? (
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => setShowArchiveConfirm(true)}
            >
              Archive listing
            </Button>
          ) : (
            <form action={archiveAction} className="mt-4 space-y-3">
              <input type="hidden" name="productId" value={product.$id} />
              <p className="text-sm text-muted-foreground">
                Confirm archive for &ldquo;{product.title}&rdquo;?
              </p>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" variant="outline" disabled={archivePending}>
                  {archivePending ? "Archiving…" : "Confirm archive"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={archivePending}
                  onClick={() => setShowArchiveConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </section>
      ) : null}
    </div>
  );
}

function DeleteImageButton({
  productId,
  imageId,
}: {
  productId: string;
  imageId: string;
}) {
  const [state, formAction, pending] = useActionState(
    deleteOwnListingImage,
    initial,
  );

  useActionToasts(state);

  return (
    <form action={formAction}>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="imageId" value={imageId} />
      <Button type="submit" variant="outline" size="sm" className="w-full" disabled={pending}>
        {pending ? "Removing…" : "Remove"}
      </Button>
    </form>
  );
}
