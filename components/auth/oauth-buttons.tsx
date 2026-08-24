"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { startOAuth } from "@/lib/appwrite/oauth-actions";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { OAuthProviderId } from "@/lib/appwrite/oauth-providers";

type OAuthButtonsProps = {
  from: "login" | "register";
  nextPath?: string;
  intent?: "seller";
  error?: string;
};

const PROVIDERS: Array<{
  id: OAuthProviderId;
  label: string;
  icon: ReactNode;
}> = [
  {
    id: "google",
    label: "Continue with Google",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden className="size-4" data-icon="inline-start">
        <path
          fill="currentColor"
          d="M21.35 11.1h-9.17v2.98h5.27c-.23 1.5-1.78 4.4-5.27 4.4-3.18 0-5.78-2.63-5.78-5.88s2.6-5.88 5.78-5.88c1.81 0 3.03.77 3.73 1.43l2.54-2.45C16.54 4.04 14.48 3 12.18 3 7.58 3 3.86 6.8 3.86 11.5S7.58 20 12.18 20c4.96 0 8.24-3.48 8.24-8.39 0-.56-.06-1-.13-1.51Z"
        />
      </svg>
    ),
  },
  {
    id: "apple",
    label: "Continue with Apple",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden className="size-4" data-icon="inline-start">
        <path
          fill="currentColor"
          d="M16.37 12.63c.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C6.25 17 4.94 12.45 6.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81ZM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11Z"
        />
      </svg>
    ),
  },
  {
    id: "facebook",
    label: "Continue with Facebook",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden className="size-4" data-icon="inline-start">
        <path
          fill="currentColor"
          d="M14.5 8.5V6.8c0-.6.4-.7.7-.7h1.8V3h-2.5C11.7 3 11 5.1 11 6.6v1.9H9v3h2v8h3.5v-8h2.3l.3-3h-2.6Z"
        />
      </svg>
    ),
  },
];

function OAuthSubmitButton({
  provider,
  label,
  icon,
}: {
  provider: OAuthProviderId;
  label: string;
  icon: ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="outline"
      className="w-full"
      disabled={pending}
      data-testid={`oauth-${provider}`}
    >
      {icon}
      {pending ? "Redirecting…" : label}
    </Button>
  );
}

export function OAuthButtons({
  from,
  nextPath,
  intent,
  error,
}: OAuthButtonsProps) {
  return (
    <div className="space-y-3">
      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
        >
          {error}
        </p>
      ) : null}

      {PROVIDERS.map((provider) => (
        <form key={provider.id} action={startOAuth}>
          <input type="hidden" name="provider" value={provider.id} />
          <input type="hidden" name="from" value={from} />
          {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}
          {intent ? <input type="hidden" name="intent" value={intent} /> : null}
          <OAuthSubmitButton
            provider={provider.id}
            label={provider.label}
            icon={provider.icon}
          />
        </form>
      ))}

      <div className="flex items-center gap-3 pt-1">
        <Separator className="flex-1" />
        <p className="text-xs text-muted-foreground">or continue with email</p>
        <Separator className="flex-1" />
      </div>
    </div>
  );
}
