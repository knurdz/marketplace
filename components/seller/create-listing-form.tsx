"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
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
  listingSelectClassName,
  listingTextareaClassName,
} from "@/components/seller/listing-form-drawer";
import { Button } from "@/components/ui/button";
import { DrawerClose } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { FormGuardFields } from "@/components/security/form-guard-fields";
import { PRODUCT_IMAGE_MAX_COUNT } from "@/lib/backend/config";

const initialState: CreateListingActionState = {};

type ListingDraft = {
  title: string;
  description: string;
  categoryId: string;
  price: string;
  stock: string;
  isFree: boolean;
  available: boolean;
};

const emptyDraft: ListingDraft = {
  title: "",
  description: "",
  categoryId: "",
  price: "",
  stock: "1",
  isFree: false,
  available: true,
};

type CreateListingFormProps = {
  categories: Category[];
  freeListingsEnabled?: boolean;
};

export function CreateListingForm({
  categories,
  freeListingsEnabled = true,
}: CreateListingFormProps) {
  const [draft, setDraft] = useState<ListingDraft>(emptyDraft);
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const [state, formAction, pending] = useActionState(
    createDraftListing,
    initialState,
  );

  useEffect(() => {
    if (!state.error) return;
    const id = window.setTimeout(() => {
      setDraft((current) => ({ ...current }));
    }, 0);
    return () => window.clearTimeout(id);
  }, [state]);

  function patchDraft(partial: Partial<ListingDraft>) {
    setDraft((current) => ({ ...current, ...partial }));
  }

  function keepDraftOnReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const saved = draftRef.current;
    window.setTimeout(() => {
      writeControl(form, "title", saved.title);
      writeControl(form, "description", saved.description);
      writeControl(form, "categoryId", saved.categoryId);
      writeControl(form, "price", saved.isFree ? "0" : saved.price);
      writeControl(form, "stock", saved.stock);
      writeChecked(form, "isFree", saved.isFree);
      writeChecked(form, "available", saved.available);
    }, 0);
  }

  return (
    <form
      action={formAction}
      className="flex min-h-0 flex-1 flex-col"
      onReset={keepDraftOnReset}
    >
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
              description={`At least one image is required. Up to ${PRODUCT_IMAGE_MAX_COUNT}, JPG, PNG, or WebP, 5 MB each.`}
            >
              <ListingFormFileField
                id="images"
                name="images"
                label="Upload"
                hint="First image is used as the cover on your listings table."
                disabled={pending}
                multiple
                required
                maxFiles={PRODUCT_IMAGE_MAX_COUNT}
                showCoverHint
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
                    value={draft.title}
                    onChange={(event) => patchDraft({ title: event.target.value })}
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
                    value={draft.description}
                    onChange={(event) =>
                      patchDraft({ description: event.target.value })
                    }
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
                    value={draft.categoryId}
                    onChange={(event) =>
                      patchDraft({ categoryId: event.target.value })
                    }
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
                    checked={draft.isFree}
                    onChange={(e) => patchDraft({ isFree: e.target.checked })}
                    disabled={pending}
                  />
                ) : null}

                <div className="grid gap-4 sm:grid-cols-2">
                  <ListingFormField label="Price (LKR)" htmlFor="price">
                    {draft.isFree ? (
                      <input type="hidden" name="price" value="0" />
                    ) : null}
                    <Input
                      id="price"
                      name={draft.isFree ? undefined : "price"}
                      type="number"
                      min={0.01}
                      step="0.01"
                      required={!draft.isFree}
                      disabled={pending || draft.isFree}
                      placeholder={draft.isFree ? "Free" : "500"}
                      value={draft.isFree ? "" : draft.price}
                      onChange={(event) =>
                        patchDraft({ price: event.target.value })
                      }
                      className={cnInput(draft.isFree)}
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
                      value={draft.stock}
                      onChange={(event) =>
                        patchDraft({ stock: event.target.value })
                      }
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
                  checked={draft.available}
                  onChange={(event) =>
                    patchDraft({ available: event.target.checked })
                  }
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

function writeControl(
  form: HTMLFormElement,
  name: string,
  value: string,
) {
  const field = form.elements.namedItem(name);
  if (
    field instanceof HTMLInputElement ||
    field instanceof HTMLTextAreaElement ||
    field instanceof HTMLSelectElement
  ) {
    field.value = value;
  }
}

function writeChecked(form: HTMLFormElement, name: string, checked: boolean) {
  const field = form.elements.namedItem(name);
  if (field instanceof HTMLInputElement) field.checked = checked;
}

function cnInput(dimmed?: boolean) {
  return [
    "bg-card shadow-xs",
    dimmed ? "text-muted-foreground" : "",
  ]
    .filter(Boolean)
    .join(" ");
}
