"use client";

import { useActionState } from "react";
import {
  completePasswordRecovery,
  type RecoveryActionState,
} from "@/lib/backend/recovery";
import { AuthBackLink } from "@/components/auth/auth-back-link";
import { AuthLegalLinks } from "@/components/auth/auth-legal-links";
import {
  AUTH_FIELD_CLASS,
  AUTH_PRIMARY_BUTTON_CLASS,
} from "@/components/auth/auth-form-styles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormGuardFields } from "@/components/security/form-guard-fields";
import { Turnstile } from "@/components/security/turnstile";

const initialState: RecoveryActionState = {};

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(
    completePasswordRecovery,
    initialState,
  );

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
        <FormGuardFields action="auth.password-recovery.complete" />
        <input type="hidden" name="token" value={token} />

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
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={128}
            placeholder="At least 8 characters"
            className={AUTH_FIELD_CLASS}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={128}
            placeholder="Repeat your password"
            className={AUTH_FIELD_CLASS}
          />
        </div>

        {state?.requireCaptcha ? (
          <Turnstile action="auth_recovery_complete" pending={pending} />
        ) : null}

        <Button
          type="submit"
          variant="default"
          className={AUTH_PRIMARY_BUTTON_CLASS}
          disabled={pending}
        >
          {pending ? "Updating…" : "Update password"}
        </Button>
      </form>

      <AuthBackLink href="/forgot-password">
        Request a new reset link
      </AuthBackLink>
      <AuthBackLink href="/login">Back to sign in</AuthBackLink>

      <AuthLegalLinks />
    </div>
  );
}
