"use client";

import { useActionState } from "react";
import {
  updateOwnProfile,
  type Profile,
  type ProfileActionState,
} from "@/lib/appwrite/profiles";

const initialState: ProfileActionState = {};

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction, pending] = useActionState(
    updateOwnProfile,
    initialState,
  );

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <p className="font-mono text-sm text-accent">$ ./profile --update</p>
      <h2 className="text-xl font-bold tracking-tight">Profile</h2>

      {state?.error ? (
        <p
          role="alert"
          className="rounded-md border border-border bg-card px-3 py-2 font-mono text-sm text-accent-bright"
        >
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p
          role="status"
          className="rounded-md border border-border bg-card px-3 py-2 font-mono text-sm text-accent"
        >
          {state.success}
        </p>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="displayName" className="block text-sm text-muted">
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
        <label htmlFor="phone" className="block text-sm text-muted">
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
        <label htmlFor="bio" className="block text-sm text-muted">
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
  );
}
