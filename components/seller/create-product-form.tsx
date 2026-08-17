"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  createDraftProduct,
  type CreateProductActionState,
} from "@/lib/appwrite/seller-product-actions";
import type { Category } from "@/lib/types";
import { toast } from "@/lib/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: CreateProductActionState = {};

function useActionToasts(state: CreateProductActionState) {
  const last = useRef<string | null>(null);
  useEffect(() => {
    const key = state.error ? `e:${state.error}` : null;
    if (!key || key === last.current) return;
    last.current = key;
    if (state.error) toast.error(state.error);
  }, [state.error]);
}

type CreateProductFormProps = {
  categories: Category[];
};

export function CreateProductForm({ categories }: CreateProductFormProps) {
  const [state, formAction, pending] = useActionState(
    createDraftProduct,
    initialState,
  );

  useActionToasts(state);

  return (
    <form action={formAction} className="mt-8 max-w-lg space-y-5">
      {state.error ? (
        <p
          role="alert"
          className="rounded-md border border-border bg-card px-3 py-2 font-mono text-sm text-accent-bright"
        >
          {state.error}
        </p>
      ) : null}

      <p className="text-sm text-muted-foreground">
        Saved as draft. Publishing comes in a later step.
      </p>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          type="text"
          required
          maxLength={200}
          autoComplete="off"
          placeholder="e.g. Handmade sticker pack"
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
          disabled={pending}
          placeholder="Describe your product for buyers."
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoryId">Category</Label>
        <select
          id="categoryId"
          name="categoryId"
          required
          disabled={pending}
          className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
        >
          <option value="">Select a category</option>
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
            placeholder="0.00"
            disabled={pending}
          />
          <p className="text-xs text-muted-foreground">
            Use 0 for a free listing when published.
          </p>
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
            defaultValue={1}
            disabled={pending}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="images">Images</Label>
        <Input
          id="images"
          name="images"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          required
          disabled={pending}
        />
        <p className="text-xs text-muted-foreground">
          JPG, PNG, or WebP. Up to 8 images, 5MB each.
        </p>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving draft…" : "Save draft listing"}
      </Button>
    </form>
  );
}
