"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  submitSellerApplication,
  type SellerApplicationActionState,
} from "@/lib/appwrite/seller-application-actions";

const initialState: SellerApplicationActionState = {};

export function SellerApplyForm() {
  const [state, formAction, pending] = useActionState(
    submitSellerApplication,
    initialState,
  );

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div className="space-y-2">
        <Label htmlFor="shopName">Shop name</Label>
        <Input
          id="shopName"
          name="shopName"
          required
          maxLength={128}
          placeholder="Campus Crafts"
          autoComplete="organization"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Shop URL slug (optional)</Label>
        <Input
          id="slug"
          name="slug"
          maxLength={128}
          placeholder="campus-crafts"
          spellCheck={false}
        />
        <p className="text-xs text-muted-foreground">
          Lowercase letters, numbers, and hyphens. Defaults from shop name.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio (optional)</Label>
        <textarea
          id="bio"
          name="bio"
          maxLength={2000}
          rows={4}
          placeholder="Tell buyers about your shop…"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <p className="text-xs text-muted-foreground">
          Shown to buyers once your shop is approved.
        </p>
      </div>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-accent" role="status">
          {state.success}
        </p>
      ) : null}

      <Button type="submit" disabled={pending || Boolean(state.success)}>
        {pending ? "Submitting…" : "Submit application"}
      </Button>
    </form>
  );
}
