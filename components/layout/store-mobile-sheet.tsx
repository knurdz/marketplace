"use client";

import Link from "next/link";
import { useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { signOut } from "@/lib/backend/auth";
import {
  portalHomeForSessionUser,
  type SessionUserView,
} from "@/lib/backend/session-user";
import { BuyerAccountNav } from "@/components/store/buyer-account-nav";
import type { BuyerNavCounts } from "@/components/store/buyer-account-nav";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AvatarStorageImage } from "@/components/ui/avatar-storage-image";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { BuyerCommerceCounts } from "@/lib/services/buyer-commerce-counts";

type StoreMobileSheetProps = {
  user: SessionUserView | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  counts?: BuyerCommerceCounts | null;
};

function initialsFrom(name: string, email: string): string {
  const source = name.trim() || email.trim();
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  const letters = (parts[0]?.[0] ?? "K") + (parts[1]?.[0] ?? "");
  return letters.toUpperCase().slice(0, 2);
}

function navCounts(counts?: BuyerCommerceCounts | null): BuyerNavCounts {
  return {
    wishlist: counts?.wishlist ?? 0,
    requests: counts?.requests ?? 0,
    notifications: counts?.unreadNotifications ?? 0,
  };
}

export function StoreMobileMenu(props: StoreMobileSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open menu">
          <Menu />
        </Button>
      </SheetTrigger>
      <StoreMobileSheetContent {...props} />
    </Sheet>
  );
}

export function StoreMobileSheetContent({
  user,
  displayName,
  avatarUrl,
  counts,
}: StoreMobileSheetProps) {
  const portalHome = user ? portalHomeForSessionUser(user) : null;
  const portalLabel =
    portalHome === "/admin"
      ? "Admin portal"
      : portalHome === "/seller"
        ? "Seller portal"
        : null;

  return (
    <SheetContent
      side="right"
      showCloseButton={false}
      className="flex h-full w-full max-w-[min(100%,22rem)] flex-col gap-0 overflow-hidden border-0 bg-background p-0 shadow-none"
    >
      <SheetTitle className="sr-only">Account menu</SheetTitle>

      {user ? (
        <>
          <div className="flex items-start justify-between gap-4 px-6 pt-6">
            <div className="flex min-w-0 flex-1 items-center gap-3.5">
              <Avatar className="size-12 shrink-0">
                {avatarUrl ? <AvatarStorageImage src={avatarUrl} alt="" /> : null}
                <AvatarFallback className="bg-foreground text-sm font-semibold text-background">
                  {initialsFrom(displayName ?? user.name, user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg leading-tight font-semibold tracking-tight text-foreground">
                  {displayName?.trim() || user.name.trim() || user.email}
                </p>
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
            <SheetClose asChild>
              <button
                type="button"
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-muted/70"
                aria-label="Close menu"
              >
                <X className="size-4" strokeWidth={2} />
              </button>
            </SheetClose>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-3 pt-8">
            {portalHome ? (
              <div className="flex flex-col gap-1">
                <SheetClose asChild>
                  <Link
                    href={portalHome}
                    className="rounded-2xl px-4 py-3.5 text-lg font-medium tracking-tight text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {portalLabel}
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/account"
                    className="rounded-2xl px-4 py-3.5 text-lg font-medium tracking-tight text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                  >
                    Account
                  </Link>
                </SheetClose>
              </div>
            ) : (
              <BuyerAccountNav
                counts={navCounts(counts)}
                dismissOnNavigate
                appearance="plain"
              />
            )}
          </div>

          <div className="px-3 pb-8">
            <form action={signOut}>
              <button
                type="submit"
                className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-left text-base font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <LogOut className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
                Sign out
              </button>
            </form>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-end px-6 pt-6">
            <SheetClose asChild>
              <button
                type="button"
                className="flex size-9 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-muted/70"
                aria-label="Close menu"
              >
                <X className="size-4" strokeWidth={2} />
              </button>
            </SheetClose>
          </div>
          <div className="flex flex-1 flex-col justify-end gap-3 px-6 pb-10">
            <p className="text-3xl font-semibold tracking-tight text-foreground">
              Welcome
            </p>
            <p className="mb-4 max-w-[16rem] text-sm leading-relaxed text-muted-foreground">
              Sign in to save listings, send requests, and track updates.
            </p>
            <SheetClose asChild>
              <Button asChild className="h-12 w-full rounded-full text-base">
                <Link href="/login">Sign in</Link>
              </Button>
            </SheetClose>
            <SheetClose asChild>
              <Button
                variant="secondary"
                asChild
                className="h-12 w-full rounded-full text-base"
              >
                <Link href="/register">Create account</Link>
              </Button>
            </SheetClose>
          </div>
        </>
      )}
    </SheetContent>
  );
}
