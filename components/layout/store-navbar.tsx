import Link from "next/link";
import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import type { SessionUserView } from "@/lib/appwrite/session-user";
import { BrandLogo, BrandLogoLink } from "@/components/brand/brand-logo";
import { AccountMenu } from "@/components/layout/account-menu";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { Button } from "@/components/ui/button";
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

function SearchForm({ className }: { className?: string }) {
  return (
    <form action="/search" method="get" className={className} role="search">
      <div className="relative flex w-full items-center rounded-full border border-border bg-muted/70 transition focus-within:border-accent focus-within:bg-background">
        <Search
          className="pointer-events-none absolute left-4 size-4 text-muted-foreground"
          aria-hidden
        />
        <input
          type="search"
          name="q"
          placeholder="Search listings"
          maxLength={64}
          aria-label="Search products"
          className="h-10 w-full min-w-0 rounded-full bg-transparent pr-12 pl-10 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          aria-label="Search"
          className="absolute right-1 flex size-8 items-center justify-center rounded-full bg-accent text-accent-foreground transition hover:bg-accent-deep"
        >
          <Search className="size-4" aria-hidden />
        </button>
      </div>
    </form>
  );
}

function CartLink({ cartItemCount }: { cartItemCount: number }) {
  return (
    <Button variant="ghost" size="icon" className="relative" asChild>
      <Link
        href="/cart"
        aria-label={`Cart${cartItemCount > 0 ? `, ${cartItemCount} items` : ""}`}
      >
        <ShoppingBag className="size-5" aria-hidden />
        {cartItemCount > 0 ? (
          <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-accent font-mono text-[10px] text-accent-foreground">
            {cartItemCount > 9 ? "9+" : cartItemCount}
          </span>
        ) : null}
      </Link>
    </Button>
  );
}

export function StoreNavbar({
  user,
  cartItemCount = 0,
  displayName,
  avatarUrl,
}: StoreNavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto grid h-16 w-full max-w-7xl grid-cols-[1fr_auto] items-center gap-3 px-4 sm:px-6 md:grid-cols-[1fr_minmax(0,40rem)_1fr] md:gap-6 lg:px-8">
        <div className="flex min-w-0 items-center justify-start">
          <BrandLogoLink priority />
        </div>

        <SearchForm className="hidden w-full justify-self-center md:flex" />

        <div className="hidden items-center justify-end gap-1 md:flex">
          {user ? (
            <>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/wishlist" aria-label="Wishlist">
                  <Heart className="size-5" aria-hidden />
                </Link>
              </Button>
              <CartLink cartItemCount={cartItemCount} />
              <NotificationBell className="size-10" />
              <AccountMenu
                user={user}
                displayName={displayName}
                avatarUrl={avatarUrl}
              />
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/register">Create account</Link>
              </Button>
              <Button variant="ghost" size="sm" className="gap-2" asChild>
                <Link href="/login">
                  <UserRound className="size-5" aria-hidden />
                  Sign in
                </Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-1 md:hidden">
          {user ? (
            <>
              <CartLink cartItemCount={cartItemCount} />
              <NotificationBell className="size-10" />
            </>
          ) : null}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader>
                <SheetTitle className="text-left">
                  <BrandLogo className="h-11" />
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-4 px-4">
                {user ? (
                  <div className="flex flex-col gap-2">
                    <Button variant="secondary" asChild>
                      <Link href="/cart">
                        Cart
                        {cartItemCount > 0 ? ` (${cartItemCount})` : ""}
                      </Link>
                    </Button>
                    <Button variant="secondary" asChild>
                      <Link href="/wishlist">Wishlist</Link>
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

      <div className="border-t border-border px-4 py-2 md:hidden">
        <SearchForm className="flex w-full" />
      </div>
    </header>
  );
}
