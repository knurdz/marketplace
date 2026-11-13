"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { Trash2, Upload } from "lucide-react";
import {
  PRODUCT_IMAGE_MAX_BYTES,
  PRODUCT_IMAGE_MAX_COUNT,
} from "@/lib/backend/config";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/** Contained bottom drawer used by seller listing create and edit. */
export function ListingFormDrawer({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const router = useRouter();

  return (
    <Drawer
      contained
      direction="bottom"
      open
      onOpenChange={(open) => {
        if (!open) router.push("/seller/listings");
      }}
    >
      <DrawerContent className="flex h-[min(92vh,880px)] max-h-[92vh] flex-col border-border bg-card text-card-foreground shadow-lg">
        <DrawerHeader className="shrink-0 border-b border-border bg-card px-6 pb-4 pt-2 text-left">
          <DrawerTitle className="text-lg font-semibold">{title}</DrawerTitle>
          <DrawerDescription className="text-sm leading-relaxed">
            {description}
          </DrawerDescription>
        </DrawerHeader>
        {children}
      </DrawerContent>
    </Drawer>
  );
}

export function ListingFormBody({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-card px-6 py-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        {children}
      </div>
    </div>
  );
}

export function ListingFormFooter({ children }: { children: ReactNode }) {
  return (
    <div className="mt-auto shrink-0 border-t border-border bg-card/95 px-6 py-4 backdrop-blur-sm supports-backdrop-filter:bg-card/90">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-end gap-2">
        {children}
      </div>
    </div>
  );
}

/** Two columns on large screens: media (left) and fields (right). */
export function ListingFormColumns({
  media,
  fields,
}: {
  media: ReactNode;
  fields: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      <div className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-0 lg:border-r lg:border-border lg:pr-10">
        {media}
      </div>
      <div className="flex min-w-0 flex-col gap-8">{fields}</div>
    </div>
  );
}

/** Section tuned for the media column (no bottom rule on large screens). */
export function ListingFormMediaSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5 border-b border-border pb-8 lg:border-b-0 lg:pb-0">
      <ListingSectionHeader title={title} description={description} />
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

export function ListingFormSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "flex flex-col gap-5 border-b border-border pb-8 last:border-0 last:pb-0",
        className,
      )}
    >
      <ListingSectionHeader title={title} description={description} />
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

function ListingSectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-1">
      <h3 className="text-base font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      {description ? (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function ListingFormField({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      {children}
      {hint ? (
        <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function ListingFormCheckbox({
  id,
  name,
  label,
  description,
  defaultChecked,
  checked,
  onChange,
  disabled,
}: {
  id: string;
  name?: string;
  label: string;
  description?: string;
  defaultChecked?: boolean;
  checked?: boolean;
  onChange?: InputHTMLAttributes<HTMLInputElement>["onChange"];
  disabled?: boolean;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer gap-3 rounded-lg py-1",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <span className="flex h-5 shrink-0 items-center">
        <input
          id={id}
          name={name}
          type="checkbox"
          defaultChecked={defaultChecked}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="size-4 rounded border border-input bg-card accent-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        />
      </span>
      <span className="min-w-0 space-y-0.5">
        <span className="block text-sm font-medium leading-5 text-foreground">
          {label}
        </span>
        {description ? (
          <span className="block text-xs text-muted-foreground">
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
}

type ListingPreviewItem = {
  id: string;
  name: string;
  url: string;
};

function listingImageFileKey(file: File): string {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

function isListingImageFile(file: File): boolean {
  return (
    file.type === "image/jpeg" ||
    file.type === "image/png" ||
    file.type === "image/webp"
  );
}

export function ListingFormFileField({
  id,
  name,
  hint,
  label = "Images",
  disabled,
  multiple,
  required,
  maxFiles = PRODUCT_IMAGE_MAX_COUNT,
  showCoverHint = false,
}: {
  id: string;
  name: string;
  hint: string;
  label?: string;
  disabled?: boolean;
  multiple?: boolean;
  required?: boolean;
  maxFiles?: number;
  showCoverHint?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef<File[]>([]);
  const objectUrlsRef = useRef<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [previews, setPreviews] = useState<ListingPreviewItem[]>([]);
  const [fieldMessage, setFieldMessage] = useState<string | null>(null);

  useEffect(() => {
    const urls = objectUrlsRef.current;
    return () => {
      for (const url of urls) URL.revokeObjectURL(url);
      objectUrlsRef.current = [];
    };
  }, []);

  useEffect(() => {
    const form = inputRef.current?.form;
    if (!form) return;
    const onReset = () => {
      window.setTimeout(() => {
        const input = inputRef.current;
        if (!input) return;
        const dt = new DataTransfer();
        for (const file of filesRef.current) dt.items.add(file);
        input.value = "";
        if (dt.files.length > 0) input.files = dt.files;
      }, 0);
    };
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, []);

  function revokeTrackedUrls() {
    for (const url of objectUrlsRef.current) URL.revokeObjectURL(url);
    objectUrlsRef.current = [];
  }

  function syncInputFromFiles(files: File[]) {
    const input = inputRef.current;
    if (!input) return;
    const dt = new DataTransfer();
    for (const file of files) {
      dt.items.add(file);
    }
    // Clearing the value lets the same file be chosen again, and also
    // drops every file. Put the accumulated list back immediately.
    input.value = "";
    if (dt.files.length > 0) {
      input.files = dt.files;
    }
  }

  function rebuildPreviewsFromFiles(files: File[]) {
    revokeTrackedUrls();
    const items: ListingPreviewItem[] = [];
    for (const file of files) {
      const url = URL.createObjectURL(file);
      objectUrlsRef.current.push(url);
      items.push({
        id: listingImageFileKey(file),
        name: file.name,
        url,
      });
    }
    setPreviews(items);
  }

  function commitFiles(next: File[]) {
    filesRef.current = next;
    syncInputFromFiles(next);
    rebuildPreviewsFromFiles(next);
  }

  function ingestIncoming(incoming: FileList | File[]) {
    const list = Array.from(incoming);
    const messages: string[] = [];

    if (!multiple) {
      const first = list.find(isListingImageFile);
      if (!first) return;
      if (first.size > PRODUCT_IMAGE_MAX_BYTES) {
        setFieldMessage(`${first.name} is over 5 MB.`);
        syncInputFromFiles(filesRef.current);
        return;
      }
      setFieldMessage(null);
      commitFiles([first]);
      return;
    }

    if (filesRef.current.length >= maxFiles) {
      setFieldMessage(
        `${maxFiles} of ${maxFiles} photos selected. Remove a photo to add a different one.`,
      );
      syncInputFromFiles(filesRef.current);
      return;
    }

    const next = [...filesRef.current];
    const seen = new Set(next.map(listingImageFileKey));
    let skippedCap = false;

    for (const file of list) {
      if (!isListingImageFile(file)) continue;
      if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
        messages.push(`${file.name} is over 5 MB.`);
        continue;
      }
      const key = listingImageFileKey(file);
      if (seen.has(key)) continue;
      if (next.length >= maxFiles) {
        skippedCap = true;
        break;
      }
      next.push(file);
      seen.add(key);
    }

    if (skippedCap) {
      messages.push("Some files were not added because the limit was reached.");
    }

    setFieldMessage(messages.length > 0 ? messages.join(" ") : null);
    commitFiles(next);
  }

  function removePreview(previewId: string) {
    const next = filesRef.current.filter(
      (file) => listingImageFileKey(file) !== previewId,
    );
    setFieldMessage(null);
    commitFiles(next);
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files?.length) return;
    ingestIncoming(files);
  }

  function onDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();
    setDragging(false);
    if (disabled || atCap) return;
    const dropped = event.dataTransfer.files;
    if (!dropped?.length) return;
    ingestIncoming(dropped);
  }

  function onDragOver(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (!disabled && !atCap) setDragging(true);
  }

  function onDragLeave(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (event.currentTarget.contains(event.relatedTarget as Node)) return;
    setDragging(false);
  }

  const selectedCount = previews.length;
  const atCap = multiple ? selectedCount >= maxFiles : false;
  const canPickMore = !disabled && !atCap;

  const dropzoneHelp = (() => {
    if (multiple) {
      if (atCap) {
        return `${maxFiles} of ${maxFiles} photos selected. Remove a photo to add a different one.`;
      }
      if (selectedCount > 0) {
        return `${selectedCount} of ${maxFiles} photos selected. Choose or drop more to add them.`;
      }
      const base = `JPG, PNG, or WebP. Up to ${maxFiles} photos, 5 MB each.`;
      return showCoverHint
        ? `${base} The first photo is the cover shoppers see.`
        : base;
    }
    return selectedCount > 0
      ? "Click or drop to change the image."
      : "JPG, PNG, or WebP, 5 MB max.";
  })();

  const dropzoneClassName = cn(
    "flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/15 px-4 py-8 text-center transition-colors lg:min-h-[min(52vh,360px)]",
    canPickMore &&
      "cursor-pointer hover:border-muted-foreground/40 hover:bg-muted/25",
    dragging && canPickMore && "border-accent/60 bg-accent/5",
    (!canPickMore || disabled) && "opacity-100",
    disabled && "pointer-events-none opacity-50",
  );

  const fileInput = (
    <input
      ref={inputRef}
      id={id}
      name={name}
      type="file"
      accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
      multiple={multiple}
      disabled={disabled}
      required={Boolean(required)}
      className="sr-only"
      onChange={onInputChange}
    />
  );

  const dropzoneBody = (
    <>
      <span className="flex size-10 items-center justify-center rounded-full border border-border bg-card">
        <Upload className="size-4 text-muted-foreground" aria-hidden />
      </span>
      <span className="text-sm font-medium text-foreground">
        Choose files or drag here
      </span>
      <span className="text-xs text-muted-foreground">{dropzoneHelp}</span>
    </>
  );

  return (
    <ListingFormField label={label} htmlFor={id} hint={hint}>
      <div className="flex flex-col gap-3">
        {selectedCount > 0 ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
            {previews.map((item) => (
              <li
                key={item.id}
                className="overflow-hidden rounded-lg border border-border"
              >
                <div className="relative aspect-square bg-muted/20">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local file preview */}
                  <img
                    src={item.url}
                    alt=""
                    className="size-full object-cover"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="xs"
                  className="h-8 w-full rounded-none"
                  disabled={disabled}
                  aria-label={`Remove ${item.name}`}
                  onClick={() => removePreview(item.id)}
                >
                  <Trash2 data-icon="inline-start" />
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        ) : null}

        {fieldMessage ? (
          <p
            role="status"
            className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive"
          >
            {fieldMessage}
          </p>
        ) : null}

        {canPickMore ? (
          <label
            htmlFor={id}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragEnter={onDragOver}
            onDragLeave={onDragLeave}
            className={dropzoneClassName}
          >
            {dropzoneBody}
          </label>
        ) : (
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragEnter={onDragOver}
            onDragLeave={onDragLeave}
            className={cn(dropzoneClassName, "cursor-default")}
          >
            {dropzoneBody}
          </div>
        )}
        {fileInput}
      </div>
    </ListingFormField>
  );
}

export const listingTextareaClassName =
  "min-h-[120px] w-full resize-y rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50";

export const listingSelectClassName =
  "h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50";
