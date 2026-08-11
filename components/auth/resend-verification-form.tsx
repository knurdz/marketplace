"use client";

import { useActionState } from "react";
import {
  requestEmailVerification,
  type RecoveryActionState,
} from "@/lib/appwrite/recovery";

const initialState: RecoveryActionState = {};

export function ResendVerificationForm() {
  const [state, formAction, pending] = useActionState(
    requestEmailVerification,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-3">
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
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 font-mono text-sm transition hover:bg-card disabled:opacity-60"
      >
        {pending ? "Sending…" : "Resend verification email"}
      </button>
    </form>
  );
}
