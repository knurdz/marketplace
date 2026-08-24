"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInWithEmail, type AuthActionState } from "@/lib/appwrite/auth";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = {};

/** Same aria-invalid / describedby pattern for register/forgot/reset later. */
export function LoginForm({
  nextPath,
  oauthError,
}: {
  nextPath?: string;
  oauthError?: string;
}) {
  const [state, formAction, pending] = useActionState(
    signInWithEmail,
    initialState,
  );
  const hasError = Boolean(state?.error);
  const errorId = "login-form-error";

  return (
    <div className="space-y-5">
      <OAuthButtons from="login" nextPath={nextPath} error={oauthError} />

      <form action={formAction} className="space-y-5">
        {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}

        {state?.error ? (
          <p
            id={errorId}
            role="alert"
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
          >
            {state.error}
          </p>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={hasError || undefined}
            aria-describedby={hasError ? errorId : undefined}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            minLength={8}
            aria-invalid={hasError || undefined}
            aria-describedby={hasError ? errorId : undefined}
          />
        </div>

        <Button type="submit" className="w-full" disabled={pending} data-testid="login-submit">
          {pending ? "Signing in…" : "Sign in"}
        </Button>

        <p className="text-sm text-muted-foreground">
          <Link href="/forgot-password" className="hover:text-foreground">
            Forgot password?
          </Link>
        </p>

        <p className="text-sm text-muted-foreground">
          New here?{" "}
          <Link href="/register" className="text-foreground hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}
