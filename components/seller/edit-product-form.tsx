"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  updateOwnProduct,
  type UpdateProductActionState,
} from "@/lib/appwrite/seller-product-actions";
import type { Category, Product } from "@/lib/types";
import { toast } from "@/lib/ui/toast";
import { ArchiveListingButton } from "@/components/seller/archive-listing-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: UpdateProductActionState = {};

type EditProductImage = {
  id: string;
  previewUrl: string;
  alt: string | null;
};

type EditProductFormProps = {
  product: Product;
  categories: Category[];
  images: EditProductImage[];
};

function useActionToasts(state: UpdateProductActionState) {
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

export function EditProductForm({
  product,
  categories,
  images,
}: EditProductFormProps) {
  const [state, formAction, pending] = useActionState(
    updateOwnProduct,
    initialState,
  );

  useActionToasts(state);

  return (
    <div className="mt-8 max-w-lg space-y-10">
      <form action={formAction} className="space-y-5">
        <input type="hidden" name="productId" value={product.$id} readOnly />

        {state.error ? (
          <p
            role="alert"
            className="rounded-md border border-border bg-card px-3 py-2 font-mono text-sm text-accent-bright"
          >
            {state.error}
          </p>
        ) : null}
        {state.success ? (
          <p
            role="status"
            className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
          >
            {state.success}
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
            disabled={pending}
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
            disabled={pending}
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
            disabled={pending}
            className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
          >
            {categories.map((category) => (
              <option key={category.$id} value={category.$id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="price">Price (LKR)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              required
              min={0}
              step="0.01"
              inputMode="decimal"
              defaultValue={product.price}
              disabled={pending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              name="stock"
              type="number"
              required
              min={0}
              step={1}
              inputMode="numeric"
              defaultValue={product.stock}
              disabled={pending}
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label>Current images</Label>
          {images.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No images on this listing. Add at least one below.
            </p>
          ) : (
            <ul className="space-y-3">
              {images.map((image) => (
                <li
                  key={image.id}
                  className="flex items-center gap-3 rounded-md border border-border bg-card p-2"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.previewUrl}
                    alt={image.alt ?? product.title}
                    className="size-14 shrink-0 object-cover border border-border"
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="removeImageIds"
                      value={image.id}
                      disabled={pending}
                      className="size-4 rounded border-input"
                    />
                    Remove
                  </label>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-muted-foreground">
            Keep at least one image. Check boxes to remove before saving.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="newImages">Add images (optional)</Label>
          <Input
            id="newImages"
            name="newImages"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={pending}
          />
          <p className="text-xs text-muted-foreground">
            JPG, PNG, or WebP. Up to 8 images total, 5MB each.
          </p>
        </div>

        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </form>

      <div className="rounded-md border border-border bg-card px-4 py-4">
        <p className="font-mono text-sm text-accent">$ ./listing --archive</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Archive removes this listing from the storefront. This cannot be undone
          in the seller portal.
        </p>
        <ArchiveListingButton
          productId={product.$id}
          productTitle={product.title}
          className="mt-4"
        />
      </div>
    </div>
  );
}
