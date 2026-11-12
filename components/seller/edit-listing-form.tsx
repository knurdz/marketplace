"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import {
  addOwnListingImages,
  archiveOwnListing,
  deleteOwnListingImage,
  updateOwnListing,
  type EditListingActionState,
} from "@/lib/backend/seller-listing-actions";
import { BUCKET_PRODUCT_IMAGES } from "@/lib/backend/config";
import { getFilePreviewUrl } from "@/lib/backend/storage-urls";
import { StorageImage } from "@/components/ui/storage-image";
import type { Category, Product, ProductImage, ProductStatus } from "@/lib/types";
import { toast } from "@/lib/ui/toast";
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
import { SubmitListingButton } from "@/components/seller/submit-listing-button";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
import { DrawerClose } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/layout/status-pill";
import { productStatusTone } from "@/lib/ui/status-tone";
import { FormGuardFields } from "@/components/security/form-guard-fields";

const DETAILS_FORM_ID = "edit-listing-details";
const initial: EditListingActionState = {};

function canSubmit(status: ProductStatus): boolean {
  return status === "draft" || status === "rejected";
}

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

  const [prevArchiveSuccess, setPrevArchiveSuccess] = useState(
    archiveState.success,
  );
  if (archiveState.success !== prevArchiveSuccess) {
    setPrevArchiveSuccess(archiveState.success);
    if (archiveState.success) {
      setShowArchiveConfirm(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ListingFormBody>
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill
            label={product.status}
            tone={productStatusTone(product.status)}
          />
          {isArchived ? (
            <p className="text-sm text-muted-foreground">
              Archived listings stay hidden and cannot be edited.
            </p>
          ) : null}
        </div>

        {updateState.error ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
          >
            {updateState.error}
          </p>
        ) : null}

        <ListingFormColumns
          media={
            <ListingFormMediaSection
              title="Photos"
              description={`${images.length} of 8. JPG, PNG, or WebP, max 5MB each.`}
            >
              {images.length === 0 ? (
                <p className="text-sm text-muted-foreground">No images yet.</p>
              ) : (
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
                  {images.map((image) => (
                    <li
                      key={image.$id}
                      className="overflow-hidden rounded-lg border border-border"
                    >
                      <div className="relative aspect-square bg-muted/20">
                        <StorageImage
                          src={getFilePreviewUrl(
                            BUCKET_PRODUCT_IMAGES,
                            image.fileId,
                            { width: 240, height: 240 },
                          )}
                          alt={image.alt ?? product.title}
                          className="size-full"
                          imgClassName="object-cover"
                        />
                      </div>
                      {!isArchived ? (
                        <DeleteImageButton
                          productId={product.$id}
                          imageId={image.$id}
                        />
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}

              {!isArchived && images.length < 8 ? (
                <form action={addImagesAction} className="flex flex-col gap-3">
                  <FormGuardFields action="seller.listing.images.add" />
                  <input type="hidden" name="productId" value={product.$id} />
                  {addImagesState.error ? (
                    <p
                      role="alert"
                      className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
                    >
                      {addImagesState.error}
                    </p>
                  ) : null}
                  <ListingFormFileField
                    id="images"
                    name="images"
                    label="Add more"
                    hint=""
                    disabled={addImagesPending}
                    multiple
                  />
                  <Button
                    type="submit"
                    size="sm"
                    variant="info"
                    className="self-stretch sm:self-end"
                    disabled={addImagesPending}
                  >
                    {addImagesPending ? "Uploading…" : "Upload"}
                  </Button>
                </form>
              ) : null}
            </ListingFormMediaSection>
          }
          fields={
            <>
              <form id={DETAILS_FORM_ID} action={updateAction} className="contents">
                <FormGuardFields action="seller.listing.update" />
                <input type="hidden" name="productId" value={product.$id} />

                <ListingFormSection
                  title="Details"
                  description="Title, description, and category shown to buyers."
                >
                  <ListingFormField label="Title" htmlFor="title">
                    <Input
                      id="title"
                      name="title"
                      type="text"
                      required
                      maxLength={200}
                      defaultValue={product.title}
                      disabled={updatePending || isArchived}
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
                      defaultValue={product.description}
                      disabled={updatePending || isArchived}
                      className={listingTextareaClassName}
                    />
                  </ListingFormField>

                  <ListingFormField label="Category" htmlFor="categoryId">
                    <select
                      id="categoryId"
                      name="categoryId"
                      required
                      defaultValue={product.categoryId}
                      disabled={
                        updatePending || isArchived || categories.length === 0
                      }
                      className={listingSelectClassName}
                    >
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
                  description="Update what buyers pay and how many you can sell."
                  className={!isArchived ? undefined : "last:border-0 last:pb-0"}
                >
                  {freeListingsEnabled ? (
                    <ListingFormCheckbox
                      id="isFree"
                      name="isFree"
                      label="Free listing"
                      description="Buyers see zero price at checkout."
                      checked={isFree}
                      onChange={(e) => setIsFree(e.target.checked)}
                      disabled={updatePending || isArchived}
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
                        defaultValue={product.price}
                        disabled={updatePending || isArchived || isFree}
                        className="bg-card shadow-xs"
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
                        defaultValue={product.stock}
                        disabled={updatePending || isArchived}
                        className="bg-card shadow-xs"
                      />
                    </ListingFormField>
                  </div>

                  <ListingFormCheckbox
                    id="available"
                    name="available"
                    label="Available for purchase"
                    description="Turn off to hide from checkout while keeping the listing."
                    defaultChecked={product.available}
                    disabled={updatePending || isArchived}
                  />
                </ListingFormSection>
              </form>

              {!isArchived ? (
                <ListingFormSection
                  title="Archive"
                  description="Hidden from buyers. Archived listings cannot be edited."
                  className="last:border-0 last:pb-0"
                >
                  {archiveState.error ? (
                    <p role="alert" className="text-sm text-destructive">
                      {archiveState.error}
                    </p>
                  ) : null}
                  <div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowArchiveConfirm(true)}
                    >
                      <Trash2 data-icon="inline-start" />
                      Archive listing
                    </Button>
                  </div>
                  <ConfirmActionDialog
                    open={showArchiveConfirm}
                    onOpenChange={setShowArchiveConfirm}
                    title="Archive listing?"
                    description={`Archive “${product.title}”? Archived listings are hidden from buyers and cannot be edited. This cannot be undone.`}
                    confirmLabel="Archive"
                    pendingLabel="Archiving…"
                    confirmVariant="destructive"
                    pending={archivePending}
                    formAction={archiveAction}
                    formGuardAction="seller.listing.archive"
                    hiddenFields={{ productId: product.$id }}
                  />
                </ListingFormSection>
              ) : null}
            </>
          }
        />
      </ListingFormBody>

      <ListingFormFooter>
        <DrawerClose asChild>
          <Button type="button" variant="outline" size="sm">
            Close
          </Button>
        </DrawerClose>
        {canSubmit(product.status) ? (
          <SubmitListingButton productId={product.$id} />
        ) : null}
        {!isArchived ? (
          <Button
            type="submit"
            variant="info"
            size="sm"
            form={DETAILS_FORM_ID}
            disabled={updatePending}
          >
            {updatePending ? "Saving…" : "Save changes"}
          </Button>
        ) : null}
      </ListingFormFooter>
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
      <FormGuardFields action="seller.listing.image.delete" />
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="imageId" value={imageId} />
      <Button
        type="submit"
        variant="destructive"
        size="xs"
        className="h-8 w-full rounded-none"
        disabled={pending}
      >
        {!pending ? <Trash2 data-icon="inline-start" /> : null}
        {pending ? "Removing…" : "Remove"}
      </Button>
    </form>
  );
}
