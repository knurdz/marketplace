"use client";

import Link from "next/link";
import {
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import {
  ExternalLink,
  ImageIcon,
  ImagePlus,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { StorageImage } from "@/components/ui/storage-image";
import {
  updateOwnShopBanner,
  updateOwnShopProfile,
  type ShopProfileActionState,
} from "@/lib/appwrite/seller-application-actions";
import { AVATAR_MAX_BYTES, IMAGE_MIME_TYPES } from "@/lib/appwrite/config";
import type { SellerProfile } from "@/lib/types";
import { toast } from "@/lib/ui/toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const profileInitial: ShopProfileActionState = {};
const bannerInitial: ShopProfileActionState = {};

const ACCEPT = IMAGE_MIME_TYPES.join(",");
const MAX_MB = Math.round((AVATAR_MAX_BYTES / (1024 * 1024)) * 10) / 10;

function useActionToasts(state: ShopProfileActionState) {
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

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const ALLOWED_BANNER_MIME = new Set<string>(IMAGE_MIME_TYPES);

function validateBannerFile(file: File): string | null {
  if (!ALLOWED_BANNER_MIME.has(file.type)) {
    return "Use a JPG, PNG, or WebP image.";
  }
  if (file.size <= 0) return "That file looks empty.";
  if (file.size > AVATAR_MAX_BYTES) {
    return `Banner must be at most ${MAX_MB}MB.`;
  }
  return null;
}

type BannerDropzoneProps = {
  name: string;
  pending: boolean;
  existingPreviewUrl: string | null;
  onFileReadyChange?: (ready: boolean) => void;
};

function BannerDropzone({
  name,
  pending,
  existingPreviewUrl,
  onFileReadyChange,
}: BannerDropzoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [selected, setSelected] = useState<{
    name: string;
    size: number;
    previewUrl: string;
  } | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    onFileReadyChange?.(Boolean(selected));
  }, [selected, onFileReadyChange]);

  function clearObjectUrl() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }

  function assignFile(file: File | null) {
    if (!inputRef.current) return;
    const dt = new DataTransfer();
    if (file) dt.items.add(file);
    inputRef.current.files = dt.files;

    clearObjectUrl();
    setLocalError(null);

    if (!file) {
      setSelected(null);
      return;
    }

    const error = validateBannerFile(file);
    if (error) {
      setLocalError(error);
      setSelected(null);
      inputRef.current.files = new DataTransfer().files;
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    objectUrlRef.current = previewUrl;
    setSelected({ name: file.name, size: file.size, previewUrl });
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      clearObjectUrl();
      setSelected(null);
      setLocalError(null);
      return;
    }
    assignFile(file);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    event.stopPropagation();
    setDragging(false);
    if (pending) return;
    const file = event.dataTransfer.files?.[0] ?? null;
    assignFile(file);
  }

  function onDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (!pending) setDragging(true);
  }

  function onDragLeave(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (event.currentTarget.contains(event.relatedTarget as Node)) return;
    setDragging(false);
  }

  const previewSrc = selected?.previewUrl ?? existingPreviewUrl;
  const hasExistingOnly = Boolean(existingPreviewUrl && !selected);

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        id={inputId}
        name={name}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        disabled={pending}
        onChange={onInputChange}
      />

      <label
        htmlFor={inputId}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragEnter={onDragOver}
        onDragLeave={onDragLeave}
        aria-disabled={pending}
        className={cn(
          "group relative flex min-h-56 w-full cursor-pointer flex-col overflow-hidden rounded-xl border border-dashed transition-colors",
          dragging
            ? "border-accent bg-accent/5"
            : "border-border bg-muted/20 hover:border-accent/60 hover:bg-muted/35",
          pending && "pointer-events-none opacity-60",
          localError && "border-destructive/50",
        )}
      >
        {previewSrc ? (
          <>
            <StorageImage
              src={previewSrc}
              alt=""
              className="absolute inset-0 h-full w-full"
              imgClassName="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-black/10" />
            <div className="relative z-10 mt-auto flex w-full flex-col gap-3 p-5 text-white sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {selected
                    ? "New banner ready to upload"
                    : "Current shop banner"}
                </p>
                <p className="mt-1 truncate text-xs text-white/80">
                  {selected
                    ? `${selected.name} · ${formatBytes(selected.size)}`
                    : "Drop a new image to replace, or click to browse"}
                </p>
              </div>
              <span className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
                <ImagePlus className="size-3.5" aria-hidden />
                {hasExistingOnly ? "Replace banner" : "Change image"}
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
            <span
              className={cn(
                "flex size-12 items-center justify-center rounded-full border border-border bg-background shadow-xs transition-colors",
                dragging && "border-accent text-accent",
              )}
            >
              <Upload className="size-5" aria-hidden />
            </span>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                {dragging
                  ? "Drop your banner here"
                  : "Drag and drop a banner image"}
              </p>
              <p className="text-sm text-muted-foreground">
                or{" "}
                <span className="font-medium text-accent underline-offset-2 group-hover:underline">
                  browse files
                </span>
              </p>
            </div>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ImageIcon className="size-3.5" aria-hidden />
              JPG, PNG, or WebP · max {MAX_MB}MB · wide 3:1 works best
            </p>
          </div>
        )}
      </label>

      {selected || localError ? (
        <div className="flex flex-wrap items-center gap-2">
          {selected ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => assignFile(null)}
            >
              <X data-icon="inline-start" className="size-3.5" />
              Clear selection
            </Button>
          ) : null}
          {localError ? (
            <p role="alert" className="text-sm text-destructive">
              {localError}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Recommended: wide image around 1600×500. JPG, PNG, or WebP up to{" "}
          {MAX_MB}MB.
        </p>
      )}
    </div>
  );
}

