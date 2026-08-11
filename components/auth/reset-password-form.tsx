"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  completePasswordRecovery,
  type RecoveryActionState,
} from "@/lib/appwrite/recovery";

const initialState: RecoveryActionState = {};

export function ResetPasswordForm({
  userId,
  secret,
}: {
  userId: string;
  secret: string;
}) {
  const [state, formAction, pending] = useActionState(
    completePasswordRecovery,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="secret" value={secret} />

      {state?.error ? (
        <p
          role="alert"
          className="rounded-md border border-border bg-card px-3 py-2 font-mono text-sm text-accent-bright"
        >
          {state.error}
        </p>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm text-muted-foreground">
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="w-full rounded-md border border-border bg-card px-3 py-2.5 text-foreground outline-none ring-accent focus:ring-2"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="confirm" className="block text-sm text-muted-foreground">
          Confirm password
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
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
        {pending ? "Updating…" : "Update password"}
      </button>

      <p className="font-mono text-sm text-muted-foreground">
        <Link href="/forgot-password" className="text-accent hover:underline">
          Request a new link
        </Link>
      </p>
    </form>
  );
}
