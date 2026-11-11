"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInWithEmail, type AuthActionState } from "@/lib/appwrite/auth";
import { AuthLegalLinks } from "@/components/auth/auth-legal-links";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import {
  AUTH_FIELD_CLASS,
  AUTH_PRIMARY_BUTTON_CLASS,
} from "@/components/auth/auth-form-styles";
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
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
        {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}

        {state?.error ? (
          <p
            id={errorId}
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            {state.error}
          </p>
        ) : null}

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="Enter your email"
            className={AUTH_FIELD_CLASS}
            aria-invalid={hasError || undefined}
            aria-describedby={hasError ? errorId : undefined}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            minLength={8}
            placeholder="Enter your password"
            className={AUTH_FIELD_CLASS}
            aria-invalid={hasError || undefined}
            aria-describedby={hasError ? errorId : undefined}
          />
        </div>

        <Button
          type="submit"
          variant="default"
          className={AUTH_PRIMARY_BUTTON_CLASS}
          disabled={pending}
          data-testid="login-submit"
        >
          {pending ? "Signing in…" : "Sign in with email"}
        </Button>
      </form>

      <OAuthButtons from="login" nextPath={nextPath} error={oauthError} />

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Create account
        </Link>
      </p>

      <AuthLegalLinks />
    </div>
  );
}
