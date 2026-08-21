"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInWithEmail, type AuthActionState } from "@/lib/appwrite/auth";

const initialState: AuthActionState = {};

/** Same aria-invalid / describedby pattern for register/forgot/reset later. */
export function LoginForm({ nextPath }: { nextPath?: string }) {
  const [state, formAction, pending] = useActionState(
    signInWithEmail,
    initialState,
  );
  const hasError = Boolean(state?.error);
  const errorId = "login-form-error";

  return (
    <form action={formAction} className="space-y-5">
      {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}

      {state?.error ? (
        <p
          id={errorId}
          role="alert"
          className="rounded-md border border-border bg-card px-3 py-2 font-mono text-sm text-accent-bright"
        >
          {state.error}
        </p>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm text-muted-foreground">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? errorId : undefined}
          className="w-full rounded-md border border-border bg-card px-3 py-2.5 text-foreground outline-none ring-accent focus:ring-2"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm text-muted-foreground">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? errorId : undefined}
          className="w-full rounded-md border border-border bg-card px-3 py-2.5 text-foreground outline-none ring-accent focus:ring-2"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        data-testid="login-submit"
        className="inline-flex w-full items-center justify-center rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>

      <p className="font-mono text-sm text-muted-foreground">
        <Link href="/forgot-password" className="text-accent hover:underline">
          Forgot password?
        </Link>
      </p>

      <p className="font-mono text-sm text-muted-foreground">
        No account?{" "}
        <Link href="/register" className="text-accent hover:underline">
          Register
        </Link>
      </p>
    </form>
  );
}