type ShopProfileFormProps = {
  profile: SellerProfile;
  bannerPreviewUrl: string | null;
};

export function ShopProfileForm({
  profile,
  bannerPreviewUrl,
}: ShopProfileFormProps) {
  const [profileState, profileAction, profilePending] = useActionState(
    updateOwnShopProfile,
    profileInitial,
  );
  const [bannerState, bannerAction, bannerPending] = useActionState(
    updateOwnShopBanner,
    bannerInitial,
  );

  useActionToasts(profileState);
  useActionToasts(bannerState);

  const [bannerReady, setBannerReady] = useState(false);
  const publicShopHref = `/shop/${profile.slug}`;

  return (
    <div className="w-full space-y-6">
      <Card className="w-full gap-0 py-0">
        <CardContent className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Public shop URL
            </p>
            <p className="mt-1 truncate font-mono text-sm text-foreground">
              /shop/{profile.slug}
            </p>
          </div>
          <Button asChild variant="info" className="shrink-0">
            <Link href={publicShopHref} target="_blank" rel="noopener noreferrer">
              View public shop
              <ExternalLink data-icon="inline-end" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid w-full gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <Card className="w-full">
          <form action={bannerAction} className="contents">
            <CardHeader>
              <CardTitle>Banner</CardTitle>
              <CardDescription>
                Shown at the top of your public shop. Drag an image in or click to
                browse.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {bannerState.error ? (
                <p
                  role="alert"
                  className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
                >
                  {bannerState.error}
                </p>
              ) : null}

              <BannerDropzone
                name="banner"
                pending={bannerPending}
                existingPreviewUrl={bannerPreviewUrl}
                onFileReadyChange={setBannerReady}
              />
            </CardContent>
            <CardFooter className="justify-end border-t border-border pt-4">
              <Button
                type="submit"
                variant="info"
                disabled={bannerPending || !bannerReady}
              >
                {bannerPending ? (
                  <>
                    <Loader2
                      data-icon="inline-start"
                      className="animate-spin"
                    />
                    Uploading…
                  </>
                ) : (
                  <>
                    <Upload data-icon="inline-start" className="size-4" />
                    Upload banner
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="w-full">
          <form action={profileAction} className="contents">
            <CardHeader>
              <CardTitle>Shop details</CardTitle>
              <CardDescription>
                Name and bio buyers see on your storefront and product pages.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {profileState.error ? (
                <p
                  role="alert"
                  className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
                >
                  {profileState.error}
                </p>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="shopName">Shop name</Label>
                <Input
                  id="shopName"
                  name="shopName"
                  type="text"
                  required
                  maxLength={128}
                  defaultValue={profile.shopName}
                  disabled={profilePending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={8}
                  maxLength={2000}
                  defaultValue={profile.bio ?? ""}
                  placeholder="What do you sell? Who is it for?"
                  disabled={profilePending}
                  className="min-h-40 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
                />
                <p className="text-xs text-muted-foreground">
                  Up to 2000 characters. Keep it clear and buyer-friendly.
                </p>
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t border-border pt-4">
              <Button type="submit" variant="info" disabled={profilePending}>
                {profilePending ? "Saving…" : "Save shop details"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
