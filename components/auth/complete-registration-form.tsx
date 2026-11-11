"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  completeRegistration,
  type CompleteRegistrationFieldKey,
  type CompleteRegistrationState,
  type CompleteRegistrationValues,
} from "@/lib/backend/complete-registration";
import { signOut } from "@/lib/backend/auth";
import { AuthLegalLinks } from "@/components/auth/auth-legal-links";
import {
  AUTH_FIELD_CLASS,
  AUTH_PRIMARY_BUTTON_CLASS,
} from "@/components/auth/auth-form-styles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/ui/toast";
import { FormGuardFields } from "@/components/security/form-guard-fields";

const initialState: CompleteRegistrationState = {};

function completeFieldErrorId(field: CompleteRegistrationFieldKey): string {
  return `complete-field-error-${field}`;
}

function CompleteFieldError({
  field,
  message,
}: {
  field: CompleteRegistrationFieldKey;
  message?: string;
}) {
  if (!message) return null;
  return (
    <p
      id={completeFieldErrorId(field)}
      role="alert"
      className="text-sm text-destructive"
    >
      {message}
    </p>
  );
}

export function CompleteRegistrationForm({
  displayName,
  phone,
  sellerIntent,
  nextPath,
}: {
  displayName: string;
  phone?: string | null;
  sellerIntent: boolean;
  nextPath?: string;
}) {
  const [state, formAction, pending] = useActionState(
    completeRegistration,
    initialState,
  );
  const [fields, setFields] = useState<CompleteRegistrationValues>(() => ({
    displayName,
    phone: phone ?? "",
    shopName: "",
    slug: "",
    bio: "",
  }));
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

  function fieldAria(field: CompleteRegistrationFieldKey) {
    const message = fieldErrors?.[field];
    if (!message) return {};
    return {
      "aria-invalid": true as const,
      "aria-describedby": completeFieldErrorId(field),
    };
  }

  function patchFields(patch: Partial<CompleteRegistrationValues>) {
    setFields((current) => ({ ...current, ...patch }));
  }

  return (
    <div className="space-y-6">
      <form action={formAction} noValidate className="space-y-4">
        <FormGuardFields action="auth.registration.complete" />
        {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}

        {state?.error ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            {state.error}
          </p>
        ) : null}

        <div className="space-y-1.5">
          <Label htmlFor="displayName">Display name</Label>
          <Input
            id="displayName"
            name="displayName"
            type="text"
            autoComplete="name"
            maxLength={128}
            placeholder="Your name"
            className={AUTH_FIELD_CLASS}
            value={fields.displayName}
            onChange={(e) => patchFields({ displayName: e.target.value })}
            {...fieldAria("displayName")}
          />
          <CompleteFieldError
            field="displayName"
            message={fieldErrors?.displayName}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">
            Phone{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={32}
            placeholder="Optional"
            className={AUTH_FIELD_CLASS}
            value={fields.phone}
            onChange={(e) => patchFields({ phone: e.target.value })}
            {...fieldAria("phone")}
          />
          <CompleteFieldError field="phone" message={fieldErrors?.phone} />
        </div>

        {sellerIntent ? (
          <div className="space-y-4 rounded-lg border border-border bg-card px-3 py-4">
            <div className="space-y-1.5">
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
              <CompleteFieldError
                field="shopName"
                message={fieldErrors?.shopName}
              />
            </div>
            <div className="space-y-1.5">
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
              <CompleteFieldError field="slug" message={fieldErrors?.slug} />
            </div>
            <div className="space-y-1.5">
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
                  fieldErrors?.bio ? completeFieldErrorId("bio") : undefined
                }
              />
              <CompleteFieldError field="bio" message={fieldErrors?.bio} />
            </div>
          </div>
        ) : null}

        <Button
          type="submit"
          variant="default"
          className={AUTH_PRIMARY_BUTTON_CLASS}
          disabled={pending}
          data-testid="complete-registration-submit"
        >
          {pending
            ? "Saving…"
            : sellerIntent
              ? "Finish and apply as seller"
              : "Finish registration"}
        </Button>
      </form>

      <form action={signOut}>
        <Button
          type="submit"
          variant="ghost"
          className="h-11 w-full rounded-lg text-sm font-medium text-muted-foreground"
        >
          Sign out
        </Button>
      </form>

      <AuthLegalLinks />
    </div>
  );
}
