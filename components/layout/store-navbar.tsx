import Link from "next/link";
import { Heart, Menu, Search, ShoppingBag } from "lucide-react";
import type { SessionUserView } from "@/lib/appwrite/session-user";
import { AccountMenu } from "@/components/layout/account-menu";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type StoreNavbarProps = {
  user: SessionUserView | null;
  cartItemCount?: number;
  displayName?: string | null;
  avatarUrl?: string | null;
};

function NavLinks({
  className,
}: {
  className?: string;
}) {
  return (
    <nav aria-label="Store" className={className}>
      <Link
        href="/market"
        className="text-sm text-muted-foreground transition hover:text-foreground"
      >
        Market
      </Link>
      <Link
        href="/categories"
        className="text-sm text-muted-foreground transition hover:text-foreground"
      >
        Categories
      </Link>
    </nav>
  );
}

function SearchForm({ className }: { className?: string }) {
  return (
    <form action="/search" method="get" className={className} role="search">
      <div className="relative min-w-0 flex-1">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          name="q"
          placeholder="Search the market"
          maxLength={64}
          aria-label="Search products"
          className="h-10 pl-9"
        />
      </div>
    </form>
  );
}

export function StoreNavbar({
  user,
  cartItemCount = 0,
  displayName,
  avatarUrl,
}: StoreNavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="shrink-0 text-sm font-semibold tracking-tight">
          Knurdz
          <span className="text-accent">.</span>
        </Link>

        <NavLinks className="hidden items-center gap-6 md:flex" />

        <SearchForm className="hidden min-w-0 flex-1 lg:flex" />

        <div className="ml-auto hidden items-center gap-1.5 md:flex">
          {user ? (
            <>
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link
                  href="/wishlist"
                  aria-label="Wishlist"
                >
                  <Heart className="size-4" aria-hidden />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link
                  href="/cart"
                  aria-label={`Cart${cartItemCount > 0 ? `, ${cartItemCount} items` : ""}`}
                >
                  <ShoppingBag className="size-4" aria-hidden />
                  {cartItemCount > 0 ? (
                    <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-primary font-mono text-[10px] text-primary-foreground">
                      {cartItemCount > 9 ? "9+" : cartItemCount}
                    </span>
                  ) : null}
                </Link>
              </Button>
              <NotificationBell className="size-10" />
              <AccountMenu
                user={user}
                displayName={displayName}
                avatarUrl={avatarUrl}
              />
            </>
          ) : (
            <>
              <Button variant="secondary" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Create account</Link>
              </Button>
            </>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1.5 md:hidden">
          {user ? <NotificationBell className="size-10" /> : null}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                aria-label="Open menu"
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader>
                <SheetTitle className="text-left">
                  Knurdz<span className="text-accent">.</span>
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-4 px-4">
                <SearchForm className="flex w-full" />
                <NavLinks className="flex flex-col gap-3" />
                <Separator />
                {user ? (
                  <div className="flex flex-col gap-2">
                    <Button asChild>
                      <Link href="/market">Go to market</Link>
                    </Button>
                    <Button variant="secondary" asChild>
                      <Link href="/cart">
                        Cart
                        {cartItemCount > 0 ? ` (${cartItemCount})` : ""}
                      </Link>
                    </Button>
                    <Button variant="secondary" asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </Button>
                    <Button variant="secondary" asChild>
                      <Link href="/account">Account</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button asChild>
                      <Link href="/register">Create account</Link>
                    </Button>
                    <Button variant="secondary" asChild>
                      <Link href="/login">Sign in</Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
