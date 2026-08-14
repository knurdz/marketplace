"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import {
  updateOwnShopBanner,
  updateOwnShopProfile,
  type ShopProfileActionState,
} from "@/lib/appwrite/seller-application-actions";
import type { SellerProfile } from "@/lib/types";
import { toast } from "@/lib/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const profileInitial: ShopProfileActionState = {};
const bannerInitial: ShopProfileActionState = {};

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

  const publicShopHref = `/shop/${profile.slug}`;

  return (
    <div className="mt-8 space-y-10">
      <div className="rounded-md border border-border bg-card px-4 py-4">
        <p className="font-mono text-xs text-muted-foreground">Public shop URL</p>
        <p className="mt-1 font-mono text-sm">/shop/{profile.slug}</p>
        <Link
          href={publicShopHref}
          className="mt-2 inline-block text-sm text-accent hover:underline"
        >
          View public shop →
        </Link>
      </div>

      <form action={bannerAction} className="space-y-5">
        <p className="font-mono text-sm text-accent">$ ./shop --banner</p>
        <h2 className="text-xl font-bold tracking-tight">Banner</h2>

        {bannerState.error ? (
          <p
            role="alert"
            className="rounded-md border border-border bg-card px-3 py-2 font-mono text-sm text-accent-bright"
          >
            {bannerState.error}
          </p>
        ) : null}

        {bannerPreviewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- Appwrite Storage URL
          <img
            src={bannerPreviewUrl}
            alt=""
            className="h-32 w-full max-w-xl rounded-md border border-border object-cover"
          />
        ) : (
          <div className="flex h-32 w-full max-w-xl items-center justify-center rounded-md border border-dashed border-border bg-muted/30 font-mono text-xs text-muted-foreground">
            No banner yet
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="banner">Upload banner</Label>
          <Input
            id="banner"
            name="banner"
            type="file"
            accept="image/jpeg,image/png,image/webp"
          />
          <p className="text-xs text-muted-foreground">
            JPG, PNG, or WebP. Max 2MB. Shown on your public shop page.
          </p>
        </div>

        <Button type="submit" disabled={bannerPending}>
          {bannerPending ? "Uploading…" : "Update banner"}
        </Button>
      </form>

      <form action={profileAction} className="max-w-lg space-y-5">
        <p className="font-mono text-sm text-accent">$ ./shop --profile</p>
        <h2 className="text-xl font-bold tracking-tight">Shop details</h2>

        {profileState.error ? (
          <p
            role="alert"
            className="rounded-md border border-border bg-card px-3 py-2 font-mono text-sm text-accent-bright"
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
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            maxLength={2000}
            defaultValue={profile.bio ?? ""}
            placeholder="What do you sell? Who is it for?"
            className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>

        <Button type="submit" disabled={profilePending}>
          {profilePending ? "Saving…" : "Save shop details"}
        </Button>
      </form>
    </div>
  );
}
