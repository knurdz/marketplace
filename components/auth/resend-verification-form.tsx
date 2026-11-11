"use client";

import { useActionState } from "react";
import {
  requestEmailVerification,
  type RecoveryActionState,
} from "@/lib/backend/recovery";
import { AUTH_PRIMARY_BUTTON_CLASS } from "@/components/auth/auth-form-styles";
import { Button } from "@/components/ui/button";
import { FormGuardFields } from "@/components/security/form-guard-fields";
import { Turnstile } from "@/components/security/turnstile";

const initialState: RecoveryActionState = {};

export function ResendVerificationForm() {
  const [state, formAction, pending] = useActionState(
    requestEmailVerification,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-3">
      <FormGuardFields action="auth.email-verification.resend" />
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
      {state?.requireCaptcha ? (
        <Turnstile action="auth_verification_resend" pending={pending} />
      ) : null}
      <Button
        type="submit"
        variant="default"
        className={AUTH_PRIMARY_BUTTON_CLASS}
        disabled={pending}
      >
        {pending ? "Sending…" : "Resend verification email"}
      </Button>
    </form>
  );
}
