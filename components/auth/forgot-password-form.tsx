"use client";

import { useActionState } from "react";
import {
  requestPasswordRecovery,
  type RecoveryActionState,
} from "@/lib/appwrite/recovery";
import { AuthBackLink } from "@/components/auth/auth-back-link";
import { AuthLegalLinks } from "@/components/auth/auth-legal-links";
import {
  AUTH_FIELD_CLASS,
  AUTH_PRIMARY_BUTTON_CLASS,
} from "@/components/auth/auth-form-styles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: RecoveryActionState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordRecovery,
    initialState,
  );

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
        {state?.error ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            {state.error}
          </p>
        ) : null}
        {state?.success ? (
          <p
            role="status"
            className="rounded-lg border border-green-600/30 bg-green-600/5 px-3 py-2 text-sm text-green-800 dark:text-green-300"
          >
            {state.success}
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
          />
        </div>

        <Button
          type="submit"
          variant="default"
          className={AUTH_PRIMARY_BUTTON_CLASS}
          disabled={pending}
        >
          {pending ? "Sending…" : "Send reset link"}
        </Button>
      </form>

      <AuthBackLink href="/login">Back to sign in</AuthBackLink>

      <AuthLegalLinks />
    </div>
  );
}
