"use client";

import { useRouter } from "next/navigation";
import type { InputHTMLAttributes, ReactNode } from "react";
import { Upload } from "lucide-react";
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

export function ListingFormFileField({
  id,
  name,
  hint,
  label = "Images",
  disabled,
  multiple,
}: {
  id: string;
  name: string;
  hint: string;
  label?: string;
  disabled?: boolean;
  multiple?: boolean;
}) {
  return (
    <ListingFormField label={label} htmlFor={id} hint={hint}>
      <label
        htmlFor={id}
        className={cn(
          "flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/15 px-4 py-8 text-center transition-colors hover:border-muted-foreground/40 hover:bg-muted/25 lg:min-h-[min(52vh,360px)]",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        <span className="flex size-10 items-center justify-center rounded-full border border-border bg-card">
          <Upload className="size-4 text-muted-foreground" aria-hidden />
        </span>
        <span className="text-sm font-medium text-foreground">
          Choose files or drag here
        </span>
        <span className="text-xs text-muted-foreground">
          JPG, PNG, or WebP · up to 8 · 5MB each
        </span>
        <input
          id={id}
          name={name}
          type="file"
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          multiple={multiple}
          disabled={disabled}
          className="sr-only"
        />
      </label>
    </ListingFormField>
  );
}

export const listingTextareaClassName =
  "min-h-[120px] w-full resize-y rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50";

export const listingSelectClassName =
  "h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50";

export const listingNumberInputClassName =
  "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";
