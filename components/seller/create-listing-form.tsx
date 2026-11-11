"use client";

import { useActionState, useState } from "react";
import {
  createDraftListing,
  type CreateListingActionState,
} from "@/lib/backend/seller-listing-actions";
import type { Category } from "@/lib/types";
import {
  ListingFormBody,
  ListingFormCheckbox,
  ListingFormColumns,
  ListingFormField,
  ListingFormFileField,
  ListingFormFooter,
  ListingFormMediaSection,
  ListingFormSection,
  listingNumberInputClassName,
  listingSelectClassName,
  listingTextareaClassName,
} from "@/components/seller/listing-form-drawer";
import { Button } from "@/components/ui/button";
import { DrawerClose } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { FormGuardFields } from "@/components/security/form-guard-fields";

const initialState: CreateListingActionState = {};

type CreateListingFormProps = {
  categories: Category[];
  freeListingsEnabled?: boolean;
};

export function CreateListingForm({
  categories,
  freeListingsEnabled = true,
}: CreateListingFormProps) {
  const [isFree, setIsFree] = useState(false);
  const [state, formAction, pending] = useActionState(
    createDraftListing,
    initialState,
  );

  return (
    <form action={formAction} className="flex min-h-0 flex-1 flex-col">
      <FormGuardFields action="seller.listing.create" />
      <ListingFormBody>
        {state.error ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
          >
            {state.error}
          </p>
        ) : null}

        <ListingFormColumns
          media={
            <ListingFormMediaSection
              title="Photos"
              description="Optional. Add up to 8 images before or after saving."
            >
              <ListingFormFileField
                id="images"
                name="images"
                label="Upload"
                hint="First image is used as the cover on your listings table."
                disabled={pending}
                multiple
              />
            </ListingFormMediaSection>
          }
          fields={
            <>
              <ListingFormSection
                title="Details"
                description="What buyers see on the storefront."
              >
                <ListingFormField label="Title" htmlFor="title">
                  <Input
                    id="title"
                    name="title"
                    type="text"
                    required
                    maxLength={200}
                    placeholder="e.g. Vinyl sticker pack"
                    disabled={pending}
                    className="bg-card shadow-xs"
                  />
                </ListingFormField>

                <ListingFormField label="Description" htmlFor="description">
                  <textarea
                    id="description"
                    name="description"
                    rows={5}
                    required
                    maxLength={10000}
                    disabled={pending}
                    placeholder="Describe your item for buyers."
                    className={listingTextareaClassName}
                  />
                </ListingFormField>

                <ListingFormField
                  label="Category"
                  htmlFor="categoryId"
                  hint={
                    categories.length === 0
                      ? "No categories yet. Ask an admin to add categories first."
                      : undefined
                  }
                >
                  <select
                    id="categoryId"
                    name="categoryId"
                    required
                    disabled={pending || categories.length === 0}
                    className={listingSelectClassName}
                    defaultValue=""
                  >
                    <option value="">Select a category</option>
                    {categories.map((c) => (
                      <option key={c.$id} value={c.$id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </ListingFormField>
              </ListingFormSection>

              <ListingFormSection
                title="Price and stock"
                description="Set what buyers pay and how many you can sell."
                className="last:border-0 last:pb-0"
              >
                {freeListingsEnabled ? (
                  <ListingFormCheckbox
                    id="isFree"
                    name="isFree"
                    label="Free listing"
                    description="Buyers see zero price at checkout."
                    checked={isFree}
                    onChange={(e) => setIsFree(e.target.checked)}
                    disabled={pending}
                  />
                ) : null}

                <div className="grid gap-4 sm:grid-cols-2">
                  <ListingFormField label="Price (LKR)" htmlFor="price">
                    {isFree ? (
                      <input type="hidden" name="price" value="0" />
                    ) : null}
                    <Input
                      id="price"
                      name={isFree ? undefined : "price"}
                      type="number"
                      min={0.01}
                      step="0.01"
                      required={!isFree}
                      disabled={pending || isFree}
                      placeholder={isFree ? "Free" : "500"}
                      className={cnInput(isFree)}
                    />
                  </ListingFormField>
                  <ListingFormField label="Stock" htmlFor="stock">
                    <Input
                      id="stock"
                      name="stock"
                      type="number"
                      min={0}
                      step={1}
                      required
                      defaultValue={1}
                      disabled={pending}
                      className={cnInput()}
                    />
                  </ListingFormField>
                </div>

                <ListingFormCheckbox
                  id="available"
                  name="available"
                  label="Available for purchase"
                  description="Turn off to hide from checkout while keeping the listing."
                  defaultChecked
                  disabled={pending}
                />
              </ListingFormSection>
            </>
          }
        />
      </ListingFormBody>

      <ListingFormFooter>
        <DrawerClose asChild>
          <Button type="button" variant="ghost" size="sm" disabled={pending}>
            Cancel
          </Button>
        </DrawerClose>
        <Button
          type="submit"
          size="sm"
          variant="info"
          name="intent"
          value="draft"
          disabled={pending || categories.length === 0}
          data-testid="listing-save-draft"
        >
          {pending ? "Saving…" : "Save draft"}
        </Button>
        <Button
          type="submit"
          size="sm"
          variant="info"
          name="intent"
          value="list"
          disabled={pending || categories.length === 0}
          data-testid="listing-list-item"
        >
          {pending ? "Listing…" : "List item"}
        </Button>
      </ListingFormFooter>
    </form>
  );
}

function cnInput(dimmed?: boolean) {
  return [
    "bg-card shadow-xs",
    listingNumberInputClassName,
    dimmed ? "text-muted-foreground" : "",
  ]
    .filter(Boolean)
    .join(" ");
}
