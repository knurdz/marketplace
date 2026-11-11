"use client";

import { useId, type ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FormGuardFields } from "@/components/security/form-guard-fields";

type NoteField = {
  name: string;
  label: string;
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
  rows?: number;
};

type ConfirmActionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  confirmLabel: string;
  pendingLabel?: string;
  cancelLabel?: string;
  confirmVariant?: React.ComponentProps<typeof Button>["variant"];
  pending?: boolean;
  /** Server action / useActionState dispatch for a form submit. */
  formAction?: (payload: FormData) => void;
  formGuardAction?: string;
  hiddenFields?: Record<string, string>;
  note?: NoteField;
  /** Client-side confirm (e.g. clear cart). Prefer formAction when possible. */
  onConfirm?: () => void;
  confirmTestId?: string;
  className?: string;
  children?: ReactNode;
};

export function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  pendingLabel,
  cancelLabel = "Cancel",
  confirmVariant = "default",
  pending = false,
  formAction,
  formGuardAction,
  hiddenFields,
  note,
  onConfirm,
  confirmTestId,
  className,
  children,
}: ConfirmActionDialogProps) {
  const formId = useId();
  const usesForm = Boolean(formAction);
  const titleTone =
    confirmVariant === "destructive"
      ? "text-destructive"
      : confirmVariant === "success"
        ? "text-success"
        : confirmVariant === "warning"
          ? "text-warning"
          : confirmVariant === "info"
            ? "text-info"
            : confirmVariant === "secondary"
              ? "text-secondary-foreground"
              : confirmVariant === "outline"
                ? "text-foreground"
                : "text-primary";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className={cn(
          "data-[size=default]:max-w-md data-[size=default]:sm:max-w-md",
          className,
        )}
        onDismiss={pending ? undefined : () => onOpenChange(false)}
      >
        <AlertDialogHeader className="mb-2 place-items-center gap-2.5 text-center sm:place-items-center sm:text-center">
          <AlertDialogTitle
            className={cn(
              "w-full text-center text-lg font-bold tracking-tight",
              titleTone,
            )}
          >
            {title}
          </AlertDialogTitle>
          {description ? (
            <AlertDialogDescription className="mt-1 text-center">
              {description}
            </AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>

        {usesForm ? (
          <form id={formId} action={formAction} className="space-y-3 text-center">
            {formGuardAction ? (
              <FormGuardFields action={formGuardAction} />
            ) : null}
            {hiddenFields
              ? Object.entries(hiddenFields).map(([name, value]) => (
                  <input key={name} type="hidden" name={name} value={value} />
                ))
              : null}
            {note ? (
              <label className="block space-y-1.5 text-sm text-center">
                <span className="font-medium text-foreground">{note.label}</span>
                <textarea
                  name={note.name}
                  required={note.required ?? true}
                  maxLength={note.maxLength ?? 500}
                  rows={note.rows ?? 3}
                  placeholder={note.placeholder}
                  disabled={pending}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-left text-sm shadow-none outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </label>
            ) : null}
            {children}
          </form>
        ) : children ? (
          <div className="space-y-3 text-center">{children}</div>
        ) : null}

        <AlertDialogFooter className="sm:justify-end">
          <AlertDialogCancel size="sm" disabled={pending}>
            {cancelLabel}
          </AlertDialogCancel>
          {usesForm ? (
            <Button
              type="submit"
              form={formId}
              size="sm"
              variant={confirmVariant}
              disabled={pending}
              data-testid={confirmTestId}
            >
              {pending ? (pendingLabel ?? confirmLabel) : confirmLabel}
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              variant={confirmVariant}
              disabled={pending}
              data-testid={confirmTestId}
              onClick={() => onConfirm?.()}
            >
              {pending ? (pendingLabel ?? confirmLabel) : confirmLabel}
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
