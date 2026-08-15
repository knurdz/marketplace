"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  createDraftListing,
  type CreateListingActionState,
} from "@/lib/appwrite/seller-listing-actions";
import type { Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: CreateListingActionState = {};

type CreateListingFormProps = {
  categories: Category[];
};

export function CreateListingForm({ categories }: CreateListingFormProps) {
  const [isFree, setIsFree] = useState(false);
  const [state, formAction, pending] = useActionState(
    createDraftListing,
    initialState,
  );

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

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          type="text"
          required
          maxLength={200}
          placeholder="e.g. Vinyl sticker pack"
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
          placeholder="Describe your item for buyers."
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoryId">Category</Label>
        <select
          id="categoryId"
          name="categoryId"
          required
          disabled={pending || categories.length === 0}
          className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
        >
          <option value="">Select a category</option>
          {categories.map((c) => (
            <option key={c.$id} value={c.$id}>
              {c.name}
            </option>
          ))}
        </select>
        {categories.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No categories yet. Ask an admin to add categories first.
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <input
          id="isFree"
          name="isFree"
          type="checkbox"
          checked={isFree}
          onChange={(e) => setIsFree(e.target.checked)}
          disabled={pending}
          className="size-4 rounded border border-input"
        />
        <Label htmlFor="isFree" className="font-normal">
          Free listing (buyers checkout at no cost)
        </Label>
      </div>

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
            disabled={pending || isFree}
            placeholder={isFree ? "Free" : "e.g. 500"}
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
            defaultValue={1}
            disabled={pending}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="images">Images (optional, up to 8)</Label>
        <Input
          id="images"
          name="images"
          type="file"
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          multiple
          disabled={pending}
        />
        <p className="text-xs text-muted-foreground">
          JPG, PNG, or WebP. Max 5MB each.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" disabled={pending || categories.length === 0}>
          {pending ? "Saving draft…" : "Save draft"}
        </Button>
        <Button variant="outline" type="button" disabled={pending} asChild>
          <Link href="/seller/listings">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
