"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import {
  signUpWithEmail,
  type AuthActionState,
  type RegisterFieldKey,
  type RegisterFormValues,
} from "@/lib/backend/auth";
import { AuthLegalLinks } from "@/components/auth/auth-legal-links";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import {
  AUTH_FIELD_CLASS,
  AUTH_PRIMARY_BUTTON_CLASS,
} from "@/components/auth/auth-form-styles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/ui/toast";
import { FormGuardFields } from "@/components/security/form-guard-fields";
import { Turnstile } from "@/components/security/turnstile";

const initialState: AuthActionState = {};

const emptyValues: RegisterFormValues = {
  accountType: "buyer",
  name: "",
  email: "",
  phone: "",
  shopName: "",
  slug: "",
  bio: "",
};

function fieldErrorId(field: RegisterFieldKey): string {
  return `register-field-error-${field}`;
}

function RegisterFieldError({
  field,
  message,
}: {
  field: RegisterFieldKey;
  message?: string;
}) {
  if (!message) return null;
  return (
    <p
      id={fieldErrorId(field)}
      role="alert"
      className="text-sm text-destructive"
    >
      {message}
    </p>
  );
}

export function RegisterForm({ oauthError }: { oauthError?: string }) {
  const [state, formAction, pending] = useActionState(
    signUpWithEmail,
    initialState,
  );
  const [fields, setFields] = useState<RegisterFormValues>(emptyValues);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const lastToast = useRef<string | null>(null);

  useEffect(() => {
    if (state?.values) {
      setFields(state.values);
    }
  }, [state?.values]);

  useEffect(() => {
    if (!state?.error) return;
    const key = `e:${state.error}`;
    if (key === lastToast.current) return;
    lastToast.current = key;
    toast.error(state.error);
  }, [state?.error]);

  const fieldErrors = state?.fieldErrors;

  function fieldAria(field: RegisterFieldKey) {
    const message = fieldErrors?.[field];
    if (!message) return {};
    return {
      "aria-invalid": true as const,
      "aria-describedby": fieldErrorId(field),
    };
  }

  function patchFields(patch: Partial<RegisterFormValues>) {
    setFields((current) => ({ ...current, ...patch }));
  }

  return (
    <div className="space-y-4">
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Account type</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card px-3 py-3 has-[:checked]:border-foreground">
            <input
              type="radio"
              name="accountTypePicker"
              value="buyer"
              checked={fields.accountType === "buyer"}
              onChange={() => patchFields({ accountType: "buyer" })}
              className="mt-1"
              data-testid="register-account-buyer"
            />
            <span>
              <span className="block text-sm font-medium">Buyer</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Browse the market and send buy requests to sellers.
              </span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card px-3 py-3 has-[:checked]:border-foreground">
            <input
              type="radio"
              name="accountTypePicker"
              value="seller"
              checked={fields.accountType === "seller"}
              onChange={() => patchFields({ accountType: "seller" })}
              className="mt-1"
              data-testid="register-account-seller"
            />
            <span>
              <span className="block text-sm font-medium">Seller</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Apply for a shop. An admin must approve you first.
              </span>
            </span>
          </label>
        </div>
        {fieldErrors?.accountType ? (
          <p
            id={fieldErrorId("accountType")}
            role="alert"
            className="text-sm text-destructive"
          >
            {fieldErrors.accountType}
          </p>
        ) : null}
      </fieldset>

      <form action={formAction} noValidate className="space-y-4">
        <FormGuardFields action="auth.register" />
        <input type="hidden" name="accountType" value={fields.accountType} />

        {state?.error ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            {state.error}
          </p>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            className={AUTH_FIELD_CLASS}
            value={fields.name}
            onChange={(e) => patchFields({ name: e.target.value })}
            {...fieldAria("name")}
          />
          <RegisterFieldError field="name" message={fieldErrors?.name} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            className={AUTH_FIELD_CLASS}
            value={fields.email}
            onChange={(e) => patchFields({ email: e.target.value })}
            {...fieldAria("email")}
          />
          <RegisterFieldError field="email" message={fieldErrors?.email} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={32}
            placeholder="e.g. 077 123 4567"
            className={AUTH_FIELD_CLASS}
            value={fields.phone}
            onChange={(e) => patchFields({ phone: e.target.value })}
            {...fieldAria("phone")}
          />
          <RegisterFieldError field="phone" message={fieldErrors?.phone} />
        </div>

        {fields.accountType === "seller" ? (
          <div className="space-y-4 rounded-lg border border-border bg-card px-3 py-4">
            <div className="space-y-2">
              <Label htmlFor="shopName">Shop name</Label>
              <Input
                id="shopName"
                name="shopName"
                type="text"
                maxLength={128}
                autoComplete="organization"
                placeholder="e.g. Campus Crafts"
                className={AUTH_FIELD_CLASS}
                value={fields.shopName}
                onChange={(e) => patchFields({ shopName: e.target.value })}
                {...fieldAria("shopName")}
              />
              <RegisterFieldError
                field="shopName"
                message={fieldErrors?.shopName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Shop URL slug (optional)</Label>
              <Input
                id="slug"
                name="slug"
                type="text"
                maxLength={128}
                autoComplete="off"
                placeholder="campus-crafts"
                className={AUTH_FIELD_CLASS}
                value={fields.slug}
                onChange={(e) => patchFields({ slug: e.target.value })}
                {...fieldAria("slug")}
              />
              <RegisterFieldError field="slug" message={fieldErrors?.slug} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio (optional)</Label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                maxLength={2000}
                placeholder="What do you sell?"
                className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                value={fields.bio}
                onChange={(e) => patchFields({ bio: e.target.value })}
                aria-invalid={fieldErrors?.bio ? true : undefined}
                aria-describedby={
                  fieldErrors?.bio ? fieldErrorId("bio") : undefined
                }
              />
              <RegisterFieldError field="bio" message={fieldErrors?.bio} />
            </div>
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            maxLength={128}
            placeholder="At least 8 characters"
            className={AUTH_FIELD_CLASS}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            {...fieldAria("password")}
          />
          <RegisterFieldError field="password" message={fieldErrors?.password} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            maxLength={128}
            placeholder="Repeat your password"
            className={AUTH_FIELD_CLASS}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            {...fieldAria("confirm")}
          />
          <RegisterFieldError field="confirm" message={fieldErrors?.confirm} />
        </div>

        {state?.requireCaptcha ? (
          <Turnstile action="auth_register" pending={pending} />
        ) : null}

        <Button
          type="submit"
          variant="default"
          className={AUTH_PRIMARY_BUTTON_CLASS}
          disabled={pending}
          data-testid="register-submit"
        >
          {pending
            ? "Creating account…"
            : fields.accountType === "seller"
              ? "Apply as seller"
              : "Create account"}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          We will email you a link to verify your address after sign-up.
        </p>
      </form>

      <OAuthButtons
        from="register"
        intent={fields.accountType === "seller" ? "seller" : undefined}
        error={oauthError}
      />

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>

      <AuthLegalLinks />
    </div>
  );
}
