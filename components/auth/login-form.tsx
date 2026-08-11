"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInWithEmail, type AuthActionState } from "@/lib/appwrite/auth";

const initialState: AuthActionState = {};

export function LoginForm({ nextPath }: { nextPath?: string }) {
  const [state, formAction, pending] = useActionState(
    signInWithEmail,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}

      {state?.error ? (
        <p
          role="alert"
          className="rounded-md border border-border bg-card px-3 py-2 font-mono text-sm text-accent-bright"
        >
          {state.error}
        </p>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm text-muted">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-md border border-border bg-card px-3 py-2.5 text-foreground outline-none ring-accent focus:ring-2"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm text-muted">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          className="w-full rounded-md border border-border bg-card px-3 py-2.5 text-foreground outline-none ring-accent focus:ring-2"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>

      <p className="font-mono text-sm text-muted">
        <Link href="/forgot-password" className="text-accent hover:underline">
          Forgot password?
        </Link>
      </p>

      <p className="font-mono text-sm text-muted">
        No account?{" "}
        <Link href="/register" className="text-accent hover:underline">
          Register
        </Link>
      </p>
    </form>
  );
}
