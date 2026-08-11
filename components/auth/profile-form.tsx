"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  updateOwnAvatar,
  updateOwnProfile,
  type Profile,
  type ProfileActionState,
} from "@/lib/appwrite/profiles";
import { toast } from "@/lib/ui/toast";

const initialState: ProfileActionState = {};
const avatarInitial: ProfileActionState = {};

function useActionToasts(state: ProfileActionState) {
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

export function ProfileForm({
  profile,
  avatarPreviewUrl,
}: {
  profile: Profile;
  avatarPreviewUrl: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    updateOwnProfile,
    initialState,
  );
  const [avatarState, avatarAction, avatarPending] = useActionState(
    updateOwnAvatar,
    avatarInitial,
  );

  useActionToasts(state);
  useActionToasts(avatarState);

  return (
    <div className="mt-8 space-y-10">
      <form action={avatarAction} className="space-y-5">
        <p className="font-mono text-sm text-accent">$ ./profile --avatar</p>
        <h2 className="text-xl font-bold tracking-tight">Avatar</h2>

        <div className="flex items-center gap-4">
          {avatarPreviewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- Appwrite Storage URL
            <img
              src={avatarPreviewUrl}
              alt=""
              width={64}
              height={64}
              className="h-16 w-16 rounded-md border border-border object-cover"
            />
          ) : (
            <div
              aria-hidden
              className="flex h-16 w-16 items-center justify-center rounded-md border border-border bg-card font-mono text-xs text-muted-foreground"
            >
              none
            </div>
          )}
          <div className="min-w-0 flex-1 space-y-2">
            <label htmlFor="avatar" className="block text-sm text-muted-foreground">
              Image (jpg, png, webp · max 2MB)
            </label>
            <input
              id="avatar"
              name="avatar"
              type="file"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              required
              className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-card file:px-3 file:py-1.5 file:text-foreground"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={avatarPending}
          className="inline-flex items-center justify-center rounded-md border border-border bg-transparent px-5 py-2.5 font-mono text-sm text-foreground transition hover:bg-card disabled:opacity-60"
        >
          {avatarPending ? "Uploading…" : "Upload avatar"}
        </button>
      </form>

      <form action={formAction} className="space-y-5">
        <p className="font-mono text-sm text-accent">$ ./profile --update</p>
        <h2 className="text-xl font-bold tracking-tight">Profile</h2>

        <div className="space-y-2">
          <label htmlFor="displayName" className="block text-sm text-muted-foreground">
            Display name
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            required
            maxLength={128}
            defaultValue={profile.displayName}
            className="w-full rounded-md border border-border bg-card px-3 py-2.5 text-foreground outline-none ring-accent focus:ring-2"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm text-muted-foreground">
            Phone (optional)
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            maxLength={32}
            defaultValue={profile.phone ?? ""}
            className="w-full rounded-md border border-border bg-card px-3 py-2.5 text-foreground outline-none ring-accent focus:ring-2"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="bio" className="block text-sm text-muted-foreground">
            Bio (optional)
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={3}
            maxLength={1000}
            defaultValue={profile.bio ?? ""}
            className="w-full rounded-md border border-border bg-card px-3 py-2.5 text-foreground outline-none ring-accent focus:ring-2"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save profile"}
        </button>
      </form>
    </div>
  );
}
