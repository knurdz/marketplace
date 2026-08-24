"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signUpWithEmail, type AuthActionState } from "@/lib/appwrite/auth";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = {};

export function RegisterForm({ oauthError }: { oauthError?: string }) {
  const [state, formAction, pending] = useActionState(
    signUpWithEmail,
    initialState,
  );
  const [accountType, setAccountType] = useState<"buyer" | "seller">("buyer");

  return (
    <div className="space-y-5">
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Account type</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          <label
            className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card px-3 py-3 has-[:checked]:border-foreground"
          >
            <input
              type="radio"
              name="accountType"
              value="buyer"
              checked={accountType === "buyer"}
              onChange={() => setAccountType("buyer")}
              className="mt-1"
              data-testid="register-account-buyer"
            />
            <span>
              <span className="block text-sm font-medium">Buyer</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Browse the market, cart, and checkout.
              </span>
            </span>
          </label>
          <label
            className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card px-3 py-3 has-[:checked]:border-foreground"
          >
            <input
              type="radio"
              name="accountType"
              value="seller"
              checked={accountType === "seller"}
              onChange={() => setAccountType("seller")}
              className="mt-1"
              data-testid="register-account-seller"
            />
            <span>
              <span className="block text-sm font-medium">Seller</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Apply for a shop. An admin must approve you first.
              </span>
            </span>
          </label>
        </div>
      </fieldset>

      {accountType === "seller" ? (
        <p className="text-sm text-muted-foreground">
          Continue with Google, Apple, or Facebook, then tell us about your shop.
        </p>
      ) : null}

      <OAuthButtons
        from="register"
        intent={accountType === "seller" ? "seller" : undefined}
        error={oauthError}
      />

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="accountType" value={accountType} />

        {state?.error ? (
          <p role="alert" className="rounded-lg border border-border bg-card px-3 py-2 text-sm">
            {state.error}
          </p>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" type="text" autoComplete="name" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">
            Phone <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={32}
          />
        </div>

        {accountType === "seller" ? (
          <div className="space-y-5 rounded-lg border border-border bg-card px-3 py-4">
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
              />
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
              />
            </div>
            <div className="space-y-2">
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

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={pending}
          data-testid="register-submit"
        >
          {pending
            ? "Creating account…"
            : accountType === "seller"
              ? "Apply as seller"
              : "Create account"}
        </Button>

        <p className="text-sm text-muted-foreground">
          We will email you a link to verify your address after sign-up.
        </p>

        <p className="text-sm text-muted-foreground">
          Already registered?{" "}
          <Link href="/login" className="text-foreground hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
