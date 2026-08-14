"use client";

import { useActionState } from "react";
import {
  submitSellerApplication,
  type SellerApplicationActionState,
} from "@/lib/appwrite/seller-application-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: SellerApplicationActionState = {};

export function SellerApplyForm() {
  const [state, formAction, pending] = useActionState(
    submitSellerApplication,
    initialState,
  );

  return (
    <form action={formAction} className="mt-8 max-w-lg space-y-5">
      {state.error ? (
        <p
          role="alert"
          className="rounded-md border border-border bg-card px-3 py-2 font-mono text-sm text-accent-bright"
        >
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p
          role="status"
          className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
        >
          {state.success}
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
          autoComplete="organization"
          placeholder="e.g. Campus Crafts"
          disabled={Boolean(state.success)}
        />
        <p className="text-xs text-muted-foreground">
          Shown to buyers once your shop is approved.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Shop URL slug (optional)</Label>
        <Input
          id="slug"
          name="slug"
          type="text"
          maxLength={128}
          autoComplete="off"
          placeholder="campus-crafts"
          disabled={Boolean(state.success)}
        />
        <p className="text-xs text-muted-foreground">
          Lowercase letters, numbers, and hyphens. Leave blank to derive from
          shop name.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio (optional)</Label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          maxLength={2000}
          disabled={Boolean(state.success)}
          placeholder="What do you sell? Who is it for?"
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
        />
      </div>

      <Button type="submit" disabled={pending || Boolean(state.success)}>
        {pending ? "Submitting…" : "Submit application"}
      </Button>
    </form>
  );
}
