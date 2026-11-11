"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  updateOwnAvatar,
  updateOwnProfile,
  type Profile,
  type ProfileActionState,
} from "@/lib/appwrite/profiles";
import { AUTH_FIELD_CLASS } from "@/components/auth/auth-form-styles";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  const profileError = Boolean(state.error);
  const avatarError = Boolean(avatarState.error);
  const profileErrorId = "profile-form-error";
  const avatarErrorId = "avatar-form-error";

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-border/80 shadow-none">
        <CardHeader>
          <CardTitle>Avatar</CardTitle>
          <CardDescription>
            JPG, PNG, or WebP · max 2MB. Google and GitHub photos are used until you upload one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={avatarAction} className="space-y-5">
            {avatarState.error ? (
              <p
                id={avatarErrorId}
                role="alert"
                aria-live="polite"
                className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              >
                {avatarState.error}
              </p>
            ) : null}

            <div className="flex items-center gap-4">
              {avatarPreviewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- storage URL
                <img
                  src={avatarPreviewUrl}
                  alt=""
                  width={72}
                  height={72}
                  referrerPolicy="no-referrer"
                  className="size-[72px] rounded-xl border border-border object-cover"
                />
              ) : (
                <div
                  aria-hidden
                  className="flex size-[72px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 text-xs text-muted-foreground"
                >
                  No photo
                </div>
              )}
              <div className="min-w-0 flex-1 space-y-2">
                <Label htmlFor="avatar">Choose image</Label>
                <Input
                  id="avatar"
                  name="avatar"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                  required
                  aria-invalid={avatarError || undefined}
                  aria-describedby={avatarError ? avatarErrorId : undefined}
                  className={`${AUTH_FIELD_CLASS} cursor-pointer file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium`}
                />
              </div>
            </div>

            <Button type="submit" variant="info" disabled={avatarPending}>
              {avatarPending ? "Uploading…" : "Upload avatar"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/80 shadow-none">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Name and phone are shared with sellers on your purchase requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-5">
            {state.error ? (
              <p
                id={profileErrorId}
                role="alert"
                aria-live="polite"
                className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              >
                {state.error}
              </p>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="displayName">Display name</Label>
              <Input
                id="displayName"
                name="displayName"
                type="text"
                required
                maxLength={128}
                defaultValue={profile.displayName}
                aria-invalid={profileError || undefined}
                aria-describedby={profileError ? profileErrorId : undefined}
                className={AUTH_FIELD_CLASS}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                maxLength={32}
                defaultValue={profile.phone ?? ""}
                aria-invalid={profileError || undefined}
                aria-describedby={profileError ? profileErrorId : undefined}
                className={AUTH_FIELD_CLASS}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio (optional)</Label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                maxLength={1000}
                defaultValue={profile.bio ?? ""}
                aria-invalid={profileError || undefined}
                aria-describedby={profileError ? profileErrorId : undefined}
                className="flex min-h-[88px] w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm shadow-none outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <Button type="submit" variant="info" disabled={pending}>
              {pending ? "Saving…" : "Save profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
