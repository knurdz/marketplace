"use client";

import { useActionState } from "react";
import {
  completeRegistration,
  type CompleteRegistrationState,
} from "@/lib/appwrite/complete-registration";
import { signOut } from "@/lib/appwrite/auth";
import { AuthLegalLinks } from "@/components/auth/auth-legal-links";
import {
  AUTH_FIELD_CLASS,
  AUTH_PRIMARY_BUTTON_CLASS,
} from "@/components/auth/auth-form-styles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: CompleteRegistrationState = {};

export function CompleteRegistrationForm({
  displayName,
  phone,
  sellerIntent,
  nextPath,
}: {
  displayName: string;
  phone?: string | null;
  sellerIntent: boolean;
  nextPath?: string;
}) {
  const [state, formAction, pending] = useActionState(
    completeRegistration,
    initialState,
  );

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
        {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}

        {state?.error ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            {state.error}
          </p>
        ) : null}

        <div className="space-y-1.5">
          <Label htmlFor="displayName">Display name</Label>
          <Input
            id="displayName"
            name="displayName"
            type="text"
            autoComplete="name"
            required
            maxLength={128}
            defaultValue={displayName}
            placeholder="Your name"
            className={AUTH_FIELD_CLASS}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">
            Phone{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={32}
            defaultValue={phone ?? ""}
            placeholder="Optional"
            className={AUTH_FIELD_CLASS}
          />
        </div>

        {sellerIntent ? (
          <div className="space-y-4 rounded-lg border border-border bg-card px-3 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="shopName">Shop name</Label>
              <Input
                id="shopName"
                name="shopName"
                type="text"
                required
                maxLength={128}
                autoComplete="organization"
                placeholder="e.g. Campus Crafts"
                className={AUTH_FIELD_CLASS}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="slug">Shop URL slug (optional)</Label>
              <Input
                id="slug"
                name="slug"
                type="text"
                maxLength={128}
                autoComplete="off"
                placeholder="campus-crafts"
                className={AUTH_FIELD_CLASS}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bio">Bio (optional)</Label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                maxLength={2000}
                placeholder="What do you sell?"
                className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
          </div>
        ) : null}

        <Button
          type="submit"
          variant="default"
          className={AUTH_PRIMARY_BUTTON_CLASS}
          disabled={pending}
          data-testid="complete-registration-submit"
        >
          {pending
            ? "Saving…"
            : sellerIntent
              ? "Finish and apply as seller"
              : "Finish registration"}
        </Button>
      </form>

      <form action={signOut}>
        <Button
          type="submit"
          variant="ghost"
          className="h-11 w-full rounded-lg text-sm font-medium text-muted-foreground"
        >
          Sign out
        </Button>
      </form>

      <AuthLegalLinks />
    </div>
  );
}
