"use client";

import { useRouter } from "next/navigation";
import {
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { ImagePlus, Upload } from "lucide-react";
import {
  updateOwnAvatar,
  updateOwnProfile,
  type Profile,
  type ProfileActionState,
} from "@/lib/backend/profiles";
import { AUTH_FIELD_CLASS } from "@/components/auth/auth-form-styles";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StorageImage } from "@/components/ui/storage-image";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/ui/toast";
import { FormGuardFields } from "@/components/security/form-guard-fields";
import { cn } from "@/lib/utils";

const initialState: ProfileActionState = {};
const avatarInitial: ProfileActionState = {};

function useActionToasts(state: ProfileActionState) {
  const last = useRef<string | null>(null);
  useEffect(() => {
    const key = state.error
      ? `e:${state.error}`
      : state.success
        ? `s:${state.success}`
        : null;
    if (!key || key === last.current) return;
    last.current = key;
    if (state.error) toast.error(state.error);
    else if (state.success) toast.success(state.success);
  }, [state.error, state.success]);
}

type AvatarPickerProps = {
  savedPreviewUrl: string | null;
  pending: boolean;
  error: boolean;
  errorId: string;
};

function AvatarPicker({
  savedPreviewUrl,
  pending,
  error,
  errorId,
}: AvatarPickerProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [selected, setSelected] = useState<{ name: string; size: number } | null>(
    null,
  );

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  function clearSelection() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setLocalPreview(null);
    setSelected(null);
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.files = new DataTransfer().files;
    }
  }

  function assignFile(file: File | null) {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    const dt = new DataTransfer();
    if (file) dt.items.add(file);
    if (inputRef.current) inputRef.current.files = dt.files;

    if (!file) {
      setLocalPreview(null);
      setSelected(null);
      return;
    }

    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setLocalPreview(url);
    setSelected({ name: file.name, size: file.size });
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    assignFile(file);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    event.stopPropagation();
    setDragging(false);
    if (pending) return;
    const file = event.dataTransfer.files?.[0] ?? null;
    assignFile(file);
  }

  function onDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (!pending) setDragging(true);
  }

  function onDragLeave(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (event.currentTarget.contains(event.relatedTarget as Node)) return;
    setDragging(false);
  }

  const hasNewFile = Boolean(localPreview);
  const hasSavedPhoto = Boolean(savedPreviewUrl);

  function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        id={inputId}
        name="avatar"
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        className="sr-only"
        disabled={pending}
        onChange={onInputChange}
        aria-invalid={error || undefined}
        aria-describedby={error ? errorId : undefined}
      />

      <label
        htmlFor={inputId}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragEnter={onDragOver}
        onDragLeave={onDragLeave}
        aria-disabled={pending}
        className={cn(
          "group flex w-full cursor-pointer flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-muted/15 p-5 text-center transition-colors sm:flex-row sm:items-center sm:text-left",
          dragging && "border-accent/60 bg-accent/5",
          pending && "pointer-events-none opacity-60",
        )}
      >
        <div
          className={cn(
            "relative size-28 shrink-0 overflow-hidden rounded-2xl border border-border bg-card shadow-xs ring-2 ring-background",
            !localPreview && !savedPreviewUrl && "border-dashed bg-muted/40",
          )}
        >
          {localPreview ? (
            // eslint-disable-next-line @next/next/no-img-element -- local file preview
            <img
              src={localPreview}
              alt=""
              className="size-full object-cover"
            />
          ) : savedPreviewUrl ? (
            <StorageImage
              src={savedPreviewUrl}
              alt=""
              className="size-full"
              imgClassName="object-cover"
            />
          ) : (
            <span className="flex size-full items-center justify-center text-xs text-muted-foreground">
              No photo
            </span>
          )}
          {hasNewFile ? (
            <span className="absolute inset-x-0 bottom-0 bg-foreground/75 py-1 text-center text-[10px] font-medium text-background">
              Preview
            </span>
          ) : null}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-medium text-foreground">
            {hasNewFile
              ? "Ready to save"
              : hasSavedPhoto
                ? "Your profile photo"
                : "Add a profile photo"}
          </p>
          <p className="text-xs text-muted-foreground">
            {hasNewFile && selected
              ? `${selected.name} · ${formatBytes(selected.size)}`
              : "Click here, drag an image, or use Choose image below."}
          </p>
          {hasNewFile ? (
            <p className="text-xs font-medium text-accent">
              Tap Save photo when you are happy with the preview.
            </p>
          ) : null}
        </div>

        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-xs sm:self-center">
          <ImagePlus className="size-3.5 text-muted-foreground" aria-hidden />
          {hasNewFile || hasSavedPhoto ? "Replace" : "Upload"}
        </span>
      </label>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => inputRef.current?.click()}
        >
          <Upload data-icon="inline-start" className="size-4" aria-hidden />
          Choose image
        </Button>
        <Button
          type="submit"
          variant="info"
          size="sm"
          disabled={!hasNewFile || pending}
        >
          {pending ? "Saving…" : "Save photo"}
        </Button>
        {hasNewFile && !pending ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearSelection}
          >
            Clear
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function ProfileForm({
  profile,
  avatarPreviewUrl,
}: {
  profile: Profile;
  avatarPreviewUrl: string | null;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    updateOwnProfile,
    initialState,
  );
  const [avatarState, avatarAction, avatarPending] = useActionState(
    updateOwnAvatar,
    avatarInitial,
  );
  const [avatarPickerKey, setAvatarPickerKey] = useState(0);

  useActionToasts(state);
  useActionToasts(avatarState);

  const profileError = Boolean(state.error);
  const avatarError = Boolean(avatarState.error);
  const profileErrorId = "profile-form-error";
  const avatarErrorId = "avatar-form-error";

  useEffect(() => {
    if (!avatarState.success) return;
    router.refresh();
    setAvatarPickerKey((key) => key + 1);
  }, [avatarState.success, router]);

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-border/80 shadow-none">
        <CardHeader>
          <CardTitle>Profile photo</CardTitle>
          <CardDescription>
            JPG, PNG, or WebP · max 2MB. Google and GitHub photos are used until
            you upload one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={avatarAction} className="space-y-4">
            <FormGuardFields action="account.avatar.update" />
            {avatarState.error ? (
              <p
                id={avatarErrorId}
                role="alert"
                aria-live="polite"
                className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              >
                {avatarState.error}
              </p>
            ) : null}

            <AvatarPicker
              key={avatarPickerKey}
              savedPreviewUrl={avatarPreviewUrl}
              pending={avatarPending}
              error={avatarError}
              errorId={avatarErrorId}
            />
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/80 shadow-none">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Name and phone are shared with sellers on your purchase requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-5">
            <FormGuardFields action="account.profile.update" />
            {state.error ? (
              <p
                id={profileErrorId}
                role="alert"
                aria-live="polite"
                className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              >
                {state.error}
              </p>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="displayName">Display name</Label>
              <Input
                id="displayName"
                name="displayName"
                type="text"
                required
                maxLength={128}
                defaultValue={profile.displayName}
                aria-invalid={profileError || undefined}
                aria-describedby={profileError ? profileErrorId : undefined}
                className={AUTH_FIELD_CLASS}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                maxLength={32}
                defaultValue={profile.phone ?? ""}
                aria-invalid={profileError || undefined}
                aria-describedby={profileError ? profileErrorId : undefined}
                className={AUTH_FIELD_CLASS}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio (optional)</Label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                maxLength={1000}
                defaultValue={profile.bio ?? ""}
                aria-invalid={profileError || undefined}
                aria-describedby={profileError ? profileErrorId : undefined}
                className="flex min-h-[88px] w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm shadow-none outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <Button type="submit" variant="info" disabled={pending}>
              {pending ? "Saving…" : "Save profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
