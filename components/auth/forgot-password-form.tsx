"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  requestPasswordRecovery,
  type RecoveryActionState,
} from "@/lib/appwrite/recovery";

const initialState: RecoveryActionState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordRecovery,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
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
        <label htmlFor="email" className="block text-sm text-muted-foreground">
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

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send reset link"}
      </button>

      <p className="font-mono text-sm text-muted-foreground">
        <Link href="/login" className="text-accent hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
